<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkspaceMemberController extends Controller
{
    public function index(Workspace $workspace)
    {
        // Ambil semua anggota yang sudah bergabung di workspace ini
        $members = $workspace->members()->with(['user', 'role'])->get();

        // Ambil daftar user yang BELUM bergabung di workspace ini
        $existingUserIds = $members->pluck('user_id');
        $availableUsers = User::whereNotIn('id', $existingUserIds)->get(['id', 'name', 'email', 'role']);

        // Ambil daftar role yang tersedia
        $roles = Role::all();

        return Inertia::render('Workspace/Members', [
            'workspace' => $workspace,
            'members' => $members,
            'availableUsers' => $availableUsers,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request, Workspace $workspace)
    {
        // Hanya Superadmin dan Admin yang boleh menambah anggota
        if (auth()->user()->role === 'karyawan') {
            abort(403, 'Akses Ditolak: Karyawan tidak diizinkan menambahkan anggota.');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        // Cek duplikasi
        $exists = $workspace->members()->where('user_id', $validated['user_id'])->exists();
        if ($exists) {
            return redirect()->back()->withErrors(['user_id' => 'Pengguna ini sudah menjadi anggota workspace.']);
        }

        $member = $workspace->members()->create([
            'user_id' => $validated['user_id'],
            'role_id' => $validated['role_id'],
            'is_active' => true,
        ]);

        $addedUser = User::find($validated['user_id']);
        ActivityLog::log('created', "Menambahkan {$addedUser->name} ke dalam tim workspace", $workspace->id);

        return redirect()->back()->with('success', 'Anggota berhasil ditambahkan.');
    }

    public function destroy(Workspace $workspace, WorkspaceMember $member)
    {
        if (auth()->user()->role === 'karyawan') {
            abort(403, 'Akses Ditolak.');
        }

        $userName = $member->user->name ?? 'Anggota';
        $member->delete();

        ActivityLog::log('deleted', "Mengeluarkan {$userName} dari tim workspace", $workspace->id);

        return redirect()->back()->with('success', 'Anggota berhasil dikeluarkan.');
    }
}