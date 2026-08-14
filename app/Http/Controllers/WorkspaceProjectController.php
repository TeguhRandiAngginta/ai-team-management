<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Project;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkspaceProjectController extends Controller
{
    public function index(Workspace $workspace)
    {
        $projects = $workspace->projects()->latest()->get();
        return Inertia::render('Workspace/Projects', ['workspace' => $workspace, 'projects' => $projects]);
    }

    public function store(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:active,completed,on_hold',
        ]);

        $project = $workspace->projects()->create($validated);
        ActivityLog::log('created', "Membuat proyek baru: {$project->name}", $workspace->id);

        return redirect()->back();
    }

    public function update(Request $request, Workspace $workspace, Project $project)
    {
        if ($project->workspace_id !== $workspace->id) abort(403);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:active,completed,on_hold',
        ]);

        $project->update($validated);
        ActivityLog::log('updated', "Memperbarui proyek: {$project->name}", $workspace->id);

        return redirect()->back();
    }

    public function destroy(Workspace $workspace, Project $project)
    {
        if ($project->workspace_id !== $workspace->id) abort(403);
        
        // TAMBAHKAN BARIS INI: Tolak jika yang menghapus adalah Karyawan
        if (auth()->user()->role === 'karyawan') {
            abort(403, 'Akses Ditolak: Karyawan tidak diizinkan menghapus proyek.');
        }
        
        $projectName = $project->name;
        $project->delete(); 
        
        ActivityLog::log('deleted', "Menghapus proyek: {$projectName}", $workspace->id);
        
        return redirect()->back();
    }
}