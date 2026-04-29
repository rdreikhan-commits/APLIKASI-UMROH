<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\PaketUmroh;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * =====================================================
 * CATALOG CONTROLLER (Public / Jamaah)
 * =====================================================
 * Endpoint publik untuk melihat katalog paket dan jadwal.
 * Menampilkan sisa kuota secara real-time.
 */
class CatalogController extends Controller
{
    /**
     * List paket umroh yang aktif.
     * GET /api/katalog/paket
     */
    public function paketList(Request $request): JsonResponse
    {
        $query = PaketUmroh::active()
            ->withCount(['jadwal as jadwal_tersedia_count' => function ($q) {
                $q->available();
            }]);

        if ($request->has('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        if ($request->has('search')) {
            $query->where('nama_paket', 'like', "%{$request->search}%");
        }

        // Sort by harga
        if ($request->has('sort_harga')) {
            $query->orderBy('harga', $request->sort_harga === 'asc' ? 'asc' : 'desc');
        }

        $paket = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['success' => true, 'data' => $paket]);
    }

    /**
     * Detail paket beserta jadwal tersedia.
     * GET /api/katalog/paket/{id}
     */
    public function paketDetail(int $id): JsonResponse
    {
        $paket = PaketUmroh::active()
            ->with(['jadwal' => function ($q) {
                $q->available()->upcoming()->orderBy('tanggal_berangkat', 'asc');
            }])
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $paket]);
    }

    /**
     * List jadwal tersedia (dengan sisa kuota real-time).
     * GET /api/katalog/jadwal
     */
    public function jadwalList(Request $request): JsonResponse
    {
        $query = Jadwal::with('paket:id,nama_paket,kode_paket,tipe,harga,durasi_hari')
            ->available()
            ->upcoming();

        if ($request->has('paket_id')) {
            $query->where('paket_id', $request->paket_id);
        }

        $jadwal = $query->orderBy('tanggal_berangkat', 'asc')->get();

        return response()->json(['success' => true, 'data' => $jadwal]);
    }

    /**
     * Detail jadwal (termasuk kuota real-time).
     * GET /api/katalog/jadwal/{id}
     */
    public function jadwalDetail(int $id): JsonResponse
    {
        $jadwal = Jadwal::with('paket')
            ->withCount(['bookings as total_confirmed' => function ($q) {
                $q->where('status', 'confirmed');
            }])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $jadwal,
        ]);
    }
}
