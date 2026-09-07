import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function WorkspaceIndex({ workspaces }) {
    const { user } = usePage().props.auth;

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title="Main Workspace" />
            
            <div className="max-w-[1600px] mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
                
                {/* --- HERO BANNER --- */}
                <div className="relative w-full bg-gradient-to-r from-indigo-600/90 to-purple-700/90 dark:from-indigo-900/80 dark:to-purple-900/80 backdrop-blur-[26px] p-8 sm:p-12 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-sm overflow-hidden group">
                    <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-white/10 blur-[50px] rounded-full transform -skew-x-12 pointer-events-none"></div>
                    <div className="relative z-10 text-white">
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 drop-shadow-sm">
                            Halo, Kak {user.name.split(' ')[0]}! <span className="animate-wave inline-block origin-bottom-right">👋</span>
                        </h2>
                        <p className="text-indigo-100 dark:text-indigo-200 text-lg font-medium max-w-2xl">
                            Pusat kendali Anda telah siap. Silakan pilih Workspace di bawah ini untuk mulai berkolaborasi.
                        </p>
                    </div>
                </div>

                {/* --- JUDUL SEKSI --- */}
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-white/40 dark:border-white/5 shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Daftar Workspace Anda</h3>
                </div>
                
                {/* --- GRID WORKSPACE --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                    {workspaces && workspaces.length > 0 ? workspaces.map(ws => (
                        <Link key={ws.id} href={route('workspace.projects', ws.id)} className="relative bg-white/60 dark:bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100 to-transparent dark:from-indigo-900/30 rounded-bl-full opacity-50 group-hover/card:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="w-14 h-14 bg-white dark:bg-black/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-5 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-colors shadow-sm relative z-10">
                                <span className="font-extrabold text-xl">{ws.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="relative z-10">
                                <h4 className="font-extrabold text-gray-900 dark:text-white text-xl mb-1 truncate">{ws.name}</h4>
                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/50">Aktif</span>
                                    <p className="text-xs text-gray-400 font-bold flex items-center gap-1 group-hover/card:text-indigo-500 transition-colors">Akses <svg className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></p>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full p-12 text-center bg-white/40 dark:bg-black/20 backdrop-blur-md border-2 border-dashed border-gray-300 dark:border-white/10 rounded-[2.5rem]">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Anda belum bergabung dengan Workspace mana pun.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}