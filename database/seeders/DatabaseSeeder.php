<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Roles
        $superAdminRole = Role::firstOrCreate(['name' => 'SuperAdmin'], ['description' => 'Akses penuh sistem']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin'], ['description' => 'Pengelola workspace dan project']);
        $karyawanRole = Role::firstOrCreate(['name' => 'Karyawan'], ['description' => 'Anggota tim']);

        // 2. Buat Akun SuperAdmin
        $superAdminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'), // Ganti di production
                'email_verified_at' => now(),
            ]
        );

        // 3. Buat Main Workspace
        $workspace = Workspace::firstOrCreate(
            ['slug' => Str::slug('Main Workspace')],
            [
                'name' => 'Main Workspace',
                'owner_id' => $superAdminUser->id,
            ]
        );

        // 4. Masukkan SuperAdmin ke dalam Workspace
        WorkspaceMember::firstOrCreate(
            [
                'workspace_id' => $workspace->id,
                'user_id' => $superAdminUser->id,
            ],
            [
                'role_id' => $superAdminRole->id,
                'is_active' => true,
                'joined_at' => now(),
            ]
        );
    }
}