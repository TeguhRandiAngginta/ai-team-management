<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'workspace_id', 'action', 'description'];

    // Relasi ke User (Siapa yang melakukan)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Workspace (Terjadi di ruang kerja mana)
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    // Helper function agar kita gampang memanggilnya dari Controller mana saja
    public static function log($action, $description, $workspaceId = null)
    {
        if (auth()->check()) {
            self::create([
                'user_id' => auth()->id(),
                'workspace_id' => $workspaceId,
                'action' => $action,
                'description' => $description
            ]);
        }
    }
}