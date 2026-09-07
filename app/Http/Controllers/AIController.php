<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
class AIController extends Controller
    {
        public function generateWorkspaceSummary(Request $request)
        {
            $tasks = $request->input('tasks', []);
            
            $total = count($tasks);
            $done = collect($tasks)->whereIn('status', ['done', 'archived'])->count();
            $pending = $total - $done;
            
            if ($total === 0) {
                return response()->json(['summary' => 'Data tidak mencukupi. Belum ada tugas di dalam Workspace ini untuk dianalisis oleh AI.']);
            }

            // --- PERBAIKAN: SARING DATA SEBELUM DIKIRIM KE AI ---
            // Kita buang semua ID dan data tidak penting agar AI tidak kebingungan
            $mappedTasks = collect($tasks)->map(function($task) {
                return [
                    'judul_tugas' => $task['title'] ?? 'Tanpa Judul',
                    'status' => $task['status'] ?? 'unknown',
                    'prioritas' => $task['priority'] ?? 'normal',
                    'catatan_revisi' => $task['feedback'] ?? null,
                    'anggota_tim' => collect($task['assignees'] ?? [])->pluck('name')->join(', '),
                ];
            })->toArray();

            $contextData = "Total Tugas: $total. Selesai: $done. Tertunda: $pending. Data Detail: " . json_encode($mappedTasks);
            // ----------------------------------------------------

            // --- PERBAIKAN PROMPT: LARANG PENGGUNAAN ID ---
            $systemPrompt = "Anda adalah AI Manager Asisten. Tugas Anda menganalisis data proyek. 
            Berikan format ringkasan: 1. Progress Keseluruhan, 2. Risiko (jika ada yang tertunda/feedback negatif), 3. Rekomendasi Langkah Selanjutnya. 
            
            ATURAN MUTLAK: 
            - Gunakan bahasa Indonesia yang profesional. 
            - JANGAN PERNAH menyebutkan ID unik, kode acak, atau UUID. 
            - Jika ingin menyebutkan tugas spesifik, sebutkan langsung 'judul_tugas'-nya (contoh: tugas 'Membuat Desain UI').
            - DILARANG menggunakan format markdown seperti tanda pagar (#) atau bintang (*). Gunakan penomoran angka atau poin-poin standar saja.";

            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . env('MINIMAX_API_KEY'),
                    'Content-Type'  => 'application/json',
                ])
                ->timeout(30)
                ->retry(3, 1000)
                ->post(rtrim(env('MINIMAX_BASE_URL'), '/') . '/v1/chat/completions', [
                    'model' => env('MINIMAX_MODEL', 'MiniMax-Text-01'),
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $contextData],
                    ],
                    'temperature' => 0.1,
                ]);

                if ($response->successful()) {
                    $result = $response->json();
                    $aiText = $result['choices'][0]['message']['content'] ?? 'AI gagal menghasilkan teks.';
                    return response()->json(['summary' => $aiText]);
                }

                Log::error('MiniMax API Error: ' . $response->body());
                return response()->json(['summary' => 'Maaf, layanan AI sedang sibuk atau mengalami kendala. Silakan coba beberapa saat lagi.'], 500);

            } catch (\Exception $e) {
                Log::error('MiniMax Connection Exception: ' . $e->getMessage());
                return response()->json(['summary' => 'Koneksi ke server AI terputus. Sistem manajemen tugas tetap bisa digunakan dengan normal.'], 500);
            }
        }

        public function generateTaskBreakdown(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string'
        ]);

        $taskTitle =$request->title;
        $taskDesc =$request->description ?? 'Tidak ada deskripsi spesifik.';

        // PROMPT KHUSUS: Kita paksa AI untuk HANYA mengembalikan format JSON murni
        $systemPrompt = "Anda adalah Asisten Project Manager Senior. 
        Tugas Anda adalah memecah satu tugas besar (Epic/Task) menjadi langkah-langkah eksekusi yang kecil, jelas, dan bisa langsung dikerjakan (actionable).
        
        ATURAN MUTLAK:
        1. Hasilkan antara 3 hingga 6 langkah praktis.
        2. KEMBALIKAN HANYA DALAM FORMAT ARRAY JSON MURNI berisi string.
        3. DILARANG KERAS memberikan teks pengantar, penutup, atau tanda kutip markdown (seperti ```json).
        4. Contoh output yang BENAR: [\"Buat skema tabel database\", \"Siapkan rute API backend\", \"Desain tampilan antarmuka (UI)\"]";

        $contextData = "Judul Tugas: $taskTitle. Deskripsi: $taskDesc";

        try {
            // Menggunakan struktur ketahanan yang sama persis dengan buatan Anda
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('MINIMAX_API_KEY'),
                'Content-Type'  => 'application/json',
            ])
            ->timeout(20)
            ->retry(3, 1000)
            ->post(rtrim(env('MINIMAX_BASE_URL'), '/') . '/v1/chat/completions', [
                'model' => env('MINIMAX_MODEL', 'MiniMax-Text-01'),
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $contextData],
                ],
                'temperature' => 0.1, // Dibuat sangat rendah agar format JSON konsisten dan tidak melenceng
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $aiText = $result['choices'][0]['message']['content'] ?? '[]';
                
                // Pembersihan keamanan ganda (Jika AI bandel mengirimkan simbol markdown)
                $cleanJson = preg_replace('/```json|```/i', '', $aiText);
                $subtasks = json_decode(trim($cleanJson), true);

                if (is_array($subtasks)) {
                    return response()->json(['subtasks' => $subtasks]);
                }
            }

            Log::error('MiniMax Breakdown Error: ' . $response->body());
            return response()->json(['subtasks' => []], 500);

        } catch (\Exception $e) {
            Log::error('MiniMax Connection Exception (Breakdown): ' . $e->getMessage());
            return response()->json(['subtasks' => []], 500);
        }
    }

    public function generateHealthAnalysis(Request $request)
    {
        $tasks = $request->input('tasks', []);
        
        $total = count($tasks);
        if ($total === 0) {
            return response()->json(['summary' => 'Data tidak mencukupi. Belum ada tugas untuk dianalisis risikonya.']);
        }

        // --- FILTER DATA UNTUK ANALISIS RISIKO ---
        $mappedTasks = collect($tasks)->map(function($task) {
            return [
                'judul' => $task['title'] ?? 'Tanpa Judul',
                'status' => $task['status'] ?? 'unknown',
                'prioritas' => $task['priority'] ?? 'normal',
                'tenggat_waktu' => $task['due_date'] ?? 'Tidak ada',
                'kendala' => $task['feedback'] ?? 'Tidak ada',
            ];
        })->toArray();

        $contextData = "Total Tugas: $total. Data Detail: " . json_encode($mappedTasks);

        // --- PROMPT KHUSUS ANALISIS RISIKO ---
        $systemPrompt = "Anda adalah Konsultan Manajemen Risiko Proyek. Tugas Anda adalah menganalisis indikator keterlambatan dari data tugas yang diberikan.
        
        Berikan laporan dengan struktur berikut:
        1. Skor Kesehatan Proyek: (Berikan persentase 0-100%, 100% berarti sangat sehat/lancar).
        2. Analisis Bottleneck: (Sebutkan tugas mana saja yang menjadi penghambat utama, terutama yang berstatus 'postponed' atau melewati tenggat waktu).
        3. Prediksi Risiko: (Apa yang akan terjadi jika kendala saat ini tidak segera diselesaikan?).
        4. Rekomendasi Mitigasi Darurat: (Langkah taktis untuk menyelamatkan tenggat waktu).

        ATURAN MUTLAK: 
        - Gunakan bahasa Indonesia yang tegas, analitis, dan profesional.
        - JANGAN menyebutkan ID acak. Sebutkan langsung nama tugasnya.
        - Gunakan penomoran (1, 2, 3) untuk daftar. DILARANG menggunakan markdown bintang (*) atau pagar (#).";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('MINIMAX_API_KEY'),
                'Content-Type'  => 'application/json',
            ])
            ->timeout(30)
            ->retry(3, 1000)
            ->post(rtrim(env('MINIMAX_BASE_URL'), '/') . '/v1/chat/completions', [
                'model' => env('MINIMAX_MODEL', 'MiniMax-Text-01'),
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $contextData],
                ],
                'temperature' => 0.2, // Sedikit lebih tinggi dari breakdown agar AI bisa memberikan analisis prediktif
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $aiText = $result['choices'][0]['message']['content'] ?? 'AI gagal menghasilkan analisis.';
                return response()->json(['summary' => $aiText]);
            }

            Log::error('MiniMax API Health Analysis Error: ' . $response->body());
            return response()->json(['summary' => 'Layanan AI sedang sibuk. Gagal melakukan analisis kesehatan proyek.'], 500);

        } catch (\Exception $e) {
            Log::error('MiniMax Connection Exception (Health Analysis): ' . $e->getMessage());
            return response()->json(['summary' => 'Koneksi ke server AI terputus. Sistem tetap berjalan normal.'], 500);
        }
    }

    public function recommendAssignee(Request $request)
    {
        $title = $request->input('title', 'Tugas Baru');
        $description = $request->input('description', 'Tidak ada deskripsi');
        $projectId = $request->input('project_id');

        $project = \App\Models\Project::find($projectId);
        
        if (!$project) {
            return response()->json(['reply' => 'Data proyek tidak ditemukan.']);
        }
        
        // 1. Tarik data member menggunakan relasi yang aman (Sudah Terbukti Berhasil)
        $members = \App\Models\User::whereHas('workspaceMemberships', function($q) use ($project) {
            $q->where('workspace_id', $project->workspace_id)->where('is_active', true);
        })->get();

        if ($members->isEmpty()) {
            return response()->json(['reply' => 'Belum ada anggota tim di workspace ini.']);
        }

        // 2. Kumpulkan data beban kerja nyata (Tugas Aktif) dari database
        $activeTasks = \App\Models\Task::with('assignees')
            ->where('project_id', $projectId)
            ->whereNotIn('status', ['done', 'archived', 'postponed'])
            ->get();

        $workloadData = [];
        foreach ($members as $member) {
            $count = $activeTasks->filter(function($task) use ($member) {
                return $task->assignees->contains('id', $member->id);
            })->count();
            
            $workloadData[] = [
                'nama' => $member->name,
                'tugas_aktif' => $count
            ];
        }

        // 3. Siapkan Data Konteks untuk AI
        $contextData = "Tugas: $title\nDeskripsi: $description\n\nKandidat Tim & Beban Kerja Aktif (Jumlah Tugas):\n" . json_encode($workloadData);

        // 4. Prompt Khusus Rekomendasi SDM (Versi Dipertegas)
        $systemPrompt = "Anda adalah Asisten Manajer Proyek yang cerdas. Tugas Anda merekomendasikan 1 orang yang PALING TEPAT dari data yang diberikan.
        Pilih nama dengan 'tugas_aktif' paling sedikit.
        
        ATURAN MUTLAK: 
        1. Jika semua orang memiliki beban kerja sama (misal 0 tugas), langsung pilih SATU NAMA ASLI secara acak dari data JSON.
        2. Tulis langsung nama orangnya. DILARANG KERAS mengarang/menciptakan nama. WAJIB memilih dari daftar JSON yang diberikan.
        
        Gunakan format jawaban ini persis:
        ✨ Rekomendasi: Tulis Nama Asli Anggota Tim Di Sini
        💡 Alasan: Tulis alasan profesional di sini (Misal: karena jadwalnya saat ini sedang sepenuhnya luang dan siap untuk langsung mengeksekusi tugas ini).";

        try {
            // Gunakan path lengkap (\Illuminate\Support\Facades\...) agar terhindar dari Error 500
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . env('MINIMAX_API_KEY'),
                'Content-Type'  => 'application/json',
            ])
            ->timeout(30)
            ->retry(3, 1000)
            ->post(rtrim(env('MINIMAX_BASE_URL'), '/') . '/v1/chat/completions', [
                'model' => env('MINIMAX_MODEL', 'MiniMax-Text-01'),
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $contextData],
                ],
                // SUHU DIRENDAHKAN KE 0.1: Agar AI tidak berhalusinasi mengarang nama
                'temperature' => 0.1, 
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $aiText = $result['choices'][0]['message']['content'] ?? 'AI gagal memberikan rekomendasi.';
                
                // Return multi-key agar pasti ditangkap oleh frontend
                return response()->json([
                    'reply' => $aiText,
                    'recommendation' => $aiText 
                ]);
            }

            \Illuminate\Support\Facades\Log::error('MiniMax Assignee Error: ' . $response->body());
            return response()->json(['reply' => 'Layanan AI sedang sibuk.', 'recommendation' => 'Layanan AI sedang sibuk.'], 500);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('MiniMax Connection Exception: ' . $e->getMessage());
            return response()->json(['reply' => 'Koneksi ke server AI terputus.', 'recommendation' => 'Koneksi ke server AI terputus.'], 500);
        }
    }

    public function projectChat(Request $request)
    {
        $message = $request->input('message');
        $projectId = $request->input('project_id'); // Bisa null jika ngobrol di luar proyek
        $history = $request->input('history', []); 
        $user = auth()->user();

        // 1. PERBAIKAN ZONA WAKTU: Paksa menggunakan Waktu Indonesia Barat (WIB)
        $hariIni = now()->timezone('Asia/Jakarta')->translatedFormat('l, d F Y (H:i)'); 

        // 2. PERBAIKAN LOGIKA PROYEK: Dukungan Obrolan Global & Spesifik Proyek
        if ($projectId) {
            $project = \App\Models\Project::find($projectId);
            $projectName = $project ? $project->name : 'Global Workspace';
            $tasks = \App\Models\Task::with('assignees')->where('project_id', $projectId)->get();
        } else {
            // Jika ngobrol di luar proyek, ambil seluruh tugas user
            $projectName = 'Global Workspace (Semua Proyek)';
            $workspaceIds = $user->role === 'superadmin' 
                ? \App\Models\Workspace::pluck('id') 
                : $user->workspaceMemberships()->where('is_active', true)->pluck('workspace_id');
                
            $tasks = \App\Models\Task::with('assignees')->whereHas('project', function($q) use ($workspaceIds) {
                $q->whereIn('workspace_id', $workspaceIds);
            })->get();
        }

        $taskSummary = $tasks->map(function($t) {
            $assignees = $t->assignees->pluck('name')->join(', ') ?: 'Belum ada';
            $tglBuat = $t->created_at ? $t->created_at->timezone('Asia/Jakarta')->translatedFormat('d F Y') : '-';
            $tglUpdate = $t->updated_at ? $t->updated_at->timezone('Asia/Jakarta')->translatedFormat('d F Y') : '-';
            return "- Tugas: {$t->title} | Status: {$t->status} | PIC: {$assignees} | Dibuat: {$tglBuat} | Diubah: {$tglUpdate}";
        })->join("\n");

        // 3. PERBAIKAN PROMPT: Mengunci Acuan Waktu
        $systemPrompt = "Kamu adalah 'Naomi', rekan kerja dan asisten proyek virtual yang ramah, hangat, dan asyik. 
        
        KONTEKS SAAT INI (ACUAN ABSOLUT):
        - Waktu sekarang: {$hariIni} WIB
        - Lawan bicaramu: Kak {$user->name}
        - Lingkup Proyek: {$projectName}

        DATA TUGAS:
        {$taskSummary}

        ATURAN MUTLAK:
        1. Jawab seperti manusia. Gunakan kata 'Aku' dan panggil lawan bicara dengan 'Kak {$user->name}'.
        2. JANGAN menyalin ulang format data mentah. Rangkai datanya menjadi kalimat bercerita.
        3. Jika ditanya waktu, hari, atau tanggal, GUNAKAN 'KONTEKS SAAT INI' ({$hariIni} WIB). Dilarang menebak atau menggunakan waktu lain.
        4. Jika ditanya tugas hari ini, cek tanggal 'Dibuat' atau 'Diubah'.
        5. JIKA DIMINTA MENGHAPUS CHAT: Jawab persis 'Kak {$user->name} harus klik ikon Tong Sampah di pojok kanan atas obrolan ini biar ingatan aku keriset ya!'";

        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach (array_slice($history, -12) as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $message]; 

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('MINIMAX_API_KEY'),
                'Content-Type'  => 'application/json',
            ])->timeout(30)->post(rtrim(env('MINIMAX_BASE_URL'), '/') . '/v1/chat/completions', [
                'model' => env('MINIMAX_MODEL', 'MiniMax-Text-01'),
                'messages' => $messages,
                'temperature' => 0.4, // Diturunkan sedikit agar tidak berhalusinasi soal fakta/tanggal
            ]);

            if ($response->successful()) {
                return response()->json(['reply' => $response->json()['choices'][0]['message']['content'] ?? 'Duh, aku agak bingung nih. Boleh diulang?']);
            }
            return response()->json(['reply' => 'Maaf Kak, server aku lagi sibuk banget nih.'], 500);
        } catch (\Exception $e) {
            return response()->json(['reply' => 'Yah, koneksi aku ke server terputus Kak.'], 500);
        }
    }
}