<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * =====================================================
 * ROLE MIDDLEWARE
 * =====================================================
 * Middleware untuk membatasi akses berdasarkan role user.
 * Digunakan di route group untuk memastikan hanya role
 * yang sesuai yang bisa mengakses endpoint tertentu.
 *
 * Usage di route: ->middleware('role:admin_keuangan')
 *                 ->middleware('role:admin_travel,admin_keuangan')
 */
class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Silakan login terlebih dahulu.',
            ], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Anda tidak memiliki akses untuk fitur ini.',
                'required_roles' => $roles,
                'your_role'      => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
