<?php

use App\Http\Controllers\AIController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    
    // 🤖 AI Manager (Menu Baru)
    Route::get('/ai-manager', function () {
        $user = auth()->user();
        
        $workspaceIds = $user->role === 'superadmin' 
            ? \App\Models\Workspace::pluck('id') 
            : $user->workspaceMemberships()->where('is_active', true)->pluck('workspace_id');

        $allTasks = \App\Models\Task::whereHas('project', function($q) use ($workspaceIds) {
            $q->whereIn('workspace_id', $workspaceIds);
        })->get();

        return Inertia::render('AI/Index', ['allTasks' => $allTasks]);
    })->name('ai.manager');

    // Endpoint API AI
    Route::prefix('api/ai')->group(function () {
        Route::post('/workspace-summary', [AIController::class, 'generateWorkspaceSummary'])->name('api.ai.workspace_summary');
        Route::post('/breakdown-task', [AIController::class, 'generateTaskBreakdown'])->name('api.ai.breakdown_task');
        Route::post('/health-analysis', [AIController::class, 'generateHealthAnalysis'])->name('api.ai.health_analysis');
        Route::post('/recommend-assignee', [AIController::class, 'recommendAssignee'])->name('api.ai.recommend_assignee');
        Route::post('/project-chat', [AIController::class, 'projectChat'])->name('api.ai.project_chat');
    });
});