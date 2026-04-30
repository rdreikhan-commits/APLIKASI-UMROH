<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\DistribusiPerlengkapan;
use App\Models\MasterPerlengkapan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\PerlengkapanLog;
use App\Models\PengajuanPerlengkapan;

/**
 * =====================================================
 * EQUIPMENT CONTROLLER (Admin Perlengkapan)
 * =====================================================
 *
 * Controller untuk:
 * 1. CRUD Master Perlengkapan (inventory)
 * 2. Melihat list jamaah confirmed yang perlu diberi barang
 * 3. Handover Equipment — menandai barang sudah diserahkan
 * 4. Laporan stok per jadwal/kloter
 *
 * ⚠️ CRITICAL PROCESS: handoverEquipment()
 * Proses ini melibatkan 2 tabel dalam satu transaksi:
 * - distribusi_perlengkapan (update status → diserahkan)
 * - master_perlengkapan (decrement stok_gudang)
 */
class EquipmentController extends Controller
{
    // ═════════════════════════════════════════════
    // MASTER PERLENGKAPAN CRUD
    // ═════════════════════════════════════════════

    /**
     * List semua barang perlengkapan.
     * GET /api/admin/perlengkapan/master
     */
    public function index(Request $request): JsonResponse
    {
        $query = MasterPerlengkapan::query();

        if ($request->has('search')) {
            $query->where('nama_barang', 'like', "%{$request->search}%");
        }

        if ($request->boolean('low_stock_only')) {
            $query->lowStock();
        }

        $perlengkapan = $query->orderBy('nama_barang')->get();

        return response()->json([
            'success' => true,
            'data'    => $perlengkapan,
        ]);
    }

    /**
     * Tambah barang baru.
     * POST /api/admin/perlengkapan/master
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_barang'  => 'required|string|max:150',
            'kode_barang'  => 'required|string|max:30|unique:master_perlengkapan,kode_barang',
            'deskripsi'    => 'nullable|string',
            'satuan'       => 'nullable|string|max:30',
            'stok_gudang'  => 'required|integer|min:0',
            'stok_minimum' => 'nullable|integer|min:0',
        ]);

        $perlengkapan = MasterPerlengkapan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Barang perlengkapan berhasil ditambahkan.',
            'data'    => $perlengkapan,
        ], 201);
    }

    /**
     * Update barang.
     * PUT /api/admin/perlengkapan/master/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $perlengkapan = MasterPerlengkapan::findOrFail($id);

        $validated = $request->validate([
            'nama_barang'  => 'sometimes|string|max:150',
            'kode_barang'  => "sometimes|string|max:30|unique:master_perlengkapan,kode_barang,{$id}",
            'deskripsi'    => 'nullable|string',
            'satuan'       => 'nullable|string|max:30',
            'stok_gudang'  => 'sometimes|integer|min:0',
            'stok_minimum' => 'nullable|integer|min:0',
            'is_active'    => 'sometimes|boolean',
        ]);

        $perlengkapan->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Barang perlengkapan berhasil diperbarui.',
            'data'    => $perlengkapan->fresh(),
        ]);
    }

    /**
     * Hapus barang (soft delete).
     * DELETE /api/admin/perlengkapan/master/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $perlengkapan = MasterPerlengkapan::findOrFail($id);
        $perlengkapan->delete();

        return response()->json([
            'success' => true,
            'message' => "Barang '{$perlengkapan->nama_barang}' berhasil dihapus.",
        ]);
    }

    // ═════════════════════════════════════════════
    // LIST JAMAAH CONFIRMED (BUTUH PERLENGKAPAN)
    // ═════════════════════════════════════════════

    /**
     * Menampilkan list jamaah yang sudah CONFIRMED
     * beserta status distribusi perlengkapannya.
     *
     * GET /api/admin/perlengkapan/distribusi
     */
    public function distribusiList(Request $request): JsonResponse
    {
        $query = Booking::with([
            'user:id,nama,email,no_hp',
            'jadwal:id,kode_jadwal,tanggal_berangkat',
            'jadwal.paket:id,nama_paket',
            'distribusiPerlengkapan.perlengkapan:id,nama_barang,kode_barang',
            'distribusiPerlengkapan.distributor:id,nama',
        ])
        ->where('status', 'confirmed');

        // Filter by jadwal
        if ($request->has('jadwal_id')) {
            $query->where('jadwal_id', $request->jadwal_id);
        }

        // Filter by distribusi status (belum diserahkan semua)
        if ($request->boolean('pending_only')) {
            $query->whereHas('distribusiPerlengkapan', function ($q) {
                $q->where('status_penyerahan', 'pending');
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $bookings,
        ]);
    }

    /**
     * ═════════════════════════════════════════════════════════
     * ✅ HANDOVER EQUIPMENT — CORE INTEGRATION LOGIC
     * ═════════════════════════════════════════════════════════
     *
     * POST /api/admin/perlengkapan/distribusi/{id}/handover
     *
     * FLOW KRITIS:
     * 1. Validasi distribusi masih 'pending'
     * 2. Validasi stok gudang mencukupi
     * 3. Update status distribusi → 'diserahkan' / 'dikirim'
     * 4. DECREMENT stok_gudang di master_perlengkapan (ATOMIC)
     *
     * ⚠️ SEMUA OPERASI DIBUNGKUS DALAM DB::transaction()
     *    UNTUK MENJAGA KONSISTENSI DATA.
     *
     * ⚠️ PESSIMISTIC LOCKING pada row master_perlengkapan
     *    untuk mencegah stok menjadi negatif akibat
     *    concurrent handover dari 2 admin berbeda.
     *
     * @param Request $request
     * @param int $id distribusi_perlengkapan.id
     */
    public function handoverEquipment(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status_penyerahan' => 'required|in:diserahkan,dikirim',
            'catatan'           => 'nullable|string|max:500',
        ]);

        try {
            $result = DB::transaction(function () use ($request, $id) {

                // ── STEP 1: Ambil record distribusi + lock row ──
                // lockForUpdate() = PESSIMISTIC LOCK
                // Mencegah record yang sama di-handover 2x bersamaan
                $distribusi = DistribusiPerlengkapan::lockForUpdate()->findOrFail($id);

                // Validasi: hanya bisa handover yang masih pending
                if ($distribusi->status_penyerahan !== 'pending') {
                    throw new \Exception(
                        "Barang ini sudah berstatus '{$distribusi->status_penyerahan}'. Tidak bisa diproses ulang.",
                        422
                    );
                }

                // ── STEP 2: Lock dan cek stok gudang ──
                // PESSIMISTIC LOCK pada row master_perlengkapan
                // untuk mencegah stok negatif saat concurrent access
                $perlengkapan = MasterPerlengkapan::lockForUpdate()
                    ->findOrFail($distribusi->perlengkapan_id);

                if ($perlengkapan->stok_gudang < $distribusi->jumlah) {
                    throw new \Exception(
                        "Stok '{$perlengkapan->nama_barang}' tidak mencukupi. " .
                        "Tersisa: {$perlengkapan->stok_gudang}, Dibutuhkan: {$distribusi->jumlah}.",
                        409
                    );
                }

                // ── STEP 3: Update status distribusi ──
                $distribusi->update([
                    'status_penyerahan' => $request->status_penyerahan,
                    'tgl_penyerahan'    => now(),
                    'distributed_by'    => $request->user()->id,
                    'catatan'           => $request->catatan ?? $distribusi->catatan,
                ]);

                // ── STEP 4: DECREMENT stok_gudang (ATOMIC) ──
                // Menggunakan decrement() Laravel = UPDATE SET stok = stok - N
                // Query SQL: UPDATE master_perlengkapan SET stok_gudang = stok_gudang - 1 WHERE id = ?
                // Ini atomic di level database, aman dari race condition.
                $perlengkapan->decrement('stok_gudang', $distribusi->jumlah);

                Log::info("Equipment handed over", [
                    'distribusi_id'  => $distribusi->id,
                    'barang'         => $perlengkapan->nama_barang,
                    'jumlah'         => $distribusi->jumlah,
                    'sisa_stok'      => $perlengkapan->fresh()->stok_gudang,
                    'admin_id'       => $request->user()->id,
                ]);

                // ── STEP 5: Cek stok minimum (alert) ──
                $lowStockWarning = null;
                $freshStock = $perlengkapan->fresh();
                if ($freshStock->isLowStock()) {
                    $lowStockWarning = "⚠️ Stok '{$perlengkapan->nama_barang}' sudah rendah! " .
                                      "Sisa: {$freshStock->stok_gudang} (minimum: {$freshStock->stok_minimum})";

                    Log::warning("LOW STOCK ALERT: {$perlengkapan->nama_barang}", [
                        'perlengkapan_id' => $perlengkapan->id,
                        'stok_gudang'     => $freshStock->stok_gudang,
                        'stok_minimum'    => $freshStock->stok_minimum,
                    ]);
                }

                return [
                    'distribusi'       => $distribusi->fresh()->load([
                        'perlengkapan:id,nama_barang,stok_gudang',
                        'booking.user:id,nama',
                        'distributor:id,nama',
                    ]),
                    'low_stock_warning' => $lowStockWarning,
                ];

            }); // END DB::transaction

            return response()->json([
                'success'            => true,
                'message'            => 'Barang berhasil diserahkan ke jamaah.',
                'data'               => $result['distribusi'],
                'low_stock_warning'  => $result['low_stock_warning'],
            ]);

        } catch (\Exception $e) {
            Log::error('handoverEquipment FAILED', [
                'distribusi_id' => $id,
                'error'         => $e->getMessage(),
            ]);

            $statusCode = is_numeric($e->getCode()) && $e->getCode() >= 400
                ? (int) $e->getCode()
                : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * ─────────────────────────────────────────────
     * BATCH HANDOVER
     * ─────────────────────────────────────────────
     * Serahkan SEMUA perlengkapan pending untuk satu booking sekaligus.
     *
     * POST /api/admin/perlengkapan/distribusi/batch-handover
     */
    public function batchHandover(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id'        => 'required|exists:bookings,id',
            'status_penyerahan' => 'required|in:diserahkan,dikirim',
            'catatan'           => 'nullable|string|max:500',
        ]);

        try {
            $result = DB::transaction(function () use ($request) {
                $booking = Booking::findOrFail($request->booking_id);

                if ($booking->status !== 'confirmed') {
                    throw new \Exception('Booking belum confirmed. Tidak bisa menyerahkan barang.', 422);
                }

                // Ambil semua distribusi pending untuk booking ini
                $distribusiPending = DistribusiPerlengkapan::where('booking_id', $booking->id)
                    ->where('status_penyerahan', 'pending')
                    ->lockForUpdate()
                    ->get();

                if ($distribusiPending->isEmpty()) {
                    throw new \Exception('Tidak ada barang pending untuk booking ini.', 404);
                }

                $handedOver = [];
                $warnings   = [];

                foreach ($distribusiPending as $distribusi) {
                    // Lock stok barang
                    $perlengkapan = MasterPerlengkapan::lockForUpdate()
                        ->findOrFail($distribusi->perlengkapan_id);

                    if ($perlengkapan->stok_gudang < $distribusi->jumlah) {
                        $warnings[] = "Stok '{$perlengkapan->nama_barang}' tidak cukup (sisa: {$perlengkapan->stok_gudang}).";
                        continue; // Skip barang ini, lanjut ke barang berikutnya
                    }

                    // Update distribusi
                    $distribusi->update([
                        'status_penyerahan' => $request->status_penyerahan,
                        'tgl_penyerahan'    => now(),
                        'distributed_by'    => $request->user()->id,
                        'catatan'           => $request->catatan,
                    ]);

                    // Decrement stok (atomic)
                    $perlengkapan->decrement('stok_gudang', $distribusi->jumlah);

                    $handedOver[] = $perlengkapan->nama_barang;

                    // Cek low stock
                    if ($perlengkapan->fresh()->isLowStock()) {
                        $warnings[] = "⚠️ Stok '{$perlengkapan->nama_barang}' sudah rendah!";
                    }
                }

                return [
                    'handed_over_count' => count($handedOver),
                    'handed_over_items' => $handedOver,
                    'warnings'          => $warnings,
                ];
            });

            return response()->json([
                'success'  => true,
                'message'  => "{$result['handed_over_count']} barang berhasil diserahkan.",
                'data'     => $result,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], is_numeric($e->getCode()) && $e->getCode() >= 400 ? (int) $e->getCode() : 500);
        }
    }

    /**
     * ─────────────────────────────────────────────
     * LAPORAN STOK PER JADWAL/KLOTER
     * ─────────────────────────────────────────────
     *
     * GET /api/admin/perlengkapan/laporan/stok
     *
     * Menampilkan tracking barang keluar berdasarkan kloter/jadwal.
     */
    public function laporanStok(Request $request): JsonResponse
    {
        $request->validate([
            'jadwal_id' => 'nullable|exists:jadwal,id',
        ]);

        // Laporan per barang: berapa yang sudah diserahkan vs pending
        $query = MasterPerlengkapan::withCount([
            'distribusi as total_distribusi',
            'distribusi as total_diserahkan' => function ($q) use ($request) {
                $q->whereIn('status_penyerahan', ['diserahkan', 'dikirim']);
                if ($request->has('jadwal_id')) {
                    $q->byJadwal($request->jadwal_id);
                }
            },
            'distribusi as total_pending' => function ($q) use ($request) {
                $q->where('status_penyerahan', 'pending');
                if ($request->has('jadwal_id')) {
                    $q->byJadwal($request->jadwal_id);
                }
            },
        ]);

        $laporan = $query->get()->map(function ($item) {
            return [
                'id'               => $item->id,
                'kode_barang'      => $item->kode_barang,
                'nama_barang'      => $item->nama_barang,
                'stok_gudang'      => $item->stok_gudang,
                'stok_minimum'     => $item->stok_minimum,
                'total_distribusi' => $item->total_distribusi,
                'total_diserahkan' => $item->total_diserahkan,
                'total_pending'    => $item->total_pending,
                'is_low_stock'     => $item->isLowStock(),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $laporan,
            'summary' => [
                'total_barang'          => $laporan->count(),
                'total_low_stock'       => $laporan->where('is_low_stock', true)->count(),
                'total_pending_overall' => $laporan->sum('total_pending'),
            ],
        ]);
    }

    // ════════════════════════════════════════════════════════════════
    // STOK LOG (Manual Edit Stok dengan Realtime Tracking)
    // ════════════════════════════════════════════════════════════════
    public function storeLog(Request $request, $id): JsonResponse
    {
        $perlengkapan = MasterPerlengkapan::findOrFail($id);
        $validated = $request->validate([
            'jenis_log' => 'required|in:masuk,keluar,rusak,hilang,pinjam',
            'qty' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
        ]);

        DB::transaction(function() use ($perlengkapan, $validated, $id) {
            $validated['perlengkapan_id'] = $id;
            PerlengkapanLog::create($validated);
            
            if ($validated['jenis_log'] === 'masuk') {
                $perlengkapan->increment('stok_gudang', $validated['qty']);
            } else {
                if ($perlengkapan->stok_gudang < $validated['qty']) {
                    throw new \Exception('Stok tidak mencukupi untuk dikeluarkan/hilang/rusak.');
                }
                $perlengkapan->decrement('stok_gudang', $validated['qty']);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Log stok berhasil ditambahkan & stok terupdate.',
            'data' => $perlengkapan->fresh()
        ]);
    }

    // ════════════════════════════════════════════════════════════════
    // PENGAJUAN PERLENGKAPAN (Keuangan & Manager Integration)
    // ════════════════════════════════════════════════════════════════
    public function pengajuanIndex(): JsonResponse
    {
        $data = PengajuanPerlengkapan::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function pengajuanStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'jenis_barang' => 'required|string',
            'qty' => 'required|integer|min:1',
            'harga_satuan' => 'required|numeric|min:0',
            'catatan' => 'nullable|string'
        ]);

        $validated['total_harga'] = $validated['qty'] * $validated['harga_satuan'];
        $validated['status'] = 'pending'; // await manager ACC

        $pengajuan = PengajuanPerlengkapan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil dikirim, menunggu ACC Manager.',
            'data' => $pengajuan
        ]);
    }

    public function pengajuanUpdateStatus(Request $request, $id): JsonResponse
    {
        $pengajuan = PengajuanPerlengkapan::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:pending,acc_manager,dicairkan,diambil'
        ]);

        $pengajuan->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Status pengajuan diupdate menjadi ' . $validated['status'],
            'data' => $pengajuan
        ]);
    }
}
