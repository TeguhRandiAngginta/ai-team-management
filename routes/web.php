<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkspaceMemberController;
use App\Http\Controllers\WorkspaceProjectController;
use App\Http\Controllers\WorkspaceTaskController;
use App\Http\Controllers\ActivityLogController; 
use App\Http\Controllers\SuperadminUserController;
use App\Models\Workspace;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Halaman utama langsung diarahkan ke login
Route::get('/', function () {
    return redirect()->route('login');
});

// Dashboard utama (Daftar Workspace milik user)
Route::get('/dashboard', function () {
    $workspaces = auth()->user()->workspaceMemberships()
        ->with('workspace')
        ->where('is_active', true)
        ->get()
        ->pluck('workspace');

    return Inertia::render('Dashboard', [
        'workspaces' => $workspaces
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Rute yang memerlukan autentikasi umum
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs');

    // =========================================================================
    // RUTE SUPERADMIN USER DIPINDAHKAN KESINI (DI LUAR WORKSPACE PREFIX)
    // =========================================================================
    Route::get('/superadmin/users', [SuperadminUserController::class, 'index'])->name('superadmin.users');
    Route::post('/superadmin/users', [SuperadminUserController::class, 'store'])->name('superadmin.users.store');

    // Rute di dalam Workspace tertentu (Dilindungi oleh Middleware Workspace Role)
    Route::middleware('workspace.role')->prefix('workspaces/{workspace}')->group(function () {
        
        // Overview Workspace
        Route::get('/', function (Workspace $workspace) {
            return Inertia::render('Workspace/Dashboard', [
                'workspace' => $workspace
            ]);
        })->name('workspace.dashboard');

        // Manajemen Anggota Tim (Hanya untuk anggota dalam workspace)
        Route::get('/members', [WorkspaceMemberController::class, 'index'])->name('workspace.members');
        Route::post('/members', [WorkspaceMemberController::class, 'store'])->name('workspace.members.store');
        Route::delete('/members/{member}', [WorkspaceMemberController::class, 'destroy'])->name('workspace.members.destroy');

        // Proyek CRUD
        Route::get('/projects', [WorkspaceProjectController::class, 'index'])->name('workspace.projects');
        Route::post('/projects', [WorkspaceProjectController::class, 'store'])->name('workspace.projects.store');
        Route::put('/projects/{project}', [WorkspaceProjectController::class, 'update'])->name('workspace.projects.update');
        Route::delete('/projects/{project}', [WorkspaceProjectController::class, 'destroy'])->name('workspace.projects.destroy');

        // Task CRUD
        Route::get('/projects/{project}/tasks', [WorkspaceTaskController::class, 'index'])->name('workspace.projects.tasks');
        Route::post('/projects/{project}/tasks', [WorkspaceTaskController::class, 'store'])->name('workspace.projects.tasks.store');
        Route::patch('/projects/{project}/tasks/{task}', [WorkspaceTaskController::class, 'update'])->name('workspace.projects.tasks.update');
        Route::delete('/projects/{project}/tasks/{task}', [WorkspaceTaskController::class, 'destroy'])->name('workspace.projects.tasks.destroy');
    });
});

require __DIR__.'/auth.php';