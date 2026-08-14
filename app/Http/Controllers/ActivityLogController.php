<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index()
    {
        if (auth()->user()->role !== 'superadmin') {
            abort(403, 'Akses Ditolak: Hanya Superadmin yang dapat melihat jejak aktivitas.');
        }
        
        // Ambil ID semua workspace dimana user ini terdaftar
        $workspaceIds = auth()->user()->workspaceMemberships()->pluck('workspace_id');

        // Ambil log aktivitas: entah yang dilakukan user itu sendiri (seperti update profil) 
        // ATAU aktivitas yang terjadi di dalam workspace mereka
        $logs = ActivityLog::with(['user', 'workspace'])
            ->whereIn('workspace_id', $workspaceIds)
            ->orWhere('user_id', auth()->id())
            ->latest() // urutkan dari yang terbaru
            ->limit(100) // Tampilkan 100 aktivitas terakhir
            ->get();

        return Inertia::render('ActivityLogs', [
            'logs' => $logs
        ]);
    }
}