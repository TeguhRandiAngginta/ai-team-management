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
}