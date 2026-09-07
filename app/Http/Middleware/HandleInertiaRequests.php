<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Task; 

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

        if ($user && $user->role !== 'karyawan') {
            $issuesCount = Task::where('status', 'postponed')->count();
            
            $globalIssues = Task::where('status', 'postponed')
                ->select('id', 'title', 'project_id', 'feedback', 'updated_at')
                ->latest('updated_at')
                ->take(5)
                ->get();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
                'notifications' => $user ? $user->unreadNotifications()->take(5)->get() : [],
            ],
            'global_issues' => $globalIssues,
            'global_issues_count' => $issuesCount,
        ]);
    }
}