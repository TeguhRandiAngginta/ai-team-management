<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary(); // WAJIB UUID
            $table->foreignUuid('project_id')->constrained('projects')->onDelete('cascade');
            
            // Relasi ke User (BigInt bawaan Laravel). Boleh kosong (null) jika task belum di-assign
            $table->foreignId('assignee_id')->nullable()->constrained('users')->onDelete('set null'); 
            
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('todo'); // Untuk Kanban: todo, in_progress, review, done
            $table->string('priority')->default('medium'); // low, medium, high
            $table->date('due_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};