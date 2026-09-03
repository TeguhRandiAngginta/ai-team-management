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
        
        if (auth()->user()->role === 'karyawan') {
            abort(403, 'Akses Ditolak: Karyawan tidak diizinkan menghapus proyek.');
        }
        
        $projectName = $project->name;
        $project->delete(); 
        
        ActivityLog::log('deleted', "Menghapus proyek: {$projectName}", $workspace->id);
        
        return redirect()->back();
    }

    public function files($workspaceId, $projectId)
    {
        $tasks = \App\Models\Task::with(['files', 'assignees', 'author'])
                    ->where('project_id', $projectId)
                    ->get();

        $allFiles = collect();
        
        foreach ($tasks as $task) {
            // Cek apakah relasi files benar-benar ada datanya
            if ($task->files && $task->files->count() > 0) {
                foreach ($task->files as $file) {
                    
                    // PERBAIKAN 1: Coba tangkap semua kemungkinan nama kolom di database Anda
                    $filePath = $file->file_path ?? $file->path ?? $file->url ?? $file->file_url ?? '';
                    
                    // PERBAIKAN 2: Jika URL file tetap kosong, abaikan agar tidak jadi download.htm
                    if (empty(trim($filePath))) {
                        continue; 
                    }

                    // Membersihkan dan memformat URL
                    $cleanUrl = str_starts_with($filePath, 'http') 
                        ? $filePath 
                        : asset('storage/' . ltrim($filePath, '/'));

                    $allFiles->push([
                        'id' => $file->id,
                        // Coba tangkap semua kemungkinan nama kolom untuk nama file
                        'name' => $file->original_name ?? $file->file_name ?? $file->name ?? 'Dokumen Tanpa Nama',
                        'url' => $cleanUrl,
                        'type' => $file->extension ?? $file->mime_type ?? 'unknown',
                        'size' => $file->size ?? $file->file_size ?? 0,
                        'created_at' => $file->created_at,
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                        'uploader_name' => $file->uploader->name ?? $task->author->name ?? 'Sistem',
                    ]);
                }
            }
        }

        // Kembalikan dalam bentuk JSON agar diambil oleh React
        return response()->json([
            'files' => $allFiles->sortByDesc('created_at')->values()->all()
        ]);
    }
}