<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_user', function (Blueprint $table) {
            $table->id();
            
            // UBAH BARIS INI: Gunakan foreignUuid karena ID tasks Anda adalah UUID
            $table->foreignUuid('task_id')->constrained()->cascadeOnDelete(); 
            
            // Biarkan user_id tetap foreignId karena tabel users menggunakan angka (BigInt)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_user');
    }
};