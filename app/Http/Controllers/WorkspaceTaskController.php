<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Workspace;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkspaceTaskController extends Controller
{
    public function index(Workspace $workspace, Project $project)
    {
        if ($project->workspace_id !== $workspace->id) abort(404);
        $tasks = $project->tasks()->with('assignee')->get();
        $members = $workspace->members()->with(['user', 'role'])->get();

        return Inertia::render('Workspace/Tasks', ['workspace' => $workspace, 'project' => $project, 'tasks' => $tasks, 'members' => $members]);
    }

    public function store(Request $request, Workspace $workspace, Project $project)
    {
        if ($project->workspace_id !== $workspace->id) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:todo,in_progress,review,done',
            'priority' => 'required|string|in:low,medium,high',
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $task = $project->tasks()->create($validated);
        ActivityLog::log('created', "Membuat tugas: {$task->title}", $workspace->id);

        return redirect()->back();
    }

    public function update(Request $request, Workspace $workspace, Project $project, $taskId)
    {
        if ($project->workspace_id !== $workspace->id) abort(403);
        $task = $project->tasks()->findOrFail($taskId);

        // 'sometimes' berarti validasi ini hanya berjalan jika datanya dikirim (berguna untuk Drag & Drop yang hanya kirim status)
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string|in:todo,in_progress,review,done',
            'priority' => 'sometimes|required|string|in:low,medium,high',
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $task->update($validated);

        if ($request->has('title')) {
            ActivityLog::log('updated', "Memperbarui detail tugas: {$task->title}", $workspace->id);
        } else {
            ActivityLog::log('updated', "Memindahkan tugas: {$task->title} ke {$task->status}", $workspace->id);
        }

        return redirect()->back();
    }

    public function destroy(Workspace $workspace, Project $project, $taskId)
    {
        if ($project->workspace_id !== $workspace->id) abort(403);
        
        // TAMBAHKAN BARIS INI: Tolak jika yang menghapus adalah Karyawan
        if (auth()->user()->role === 'karyawan') {
            abort(403, 'Akses Ditolak: Karyawan tidak diizinkan menghapus tugas.');
        }

        $task = $project->tasks()->findOrFail($taskId);
        $taskTitle = $task->title;
        $task->delete();
        
        ActivityLog::log('deleted', "Menghapus tugas: {$taskTitle}", $workspace->id);
        
        return redirect()->back();
    }
}