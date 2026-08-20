<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\TaskNotification;
use Illuminate\Support\Facades\Notification;
use App\Models\Project;
use App\Models\Workspace;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class WorkspaceTaskController extends Controller
{
    public function index(Workspace $workspace, Project $project)
    {
        if ($project->workspace_id !== $workspace->id) abort(403);
        
        $batasWaktu = now()->subDays(7); 
        $project->tasks()->where('status', 'done')
            ->whereNotNull('completed_at')
            ->where('completed_at', '<', $batasWaktu)
            ->update(['status' => 'archived']);

        $doneTasks = $project->tasks()->where('status', 'done')
            ->orderBy('completed_at', 'asc')
            ->get();

        if ($doneTasks->count() > 5) {
            $kelebihan = $doneTasks->count() - 5;
            $tasksToArchive = $doneTasks->take($kelebihan);
            
            foreach ($tasksToArchive as $t) {
                $t->update(['status' => 'archived']);
            }
        }

        // Tambahkan 'files' agar data lampiran ter-load di frontend
        $tasks = $project->tasks()->with(['assignees', 'author', 'files', 'comments.user'])->get();
        $members = $workspace->members()->with('user')->get();

        return Inertia::render('Workspace/Tasks', [
            'workspace' => $workspace,
            'project' => $project,
            'tasks' => $tasks,
            'members' => $members,
        ]);
    }

    public function store(Request $request, Workspace $workspace, Project $project)
    {
        if ($project->workspace_id !== $workspace->id) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'feedback' => 'nullable|string',
            'status' => 'required|string',
            'priority' => 'required|string',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id',
            'due_date' => 'nullable|date',
            'tags' => 'nullable|string',
        ]);

        $task = $project->tasks()->create([
            'author_id' => auth()->id(), 
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'due_date' => $validated['due_date'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'completed_at' => $validated['status'] === 'done' ? now() : null,
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('tasks', 'public');
                $task->files()->create([
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                ]);
            }
        }

        if (!empty($validated['assignee_ids'])) {
            $task->assignees()->attach($validated['assignee_ids']);
            $assignedUsers = User::whereIn('id', $validated['assignee_ids'])->get();
            Notification::send($assignedUsers, new TaskNotification($task, 'Tugas baru untuk Anda: ' . $task->title, 'assigned'));}
        
        ActivityLog::log('created', "Membuat tugas baru: {$task->title}", $workspace->id);
        return redirect()->back();
    }

    public function update(Request $request, Workspace $workspace, Project $project, $taskId)
    {
        if ($project->workspace_id !== $workspace->id) abort(403);

        $task = $project->tasks()->with('assignees')->findOrFail($taskId);

        if (auth()->user()->role === 'karyawan') {
            $isAssignee = $task->assignees->contains('id', auth()->id());
            $isAuthor = $task->author_id === auth()->id();
            
            if (!$isAssignee && !$isAuthor) {
                abort(403, 'Akses Ditolak: Anda hanya dapat mengubah tugas Anda sendiri.');
            }
            if ($request->has('status')) {
                $statusTujuan = $request->input('status');

                if (in_array($statusTujuan, ['done', 'archived', 'postponed'])) {
                    return back()->withErrors(['message' => 'Karyawan hanya dapat memindahkan tugas maksimal sampai tahap Review.']);
                }
            }
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'feedback' => 'nullable|string',
            'status' => 'sometimes|required|string',
            'priority' => 'sometimes|required|string',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id',
            'due_date' => 'nullable|date',
            'tags' => 'nullable|string',
        ]);

        if (isset($validated['status'])) {
            if ($validated['status'] === 'done' && $task->status !== 'done') {
                $validated['completed_at'] = now();
            } elseif ($validated['status'] !== 'done' && $task->status === 'done') {
                $validated['completed_at'] = null;
            }
        }

        $task->update($validated);
        // --- TAMBAHAN ALARM REVISI ---
        if ($request->has('feedback') && isset($validated['status']) && $validated['status'] === 'in_progress') {
            $assignedUsers = $task->assignees;
            if ($assignedUsers->count() > 0) {
                Notification::send($assignedUsers, new TaskNotification($task, 'Tugas ditolak! Catatan: ' . $request->feedback, 'revised')); } }

        // Tambahan penanganan file upload saat update/edit tugas
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('tasks', 'public');
                $task->files()->create([
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                ]);
            }
        }

        if ($request->has('assignee_ids')) {
            if (!empty($validated['assignee_ids'])) {
                $task->assignees()->sync($validated['assignee_ids']);
            } else {
                $task->assignees()->detach(); 
            }
        }

        if ($request->has('title')) ActivityLog::log('updated', "Memperbarui detail tugas: {$task->title}", $workspace->id);
        elseif ($request->has('status')) ActivityLog::log('updated', "Memindahkan tugas: {$task->title} ke status " . strtoupper($task->status), $workspace->id);

        return redirect()->back();
    }

    public function destroy(Workspace $workspace, Project $project, $taskId)
    {
        if ($project->workspace_id !== $workspace->id) abort(403);
        
        $task = $project->tasks()->with('assignees')->findOrFail($taskId);
        if (auth()->user()->role === 'karyawan') {
            $isAssignee = $task->assignees->contains('id', auth()->id());
            $isAuthor = $task->author_id === auth()->id();
            
            if (!$isAssignee && !$isAuthor) {
                abort(403, 'Akses Ditolak: Anda tidak diizinkan menghapus tugas orang lain.');
            }
        }

        $taskTitle = $task->title;
        $task->delete();
        
        ActivityLog::log('deleted', "Menghapus tugas: {$taskTitle}", $workspace->id);
        
        return redirect()->back();
    }

    public function storeComment(Request $request, Workspace $workspace, Project $project, $taskId)
    {
        $request->validate(['content' => 'required|string']);
        
        $task = $project->tasks()->findOrFail($taskId);
        
        $task->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->content
        ]);

        return redirect()->back();
    }
}