import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import BackButton from '@/Components/BackButton'; // Memanggil template tombol kembali

export default function WorkspaceDashboard({ workspace }) {
    return (
        <AuthenticatedLayout header={<></>}>
            <Head title={`${workspace?.name} - Overview`} />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Menggunakan Template Tombol Kembali yang baru dibuat */}
                <BackButton href={route('dashboard')}>
                    Kembali ke Daftar Workspace
                </BackButton>

                {/* Header Section dengan Navigasi Internal */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-extrabold text-xl">
                                {workspace?.name.charAt(0)}
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">{workspace?.name}</h2>
                        </div>
                        <p className="text-gray-500 ml-15">Ruang kerja aktif untuk manajemen tim dan proyek.</p>
                    </div>

                    {/* Navigasi Tab Modern (Pill Style) */}
                    <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="px-6 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-lg shadow-sm">
                            Overview
                        </span>
                        <Link 
                            href={route('workspace.members', workspace.id)}
                            className="px-6 py-2.5 text-gray-500 hover:text-indigo-600 font-bold text-sm rounded-lg transition-colors"
                        >
                            Tim
                        </Link>
                        <Link 
                            href={route('workspace.projects', workspace.id)}
                            className="px-6 py-2.5 text-gray-500 hover:text-indigo-600 font-bold text-sm rounded-lg transition-colors"
                        >
                            Proyek
                        </Link>
                    </div>
                </div>

                {/* Bento Grid Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Kartu 1: Info Anggota */}
                    <div className="bg-gradient-to-br from-[#55c5d1] to-[#43aab5] rounded-[2rem] p-8 text-white shadow-sm relative overflow-hidden">
                        <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                        <h4 className="font-semibold text-white/80 mb-1">Status Tim</h4>
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-extrabold">Aktif</span>
                        </div>
                        <p className="mt-6 text-sm text-white/90">Buka menu Tim untuk mengelola peran dan anggota.</p>
                    </div>

                    {/* Kartu 2: Info AI (Persiapan untuk Fase 3) */}
                    <div className="bg-[#E6E6FA] rounded-[2rem] p-8 shadow-sm relative overflow-hidden border border-purple-100">
                        <div className="absolute right-[-10%] bottom-[-10%] w-32 h-32 bg-purple-200 rounded-full blur-xl"></div>
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-purple-800 mb-1">Insight AI</h4>
                            <span className="bg-white/60 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">Segera Hadir</span>
                        </div>
                        <div className="mt-4">
                            <div className="h-2 w-full bg-purple-200 rounded-full mb-3"></div>
                            <div className="h-2 w-2/3 bg-purple-200 rounded-full"></div>
                        </div>
                        <p className="mt-6 text-sm text-purple-700 font-medium">Asisten AI sedang dipersiapkan untuk workspace ini.</p>
                    </div>

                    {/* Kartu 3: Pintasan Aksi */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
                        <h4 className="font-bold text-gray-900 mb-4 text-center">Butuh tindakan cepat?</h4>
                        <div className="space-y-3">
                            <Link 
                                href={route('workspace.projects', workspace.id)} 
                                className="w-full flex items-center justify-center py-3 bg-gray-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors border border-gray-100"
                            >
                                Kelola Papan Proyek
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}