import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ workspaces }) {
    // Mengambil data user yang sedang login (untuk banner)
    const { user } = usePage().props.auth;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                    Overview
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                
                {/* Banner Selamat Datang (Style Pastel/Modern) */}
                <div className="bg-[#E6E6FA] rounded-[2rem] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
                    {/* Ornamen Latar Belakang */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
                    
                    <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-950 mb-3">
                            Hai, {user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-indigo-800 font-medium text-base sm:text-lg max-w-lg">
                            Selamat datang kembali. Siap untuk mengelola proyek dan berkolaborasi bersama tim Anda hari ini?
                        </p>
                    </div>
                    
                    {/* Area Ilustrasi */}
                    <div className="relative z-10 hidden md:flex items-center justify-center w-56 h-36 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm text-indigo-500 font-semibold text-sm">
                        [ Area Ilustrasi / Gambar ]
                    </div>
                </div>

                {/* Bagian Daftar Workspace */}
                <div>
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h3 className="text-xl font-bold text-gray-800">Daftar Workspace Anda</h3>
                        <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-indigo-100">
                            {workspaces?.length || 0} Total
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workspaces && workspaces.length > 0 ? (
                            workspaces.map((workspace) => (
                                <div 
                                    key={workspace.id}
                                    className="bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100 flex flex-col h-full group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100">
                                            Aktif
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h4 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                            {workspace.name}
                                        </h4>
                                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                            Akses ruang kerja terisolasi ini untuk melihat anggota tim, aktivitas, dan papan tugas Anda.
                                        </p>
                                    </div>

                                    <Link
                                        href={`/workspaces/${workspace.id}`}
                                        className="w-full flex items-center justify-center py-3.5 px-4 bg-gray-50 text-indigo-600 font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 border border-gray-100 group-hover:border-transparent"
                                    >
                                        Buka Workspace
                                        <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-5">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Workspace</h4>
                                <p className="text-gray-500 text-center max-w-sm">Anda belum ditugaskan ke ruang kerja manapun. Silakan hubungi Administrator Anda.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}