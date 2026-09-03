<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Task; // <-- PASTIKAN BARIS INI ADA DI ATAS

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $globalIssues = [];
        $issuesCount = 0;

        // SISTEM HIBRIDA: Hanya Admin/Manajer yang mendapatkan data Issue
        if ($user && $user->role !== 'karyawan') {
            $issuesCount = Task::where('status', 'postponed')->count();
            
            // Ambil 5 issue terbaru untuk ditampilkan di Laci Header
            $globalIssues = Task::where('status', 'postponed')
                ->select('id', 'title', 'project_id', 'feedback', 'updated_at')
                ->latest('updated_at')
                ->take(5)
                ->get();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
            ],
            // Kirim data issue secara global ke React
            'global_issues' => $globalIssues,
            'global_issues_count' => $issuesCount,
        ]);
    }
}