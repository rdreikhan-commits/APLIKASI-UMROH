<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Agent, BonusAgent, Booking, Karyawan, Maskapai, Hotel, Mitra, Layanan, Pengeluaran, Pemasukan};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasterDataController extends Controller
{
    // ══════════════════════════════════════
    // MASKAPAI
    // ══════════════════════════════════════
    public function maskapaiIndex()
    {
        return response()->json(['success' => true, 'data' => Maskapai::orderBy('nama_maskapai')->get()]);
    }

    public function maskapaiStore(Request $request)
    {
        $data = $request->validate(['kode_maskapai' => 'required|unique:maskapai', 'nama_maskapai' => 'required|max:100', 'logo_path' => 'nullable']);
        $item = Maskapai::create($data);
        return response()->json(['success' => true, 'message' => 'Maskapai ditambahkan.', 'data' => $item], 201);
    }

    public function maskapaiUpdate(Request $request, $id)
    {
        $item = Maskapai::findOrFail($id);
        $item->update($request->only(['kode_maskapai', 'nama_maskapai', 'logo_path', 'is_active']));
        return response()->json(['success' => true, 'message' => 'Maskapai diupdate.', 'data' => $item]);
    }

    public function maskapaiDestroy($id)
    {
        Maskapai::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Maskapai dihapus.']);
    }

    // ══════════════════════════════════════
    // HOTEL
    // ══════════════════════════════════════
    public function hotelIndex(Request $request)
    {
        $q = Hotel::orderBy('nama_hotel');
        if ($request->kota) $q->where('kota', $request->kota);
        return response()->json(['success' => true, 'data' => $q->get()]);
    }

    public function hotelStore(Request $request)
    {
        $data = $request->validate([
            'nama_hotel' => 'required|max:150', 'kota' => 'required|in:makkah,madinah',
            'rating' => 'in:3,4,5', 'alamat' => 'nullable', 'jarak_ke_masjid' => 'nullable',
        ]);
        $item = Hotel::create($data);
        return response()->json(['success' => true, 'message' => 'Hotel ditambahkan.', 'data' => $item], 201);
    }

    public function hotelUpdate(Request $request, $id)
    {
        $item = Hotel::findOrFail($id);
        $item->update($request->only(['nama_hotel', 'kota', 'rating', 'alamat', 'jarak_ke_masjid', 'is_active']));
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function hotelDestroy($id)
    {
        Hotel::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Hotel dihapus.']);
    }

    // ══════════════════════════════════════
    // AGENT
    // ══════════════════════════════════════
    public function agentIndex()
    {
        $agents = Agent::with('user')->withCount('bookings')
            ->withSum(['bonuses as total_bonus_pending' => fn($q) => $q->where('status', 'pending')], 'nominal_bonus')
            ->withSum(['bonuses as total_bonus_dibayar' => fn($q) => $q->where('status', 'dibayar')], 'nominal_bonus')
            ->get();
        return response()->json(['success' => true, 'data' => $agents]);
    }

    public function agentStore(Request $request)
    {
        $data = $request->validate([
            'nama_agent' => 'required|max:150', 'no_hp' => 'nullable', 'alamat' => 'nullable',
            'tipe_bonus' => 'in:persentase,nominal', 'persentase_bonus' => 'nullable|numeric',
            'nominal_bonus_per_jamaah' => 'nullable|numeric', 'user_id' => 'nullable|exists:users,id',
        ]);
        $data['kode_agent'] = Agent::generateKode();
        $agent = Agent::create($data);
        return response()->json(['success' => true, 'message' => 'Agent ditambahkan.', 'data' => $agent], 201);
    }

    public function agentUpdate(Request $request, $id)
    {
        $agent = Agent::findOrFail($id);
        $agent->update($request->only(['nama_agent', 'no_hp', 'alamat', 'tipe_bonus', 'persentase_bonus', 'nominal_bonus_per_jamaah', 'status']));
        return response()->json(['success' => true, 'data' => $agent]);
    }

    public function agentDestroy($id)
    {
        Agent::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Agent dihapus.']);
    }

    // ── Bonus Agent ──
    public function bonusIndex(Request $request)
    {
        $q = BonusAgent::with(['agent', 'booking.user', 'booking.jadwal.paket']);
        if ($request->status) $q->where('status', $request->status);
        if ($request->agent_id) $q->where('agent_id', $request->agent_id);
        return response()->json(['success' => true, 'data' => $q->latest()->get()]);
    }

    public function bayarBonus($id)
    {
        $bonus = BonusAgent::findOrFail($id);
        if ($bonus->status === 'dibayar') {
            return response()->json(['success' => false, 'message' => 'Bonus sudah dibayar.'], 422);
        }
        $bonus->update(['status' => 'dibayar', 'tgl_bayar' => now(), 'paid_by' => auth()->id()]);
        return response()->json(['success' => true, 'message' => 'Bonus dibayarkan.', 'data' => $bonus]);
    }

    // ══════════════════════════════════════
    // KARYAWAN
    // ══════════════════════════════════════
    public function karyawanIndex()
    {
        return response()->json(['success' => true, 'data' => Karyawan::with('user')->get()]);
    }

    public function karyawanStore(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|max:150', 'jabatan' => 'nullable', 'departemen' => 'required|in:operasional,keuangan,marketing,gudang',
            'no_hp' => 'nullable', 'alamat' => 'nullable', 'gaji' => 'nullable|numeric', 'tanggal_masuk' => 'nullable|date',
        ]);
        $data['kode_karyawan'] = Karyawan::generateKode();
        $item = Karyawan::create($data);
        return response()->json(['success' => true, 'message' => 'Karyawan ditambahkan.', 'data' => $item], 201);
    }

    public function karyawanUpdate(Request $request, $id)
    {
        $item = Karyawan::findOrFail($id);
        $item->update($request->only(['nama', 'jabatan', 'departemen', 'no_hp', 'alamat', 'gaji', 'tanggal_masuk', 'status']));
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function karyawanDestroy($id)
    {
        Karyawan::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Karyawan dihapus.']);
    }

    // ══════════════════════════════════════
    // PENGELUARAN & PEMASUKAN
    // ══════════════════════════════════════
    public function pengeluaranIndex(Request $request)
    {
        $q = Pengeluaran::with(['jadwal.paket', 'creator']);
        if ($request->jadwal_id) $q->where('jadwal_id', $request->jadwal_id);
        if ($request->kategori) $q->where('kategori', $request->kategori);
        if ($request->dari && $request->sampai) $q->whereBetween('tanggal', [$request->dari, $request->sampai]);
        return response()->json(['success' => true, 'data' => $q->latest('tanggal')->get()]);
    }

    public function pengeluaranStore(Request $request)
    {
        $data = $request->validate([
            'jadwal_id' => 'nullable|exists:jadwal,id',
            'kategori' => 'required|in:operasional,akomodasi,transportasi,konsumsi,visa,handling,gaji,lainnya',
            'deskripsi' => 'required|max:255', 'nominal' => 'required|numeric|min:1', 'tanggal' => 'required|date',
        ]);
        $data['created_by'] = auth()->id();
        $item = Pengeluaran::create($data);
        return response()->json(['success' => true, 'message' => 'Pengeluaran dicatat.', 'data' => $item->load('jadwal')], 201);
    }

    public function pengeluaranUpdate(Request $request, $id)
    {
        $item = Pengeluaran::findOrFail($id);
        $item->update($request->only(['jadwal_id', 'kategori', 'deskripsi', 'nominal', 'tanggal']));
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function pengeluaranDestroy($id)
    {
        Pengeluaran::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Pengeluaran dihapus.']);
    }

    public function pemasukanIndex(Request $request)
    {
        $q = Pemasukan::with(['jadwal.paket', 'creator']);
        if ($request->jadwal_id) $q->where('jadwal_id', $request->jadwal_id);
        if ($request->sumber) $q->where('sumber', $request->sumber);
        if ($request->dari && $request->sampai) $q->whereBetween('tanggal', [$request->dari, $request->sampai]);
        return response()->json(['success' => true, 'data' => $q->latest('tanggal')->get()]);
    }

    public function pemasukanStore(Request $request)
    {
        $data = $request->validate([
            'jadwal_id' => 'nullable|exists:jadwal,id', 'sumber' => 'required|in:pembayaran_jamaah,sponsor,lainnya',
            'deskripsi' => 'required|max:255', 'nominal' => 'required|numeric|min:1', 'tanggal' => 'required|date',
        ]);
        $data['created_by'] = auth()->id();
        $item = Pemasukan::create($data);
        return response()->json(['success' => true, 'message' => 'Pemasukan dicatat.', 'data' => $item->load('jadwal')], 201);
    }

    public function pemasukanDestroy($id)
    {
        Pemasukan::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Pemasukan dihapus.']);
    }

    // ══════════════════════════════════════
    // MITRA
    // ══════════════════════════════════════
    public function mitraIndex()
    {
        return response()->json(['success' => true, 'data' => Mitra::orderBy('nama_mitra')->get()]);
    }

    public function mitraStore(Request $request)
    {
        $data = $request->validate(['nama_mitra' => 'required', 'jenis' => 'required|in:bus,katering,handling,guide,lainnya', 'kontak' => 'nullable', 'alamat' => 'nullable']);
        return response()->json(['success' => true, 'data' => Mitra::create($data)], 201);
    }

    public function mitraUpdate(Request $request, $id)
    {
        $item = Mitra::findOrFail($id);
        $item->update($request->only(['nama_mitra', 'jenis', 'kontak', 'alamat', 'is_active']));
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function mitraDestroy($id)
    {
        Mitra::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Mitra dihapus.']);
    }

    // ══════════════════════════════════════
    // LAYANAN
    // ══════════════════════════════════════
    public function layananIndex()
    {
        return response()->json(['success' => true, 'data' => Layanan::orderBy('nama_layanan')->get()]);
    }

    public function layananStore(Request $request)
    {
        $data = $request->validate(['nama_layanan' => 'required', 'deskripsi' => 'nullable', 'harga' => 'required|numeric|min:0']);
        return response()->json(['success' => true, 'data' => Layanan::create($data)], 201);
    }

    public function layananUpdate(Request $request, $id)
    {
        $item = Layanan::findOrFail($id);
        $item->update($request->only(['nama_layanan', 'deskripsi', 'harga', 'is_active']));
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function layananDestroy($id)
    {
        Layanan::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Layanan dihapus.']);
    }

    // ══════════════════════════════════════
    // LAPORAN KEUANGAN
    // ══════════════════════════════════════
    public function laporanKeuangan(Request $request)
    {
        $jadwalId = $request->jadwal_id;

        $totalPemasukan = Pemasukan::when($jadwalId, fn($q) => $q->where('jadwal_id', $jadwalId))->sum('nominal');
        $totalPengeluaran = Pengeluaran::when($jadwalId, fn($q) => $q->where('jadwal_id', $jadwalId))->sum('nominal');
        $totalPembayaran = DB::table('pembayaran')
            ->join('bookings', 'pembayaran.booking_id', '=', 'bookings.id')
            ->where('pembayaran.status_pembayaran', 'verified')
            ->when($jadwalId, fn($q) => $q->where('bookings.jadwal_id', $jadwalId))
            ->sum('pembayaran.nominal');
        $totalBonusAgent = BonusAgent::when($jadwalId, fn($q) => $q->whereHas('booking', fn($b) => $b->where('jadwal_id', $jadwalId)))->sum('nominal_bonus');

        $pengeluaranPerKategori = Pengeluaran::when($jadwalId, fn($q) => $q->where('jadwal_id', $jadwalId))
            ->selectRaw('kategori, SUM(nominal) as total')->groupBy('kategori')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_pemasukan' => $totalPemasukan + $totalPembayaran,
                'total_pembayaran_jamaah' => $totalPembayaran,
                'total_pemasukan_lain' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'total_bonus_agent' => $totalBonusAgent,
                'profit' => ($totalPemasukan + $totalPembayaran) - $totalPengeluaran - $totalBonusAgent,
                'pengeluaran_per_kategori' => $pengeluaranPerKategori,
            ]
        ]);
    }
}
