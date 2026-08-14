<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Workspace;
use App\Models\WorkspaceMember;

class CheckWorkspaceRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Ambil parameter 'workspace' dari URL route (misal: /workspaces/{workspace}/...)
        $workspace = $request->route('workspace');
        
        // 2. Jika parameter berupa object (Route Model Binding), ambil ID-nya
        $workspaceId = $workspace instanceof Workspace ? $workspace->id : $workspace;

        if (!$workspaceId) {
            abort(404, 'Workspace tidak ditemukan.');
        }

        // 3. Cek apakah user yang sedang login adalah anggota aktif di workspace tersebut
        $membership = WorkspaceMember::with('role')
            ->where('workspace_id', $workspaceId)
            ->where('user_id', auth()->id())
            ->where('is_active', true)
            ->first();

        // 4. Jika bukan anggota (atau dinonaktifkan), tolak aksesnya (Isolasi Workspace)
        if (!$membership) {
            abort(403, 'Akses ditolak. Anda bukan anggota aktif di workspace ini.');
        }

        // 5. Jika rute mensyaratkan Role tertentu (misal khusus Admin), cek kecocokannya
        if (!empty($roles)) {
            if (!in_array($membership->role->name, $roles)) {
                abort(403, 'Aksi ditolak. Anda tidak memiliki hak akses yang cukup di workspace ini.');
            }
        }

        // 6. Lolos pengecekan, lanjutkan request
        return $next($request);
    }
}