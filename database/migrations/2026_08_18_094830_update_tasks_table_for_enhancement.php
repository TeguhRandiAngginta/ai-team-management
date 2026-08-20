<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Hapus assignee_id tunggal jika sebelumnya ada
            if (Schema::hasColumn('tasks', 'assignee_id')) {
                $table->dropForeign(['assignee_id']);
                $table->dropColumn('assignee_id');
            }

            // Cek satu per satu sebelum menambahkan kolom baru
            if (!Schema::hasColumn('tasks', 'start_date')) {
                $table->date('start_date')->nullable()->after('description');
            }
            
            if (!Schema::hasColumn('tasks', 'due_date')) {
                $table->date('due_date')->nullable()->after('start_date');
            }
            
            if (!Schema::hasColumn('tasks', 'tags')) {
                $table->string('tags')->nullable()->after('priority'); 
            }
            
            if (!Schema::hasColumn('tasks', 'author_id')) {
                $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete()->after('workspace_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'start_date')) $table->dropColumn('start_date');
            if (Schema::hasColumn('tasks', 'due_date')) $table->dropColumn('due_date');
            if (Schema::hasColumn('tasks', 'tags')) $table->dropColumn('tags');
            
            if (Schema::hasColumn('tasks', 'author_id')) {
                $table->dropForeign(['author_id']);
                $table->dropColumn('author_id');
            }

            if (!Schema::hasColumn('tasks', 'assignee_id')) {
                $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            }
        });
    }
};