import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import moment from 'moment';
import 'moment/locale/id';

export default function IssueCenter({ issues }) {
    moment.locale('id');

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title="Pusat Kendala Global" />
            
            <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8">
                
                {/* HEADER HALAMAN */}
                <div className="bg-white dark:bg-[#0a192f] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 dark:bg-red-900/20 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold mb-3 uppercase tracking-wider border border-red-100 dark:border-red-900/50 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Command Center
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Pusat Kendala Proyek</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Pantau dan selesaikan semua tugas yang terhambat dari seluruh workspace Anda.</p>
                    </div>
                    <div className="relative z-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-center shadow-inner">
                        <p className="text-sm font-bold uppercase tracking-wider mb-1">Total Kendala</p>
                        <p className="text-4xl font-extrabold">{issues.total}</p>
                    </div>
                </div>

                {/* DAFTAR KENDALA */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issues.data.length === 0 ? (
                        <div className="col-span-full bg-white dark:bg-white/5 p-12 rounded-[2rem] border border-gray-100 dark:border-white/10 text-center shadow-sm backdrop-blur-md">
                            <span className="text-6xl mb-4 block">🎉</span>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Semua Aman Terkendali!</h3>
                            <p className="text-gray-500 dark:text-gray-400">Saat ini tidak ada satu pun proyek atau tugas yang mengalami kendala.</p>
                        </div>
                    ) : (
                        issues.data.map((issue) => (
                            <div key={issue.id} className="bg-white dark:bg-[#0a192f]/80 rounded-[2rem] p-6 shadow-sm border border-red-100 dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col backdrop-blur-[26px] saturate-[118%]">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/10 max-w-[70%]">
                                        <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Proyek</p>
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{issue.project?.name}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-2 py-1 rounded-md">
                                        {moment(issue.updated_at).fromNow()}
                                    </span>
                                </div>

                                <h4 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2 line-clamp-2">{issue.title}</h4>
                                
                                <div className="bg-red-50/50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 mb-6 flex-1 shadow-inner">
                                    <p className="text-[10px] font-extrabold text-red-400 dark:text-red-500 uppercase tracking-wider mb-1.5">Alasan Kendala:</p>
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300 italic">"{issue.feedback || 'Tidak ada alasan yang diberikan.'}"</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/10 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shadow-sm">
                                            {issue.assignees?.[0]?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-bold text-gray-900 dark:text-gray-200 line-clamp-1 max-w-[100px]">{issue.assignees?.[0]?.name || 'Tidak ada'}</p>
                                            <p className="text-gray-400 dark:text-gray-500">Pelapor</p>
                                        </div>
                                    </div>
                                    
                                    {/* TOMBOL TELEPORTASI */}
                                    <Link 
                                        href={route('workspace.projects.tasks', { workspace: issue.project?.workspace_id, project: issue.project_id })}
                                        className="px-4 py-2 bg-gray-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Bantu Selesaikan <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* PAGINATION */}
                {issues.last_page > 1 && (
                    <div className="flex justify-center mt-8">
                        {issues.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`px-4 py-2 mx-1 rounded-xl text-sm font-bold transition-colors shadow-sm ${link.active ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}