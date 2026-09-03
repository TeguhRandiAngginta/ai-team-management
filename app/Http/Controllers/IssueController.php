<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IssueController extends Controller
{
    public function index(Request $request)
    {
        // Proteksi: Karyawan biasa tidak boleh masuk ke sini
        if ($request->user()->role === 'karyawan') {
            abort(403, 'Akses ditolak.');
        }

        // Ambil semua tugas 'postponed' beserta relasi proyek dan usernya
        $issues = Task::with(['project.workspace', 'assignees'])
            ->where('status', 'postponed')
            ->latest('updated_at')
            ->paginate(12);

        return Inertia::render('Issues/Index', [
            'issues' => $issues
        ]);
    }
}