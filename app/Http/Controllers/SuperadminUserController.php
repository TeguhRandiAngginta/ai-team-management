<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SuperadminUserController extends Controller
{
    public function index()
    {
        // Hanya Superadmin yang boleh akses
        if (auth()->user()->role !== 'superadmin') {
            abort(403, 'Akses Ditolak.');
        }

        return Inertia::render('Superadmin/Users', [
            'users' => User::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'superadmin') {
            abort(403, 'Akses Ditolak.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,karyawan', // Superadmin bisa buat Admin atau Karyawan
        ]);

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        ActivityLog::log('created', "Superadmin membuat akun baru untuk: {$newUser->name} dengan role {$newUser->role}");

        return redirect()->back()->with('success', 'Akun pengguna berhasil dibuat.');
    }
}