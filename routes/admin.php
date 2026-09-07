<?php

use App\Http\Controllers\ActivityLogController; 
use App\Http\Controllers\SuperadminUserController;
use App\Http\Controllers\IssueController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs');
    Route::get('/issues-center', [IssueController::class, 'index'])->name('issues.index');
    
    Route::prefix('superadmin')->group(function () {
        Route::get('/users', [SuperadminUserController::class, 'index'])->name('superadmin.users');
        Route::post('/users', [SuperadminUserController::class, 'store'])->name('superadmin.users.store');
    });
});