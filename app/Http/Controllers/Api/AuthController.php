<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * =====================================================
 * AUTH CONTROLLER
 * =====================================================
 * Autentikasi untuk semua role:
 * Register (hanya jamaah), Login, Logout, Profiling.
 * Menggunakan Laravel Sanctum untuk token-based API auth.
 */
class AuthController extends Controller
{
    /**
     * Register jamaah baru.
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'     => 'required|string|max:150',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
            'no_hp'    => 'nullable|string|max:20',
            'nik'      => 'nullable|string|size:16|unique:users,nik',
        ]);

        $user = User::create([
            'role'     => 'jamaah', // Register selalu sebagai jamaah
            'nama'     => $validated['nama'],
            'email'    => $validated['email'],
            'password' => $validated['password'], // Auto-hashed via cast
            'no_hp'    => $validated['no_hp'] ?? null,
            'nik'      => $validated['nik'] ?? null,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil.',
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login untuk semua role.
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        // Revoke semua token lama (single device login)
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout.
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Get profil user yang login.
     * GET /api/auth/profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'bookings.jadwal.paket',
            'bookings.pembayaran',
            'bookings.distribusiPerlengkapan.perlengkapan',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    /**
     * Update profil (data diri + upload dokumen).
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'nama'          => 'sometimes|string|max:150',
            'no_hp'         => 'nullable|string|max:20',
            'nik'           => "nullable|string|size:16|unique:users,nik,{$user->id}",
            'no_paspor'     => "nullable|string|max:20|unique:users,no_paspor,{$user->id}",
            'tempat_lahir'  => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'alamat'        => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data'    => $user->fresh(),
        ]);
    }

    /**
     * Upload dokumen jamaah (KTP, Paspor, Buku Nikah).
     * POST /api/auth/upload-dokumen
     */
    public function uploadDokumen(Request $request): JsonResponse
    {
        $request->validate([
            'foto_ktp'        => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'foto_paspor'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'foto_buku_nikah' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $user = $request->user();
        $updates = [];

        if ($request->hasFile('foto_ktp')) {
            $updates['foto_ktp_path'] = $request->file('foto_ktp')
                ->store("dokumen/{$user->id}", 'public');
        }

        if ($request->hasFile('foto_paspor')) {
            $updates['foto_paspor_path'] = $request->file('foto_paspor')
                ->store("dokumen/{$user->id}", 'public');
        }

        if ($request->hasFile('foto_buku_nikah')) {
            $updates['foto_buku_nikah_path'] = $request->file('foto_buku_nikah')
                ->store("dokumen/{$user->id}", 'public');
        }

        if (!empty($updates)) {
            // Auto-set status dokumen ke 'review' setelah upload
            $updates['status_dokumen'] = 'review';
            $user->update($updates);
        }

        return response()->json([
            'success' => true,
            'message' => 'Dokumen berhasil diupload. Menunggu verifikasi admin.',
            'data'    => $user->fresh(),
        ]);
    }

    /**
     * Login via Google OAuth.
     * POST /api/auth/google
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate(['credential' => 'required|string']);

        // Decode Google JWT token (payload is base64-encoded JSON)
        $parts = explode('.', $request->credential);
        if (count($parts) !== 3) {
            return response()->json(['success' => false, 'message' => 'Token Google tidak valid.'], 401);
        }

        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

        if (!$payload || !isset($payload['email'])) {
            return response()->json(['success' => false, 'message' => 'Data Google tidak valid.'], 401);
        }

        // Find or create user
        $user = User::where('email', $payload['email'])->first();

        if (!$user) {
            $user = User::create([
                'nama'     => $payload['name'] ?? $payload['email'],
                'email'    => $payload['email'],
                'password' => Hash::make(str()->random(32)), // Random password
                'role'     => 'jamaah',
                'google_id' => $payload['sub'] ?? null,
            ]);
        } else {
            // Update google_id if not set
            if (empty($user->google_id) && isset($payload['sub'])) {
                $user->update(['google_id' => $payload['sub']]);
            }
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login Google berhasil.',
            'user'    => $user,
            'token'   => $token,
        ]);
    }
}
