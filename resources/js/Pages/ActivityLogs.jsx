import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ActivityLogs({ logs }) {
    
    // Fungsi untuk mengubah warna badge berdasarkan tipe aksi (Sudah Ditambah Dark Mode)
    const getActionColor = (action) => {
        if (action === 'created') return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50';
        if (action === 'updated') return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
        if (action === 'deleted') return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50';
        return 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/20';
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-extrabold text-gray-800 dark:text-white/90 leading-tight">Jejak Aktivitas</h2>}>
            <Head title="Activity Log" />

            <div className="max-w-5xl mx-auto mt-4 pb-10">
                
                {/* --- PANEL LIQUID GLASS UTAMA --- */}
                <div className="relative w-full p-8 sm:p-10 bg-white/60 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-sm overflow-hidden group">
                    
                    {/* Pantulan Cahaya (Sheen) */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden rounded-[2.5rem]">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>

                    <div className="mb-8 relative z-10">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Riwayat Perubahan (Audit Trail)</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Semua aktivitas pembuatan, perubahan, dan penghapusan data terekam di sini.</p>
                    </div>

                    <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900/50 ml-4 space-y-8 pb-4 z-10">
                        {logs.length > 0 ? logs.map((log) => {
                            
                            // --- DETEKSI KENDALA & PENYELESAIAN ---
                            const isIssue = log.description.includes('🚨');
                            const isResolved = log.description.includes('▶️');
                            
                            return (
                                <div key={log.id} className="relative pl-8 group/item">
                                    {/* Timeline Dot Dinamis */}
                                    <div className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#04121b] shadow-sm group-hover/item:scale-125 transition-transform ${isIssue ? 'bg-red-500' : isResolved ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
                                    
                                    {/* Kotak Konten Dinamis (Glass Card) */}
                                    <div className={`rounded-2xl p-5 border backdrop-blur-md hover:shadow-md transition-all ${isIssue ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-900/50' : isResolved ? 'bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 hover:border-green-300 dark:hover:border-green-900/50' : 'bg-white/50 dark:bg-black/20 border-gray-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-white/10'}`}>
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-gray-900 dark:text-white">{log.user.name}</span>
                                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        
                                        {/* Teks Deskripsi Dinamis */}
                                        <p className={`text-sm mb-3 ${isIssue ? 'text-red-700 dark:text-red-400 font-bold' : isResolved ? 'text-green-700 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {log.description}
                                        </p>
                                        
                                        {log.workspace && (
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${isIssue ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50' : isResolved ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'}`}>
                                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                Workspace: {log.workspace.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="pl-8 text-sm text-gray-400 dark:text-gray-500 font-medium">
                                Belum ada aktivitas yang terekam.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}