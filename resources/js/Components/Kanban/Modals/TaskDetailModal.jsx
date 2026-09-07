import React from 'react';
import { useForm } from '@inertiajs/react';

export default function TaskDetailModal({ workspace, project, task, user, statusLabels, onClose, onApprove, onReject, onEdit, onDelete, onReportIssue }) {
    if (!task) return null;

    const { data, setData, post, processing, reset } = useForm({
        content: '',
    });

    const submitComment = (e) => {
        e.preventDefault();
        post(route('workspace.projects.tasks.comments.store', { workspace: workspace.id, project: project.id, task: task.id }), {
            preserveScroll: true,
            onSuccess: () => reset('content'),
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const isUserTask = user.role !== 'karyawan' || task.assignees?.some(a => a.id === user.id) || task.author_id === user.id;
    const sortedComments = task.comments ? [...task.comments].reverse() : [];

    // Filter warna label aman untuk mode gelap
    const statusColor = statusLabels[task.status]?.color?.replace('bg-', 'text-').replace('400', '600').replace('dark:', '') || 'text-gray-600';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/80 dark:bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-fadeIn">
            <div className="bg-white/95 dark:bg-[#0a192f]/95 backdrop-blur-[26px] saturate-[118%] rounded-[2.5rem] border border-white/50 dark:border-white/10 w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* HEADER KACA */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-start bg-gray-50/50 dark:bg-white/5 shrink-0">
                    <div className="pr-4">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border shadow-sm ${task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' : task.priority === 'low' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'}`}>
                                {task.priority} Priority
                            </span>
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest bg-white dark:bg-black/20 border ${statusColor} border-gray-200 dark:border-white/20 shadow-sm`}>
                                {statusLabels[task.status]?.label}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{task.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/20 shadow-sm transition-all outline-none">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* BODY DETAIL */}
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 hide-scrollbar">
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="space-y-8 flex-1">
                            
                            {/* Deskripsi */}
                            <div>
                                <h4 className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-lg">📝</span> Deskripsi Tugas</h4>
                                <div className="bg-gray-50/80 dark:bg-black/20 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-medium">{task.description || <span className="italic text-gray-400">Tidak ada deskripsi yang disertakan.</span>}</p>
                                </div>
                            </div>

                            {/* Catatan Kendala / Revisi */}
                            {task.feedback && (
                                <div>
                                    <h4 className="text-xs font-extrabold text-red-500 dark:text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-lg">🚨</span> Catatan / Alasan Terkendala</h4>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-5 sm:p-6 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-inner">
                                        <p className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap font-bold">{task.feedback}</p>
                                    </div>
                                </div>
                            )}

                            {/* Lampiran File */}
                            <div>
                                <h4 className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-lg">📎</span> Lampiran ({task.files?.length || 0})</h4>
                                {task.files?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {task.files.map(f => (
                                            <a key={f.id} href={`/storage/${f.file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-colors group shadow-sm bg-white dark:bg-black/20">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{f.original_name}</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-gray-400 dark:text-gray-500 italic font-medium px-2">Tidak ada file yang dilampirkan.</p>}
                            </div>

                            {/* AREA DISKUSI CHAT */}
                            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/10">
                                <h4 className="text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="text-lg">💬</span> Diskusi Tugas
                                </h4>
                                
                                <div className="space-y-5 mb-6">
                                    {sortedComments.length > 0 ? sortedComments.map(comment => (
                                        <div key={comment.id} className={`flex gap-3 ${comment.user_id === user.id ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-md border-2 border-white dark:border-[#0a192f]">
                                                {comment.user?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={`flex flex-col ${comment.user_id === user.id ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                                <div className="flex items-baseline gap-2 mb-1.5 px-1">
                                                    <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300">{comment.user_id === user.id ? 'Anda' : comment.user?.name}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">{formatDateTime(comment.created_at)}</span>
                                                </div>
                                                <div className={`p-3.5 rounded-2xl text-sm font-medium whitespace-pre-wrap shadow-sm ${comment.user_id === user.id ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-white/5 rounded-tl-sm'}`}>
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="bg-gray-50 dark:bg-black/20 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-6 text-center">
                                            <p className="text-sm text-gray-400 dark:text-gray-500 font-bold">Belum ada diskusi di tugas ini. Mulai percakapan!</p>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={submitComment} className="mt-4 flex gap-2 relative">
                                    <input 
                                        type="text" 
                                        value={data.content} 
                                        onChange={e => setData('content', e.target.value)} 
                                        placeholder="Ketik balasan atau pertanyaan Anda di sini..." 
                                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 text-sm rounded-full pl-5 pr-14 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-black/50 transition-all outline-none"
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={processing || !data.content.trim()} 
                                        className="absolute right-1.5 top-1.5 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-md"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR INFORMASI TUGAS (KANAN) */}
                    <div className="space-y-6">
                        <div className="bg-gray-50/80 dark:bg-black/20 border border-gray-100 dark:border-white/5 shadow-inner rounded-[2rem] p-6 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 dark:from-indigo-900/30 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>

                            <div className="relative z-10">
                                <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Dibuat Oleh</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm border border-white dark:border-[#0a192f]">{task.author?.name.charAt(0).toUpperCase()}</div>
                                    <span className="text-sm font-extrabold text-gray-800 dark:text-white">{task.author?.name}</span>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Didelegasikan Kepada</p>
                                {task.assignees?.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {task.assignees.map(a => (
                                            <div key={a.id} className="flex items-center gap-3 bg-white dark:bg-white/5 p-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white dark:border-[#0a192f]">{a.name.charAt(0).toUpperCase()}</div>
                                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{a.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <span className="text-sm text-gray-500 dark:text-gray-400 font-medium italic bg-white dark:bg-white/5 px-3 py-2 rounded-lg border border-gray-100 dark:border-white/5">Belum ada penugasan</span>}
                            </div>

                            <div className="pt-5 border-t border-gray-200 dark:border-white/10 relative z-10 space-y-4">
                                <div>
                                    <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Tanggal Dibuat</p>
                                    <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 ml-5">{formatDateTime(task.created_at)}</p>
                                </div>
                                
                                {task.due_date && (
                                    <div>
                                        <p className="text-[10px] font-extrabold text-red-500 dark:text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Tenggat Waktu</p>
                                        <p className="text-sm font-extrabold text-red-600 dark:text-red-400 ml-5 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md w-fit">{formatDate(task.due_date)}</p>
                                    </div>
                                )}

                                {task.completed_at && (
                                    <div>
                                        <p className="text-[10px] font-extrabold text-green-500 dark:text-green-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Diselesaikan Pada</p>
                                        <p className="text-sm font-extrabold text-green-600 dark:text-green-400 ml-5">{formatDateTime(task.completed_at)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* AKSI TUGAS (EDIT, HAPUS, & LAPOR KENDALA) */}
                        {isUserTask && task.status !== 'done' && task.status !== 'archived' && (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <button onClick={() => { onClose(); onEdit(task); }} className="flex-1 py-3 bg-white dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-extrabold text-gray-700 dark:text-gray-300 transition-colors shadow-sm outline-none">✏️ Edit Tugas</button>
                                    <button onClick={() => { onClose(); onDelete(task.id); }} className="flex-1 py-3 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-extrabold text-gray-700 dark:text-gray-300 transition-colors shadow-sm outline-none">🗑️ Hapus</button>
                                </div>
                                
                                <button 
                                    onClick={() => onReportIssue(task)}
                                    className="w-full py-3.5 text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2 shadow-sm outline-none"
                                >
                                    🛑 Lapor Kendala
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER AKSI MANAGER */}
                {task.status === 'review' && user.role !== 'karyawan' && (
                    <div className="p-6 bg-gray-900 dark:bg-black/40 border-t border-gray-800 dark:border-white/10 flex flex-col sm:flex-row gap-4 shrink-0">
                        <button onClick={() => { onClose(); onApprove(task.id); }} className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-extrabold text-xs sm:text-sm py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 outline-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            APPROVE & SELESAIKAN
                        </button>
                        <button onClick={() => { onClose(); onReject(task); }} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 dark:bg-white/5 border border-gray-700 dark:border-white/10 hover:bg-red-500 hover:border-red-400 text-white font-extrabold text-xs sm:text-sm py-4 rounded-xl transition-all shadow-sm outline-none hover:shadow-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                            TOLAK & REVISI
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}