<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Halaman utama langsung diarahkan ke login
Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    
    // 📊 Dashboard Analitik (Difilter Per Proyek)
    Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
        $user = auth()->user();
        
        $workspaceIds = $user->role === 'superadmin' 
            ? \App\Models\Workspace::pluck('id') 
            : $user->workspaceMemberships()->where('is_active', true)->pluck('workspace_id');

        // Ambil seluruh proyek yang bisa diakses user ini
        $projects = \App\Models\Project::whereIn('workspace_id', $workspaceIds)->get();

        // Tentukan proyek yang sedang dipilih (Default ke proyek pertama jika ada)
        $selectedProjectId = $request->input('project_id', $projects->first()?->id);
        $selectedProject = $projects->firstWhere('id', $selectedProjectId);

        // Jika proyek ditemukan, ambil tugasnya. Jika tidak ada, kosongkan.
        $taskQuery = $selectedProject 
            ? \App\Models\Task::where('project_id', $selectedProject->id) 
            : \App\Models\Task::whereRaw('1 = 0');

        // Hitung status spesifik untuk proyek ini
        $statusCounts = [
            'todo' => (clone $taskQuery)->where('status', 'todo')->count(),
            'in_progress' => (clone $taskQuery)->where('status', 'in_progress')->count(),
            'review' => (clone $taskQuery)->where('status', 'review')->count(),
            'done' => (clone $taskQuery)->where('status', 'done')->count(),
            'archived' => (clone $taskQuery)->where('status', 'archived')->count(),
            'postponed' => (clone $taskQuery)->where('status', 'postponed')->count(),
        ];

        $totalTasks = array_sum($statusCounts);
        $completedTasks = $statusCounts['done'] + $statusCounts['archived'];
        $completionRatio = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // Data Tren Waktu untuk Proyek Terpilih
        $allTimeTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $count = (clone $taskQuery)
                ->whereIn('status', ['done', 'archived'])
                ->whereYear('updated_at', $month->year)
                ->whereMonth('updated_at', $month->month)
                ->count();
            $allTimeTrend[] = ['name' => $month->translatedFormat('M Y'), 'tugas' => $count];
        }

        $weeklyTrend = [];
        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        $startOfWeek = now()->startOfWeek();
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $count = (clone $taskQuery)
                ->whereIn('status', ['done', 'archived'])
                ->whereDate('updated_at', $date->format('Y-m-d'))
                ->count();
            $weeklyTrend[] = ['name' => $days[$i], 'tugas' => $count];
        }

        $monthlyTrend = [];
        $startOfMonth = now()->startOfMonth();
        for ($w = 1; $w <= 4; $w++) {
            $weekStart = $startOfMonth->copy()->addDays(($w - 1) * 7);
            $weekEnd = $w === 4 ? now()->endOfMonth() : $weekStart->copy()->addDays(6);
            $count = (clone $taskQuery)
                ->whereIn('status', ['done', 'archived'])
                ->whereBetween('updated_at', [$weekStart->startOfDay(), $weekEnd->endOfDay()])
                ->count();
            $monthlyTrend[] = ['name' => "Minggu $w", 'tugas' => $count];
        }

        return Inertia::render('Dashboard', [
            'projects' => $projects,
            'selectedProjectId' => $selectedProjectId,
            'stats' => [
                'total_tasks' => $totalTasks,
                'status_counts' => $statusCounts,
                'all_time' => ['ratio' => $completionRatio, 'issues' => $statusCounts['postponed'], 'trend' => $allTimeTrend],
                'weekly' => ['ratio' => $completionRatio, 'issues' => $statusCounts['postponed'], 'trend' => $weeklyTrend],
                'monthly' => ['ratio' => $completionRatio, 'issues' => $statusCounts['postponed'], 'trend' => $monthlyTrend]
            ]
        ]);
    })->name('dashboard');

    // 📅 Kalender Global (Menarik seluruh tugas dari semua Workspace yang bisa diakses user)
    Route::get('/calendar', function () {
        $user = auth()->user();
        
        $workspaceIds = $user->role === 'superadmin' 
            ? \App\Models\Workspace::pluck('id') 
            : $user->workspaceMemberships()->where('is_active', true)->pluck('workspace_id');

        $allTasks = \App\Models\Task::whereHas('project', function($q) use ($workspaceIds) {
            $q->whereIn('workspace_id', $workspaceIds);
        })->with(['assignees', 'author', 'project'])->get();

        return Inertia::render('Calendar/Index', [
            'tasks' => $allTasks 
        ]);
    })->name('calendar.index');

    // ⚙️ Profile & Settings
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // 🔔 Notifikasi Bawaan Anda
    Route::post('/notifications/{id}/read', function($id) {
        auth()->user()->notifications()->findOrFail($id)->markAsRead();
        return back();
    })->name('notifications.read');

});

// MEMANGGIL RUTE MODULULAR
require __DIR__.'/workspace.php';
require __DIR__.'/ai.php';
require __DIR__.'/admin.php';
require __DIR__.'/auth.php';