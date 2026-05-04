<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $role = $request->query('role');
        
        $query = User::query();
        if ($role) {
            $query->where('role', $role);
        }
        
        $users = $query->orderBy('nama', 'asc')->get();
        
        return response()->json([
            'success' => true,
            'data'    => $users
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:admin_travel,admin_keuangan,admin_perlengkapan,manager,mitra,jamaah,agent'
        ]);

        $user = User::create([
            'nama'     => $request->nama,
            'email'    => $request->email,
            'password' => $request->password, // Password hashed automatically in Laravel 10 due to casts
            'role'     => $request->role,
            // Additional fields for jamaah manual register
            'nik'           => $request->nik,
            'no_hp'         => $request->no_hp,
            'jenis_kelamin' => $request->jenis_kelamin,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dibuat',
            'data'    => $user
        ], 201);
    }

    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting self or superadmins if needed
        if (auth()->id() === $user->id) {
            return response()->json(['success' => false, 'message' => 'Tidak dapat menghapus akun sendiri'], 400);
        }
        
        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dihapus'
        ]);
    }

    // Mendaftarkan jamaah secara manual beserta booking
    public function manualRegisterJamaah(Request $request): JsonResponse
    {
        $request->validate([
            'nama'      => 'required|string',
            'email'     => 'required|email|unique:users,email',
            'no_hp'     => 'required|string',
            'jadwal_id' => 'required|exists:jadwals,id',
            'tipe_kamar'=> 'required|in:quad,triple,double',
        ]);

        // 1. Buat Akun Jamaah
        $user = User::create([
            'nama'     => $request->nama,
            'email'    => $request->email,
            'password' => 'jamaah123', // auto-hashed
            'role'     => 'jamaah',
            'no_hp'    => $request->no_hp,
            'nik'      => $request->nik,
        ]);

        // 2. Buat Booking
        $jadwal = \App\Models\Jadwal::with('paket')->findOrFail($request->jadwal_id);
        
        // Cek Kuota
        if ($jadwal->sisa_kuota < 1) {
            return response()->json(['success' => false, 'message' => 'Kuota jadwal sudah penuh'], 400);
        }

        $harga = $jadwal->paket->{"harga_{$request->tipe_kamar}"};

        $booking = Booking::create([
            'user_id'       => $user->id,
            'jadwal_id'     => $jadwal->id,
            'kode_booking'  => Booking::generateKode(),
            'status'        => 'pending',
            'tipe_kamar'    => $request->tipe_kamar,
            'total_harga'   => $harga,
            'total_dibayar' => 0,
            'status_dokumen'=> 'pending'
        ]);

        // Kurangi kuota
        $jadwal->decrement('sisa_kuota');

        return response()->json([
            'success' => true,
            'message' => 'Jamaah dan Booking berhasil dibuat secara manual',
            'data'    => [
                'user'    => $user,
                'booking' => $booking
            ]
        ], 201);
    }
}
