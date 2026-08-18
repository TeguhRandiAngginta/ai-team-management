<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids; // TAMBAHKAN IMPORT INI

class Task extends Model
{
    // TAMBAHKAN HasUuids DI SINI
    use HasFactory, HasUuids; 

    protected $fillable = [
        'project_id',
        'workspace_id',
        'author_id',
        'title',
        'description',
        'feedback',
        'status',
        'priority',
        'tags',
        'start_date',
        'due_date',
        'completed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'completed_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    // Relasi Pembuat Tugas
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    // Relasi Banyak Anggota (Multiple Assignees)
    public function assignees()
    {
        return $this->belongsToMany(User::class, 'task_user');
    }
    
    public function files()
    {
        return $this->hasMany(TaskFile::class);
    }
}