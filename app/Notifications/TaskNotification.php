<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\Task;

class TaskNotification extends Notification
{
    use Queueable;

    public $task;
    public $message;
    public $type;

    // Data yang akan dikirim saat notifikasi dipanggil
    public function __construct(Task $task, $message, $type = 'info')
    {
        $this->task = $task;
        $this->message = $message;
        $this->type = $type; // tipe: 'assigned' (tugas baru), 'revised' (revisi), 'reminder' (pengingat)
    }

    // Kita hanya simpan ke Database (bisa ditambah 'mail' kalau mau kirim ke Email)
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    // Format data yang disimpan ke database
    public function toArray(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'title' => $this->task->title,
            'message' => $this->message,
            'type' => $this->type,
        ];
    }
}