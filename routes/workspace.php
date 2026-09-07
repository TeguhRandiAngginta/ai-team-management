<?php

use App\Http\Controllers\WorkspaceMemberController;
use App\Http\Controllers\WorkspaceProjectController;
use App\Http\Controllers\WorkspaceTaskController;
use App\Models\Workspace;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {

    // 🏢 Main Workspace (Menu Baru)
    Route::get('/workspaces', function () {
        $workspaces = auth()->user()
            ->workspaceMemberships()
            ->with('workspace')
            ->where('is_active', true)
            ->get()
            ->pluck('workspace');
            
        return Inertia::render('Workspace/Index', [
            'workspaces' => $workspaces
        ]); 
    })->name('workspace.index');

    // Modul Spesifik dalam Workspace
    Route::middleware('workspace.role')->prefix('workspaces/{workspace}')->group(function () {
        
        // DI SINI LETAK PERUBAHANNYA: 
        // Mengubah rute '/' (yang bernama workspace.dashboard) menjadi redirect ke workspace.projects
        Route::get('/', function (Workspace $workspace) {
            return redirect()->route('workspace.projects', ['workspace' => $workspace->id]);
        })->name('workspace.dashboard');

        Route::get('/projects/{project}/files', [WorkspaceProjectController::class, 'files'])->name('workspace.projects.files');

        // Members CRUD
        Route::get('/members', [WorkspaceMemberController::class, 'index'])->name('workspace.members');
        Route::post('/members', [WorkspaceMemberController::class, 'store'])->name('workspace.members.store');
        Route::delete('/members/{member}', [WorkspaceMemberController::class, 'destroy'])->name('workspace.members.destroy');

        // Projects CRUD
        Route::get('/projects', [WorkspaceProjectController::class, 'index'])->name('workspace.projects');
        Route::post('/projects', [WorkspaceProjectController::class, 'store'])->name('workspace.projects.store');
        Route::put('/projects/{project}', [WorkspaceProjectController::class, 'update'])->name('workspace.projects.update');
        Route::delete('/projects/{project}', [WorkspaceProjectController::class, 'destroy'])->name('workspace.projects.destroy');

        // Tasks CRUD
        Route::get('/projects/{project}/tasks', [WorkspaceTaskController::class, 'index'])->name('workspace.projects.tasks');
        Route::post('/projects/{project}/tasks', [WorkspaceTaskController::class, 'store'])->name('workspace.projects.tasks.store');
        Route::patch('/projects/{project}/tasks/{task}', [WorkspaceTaskController::class, 'update'])->name('workspace.projects.tasks.update');
        Route::delete('/projects/{project}/tasks/{task}', [WorkspaceTaskController::class, 'destroy'])->name('workspace.projects.tasks.destroy');
        Route::post('/projects/{project}/tasks/{task}/comments', [WorkspaceTaskController::class, 'storeComment'])->name('workspace.projects.tasks.comments.store');
    });
});