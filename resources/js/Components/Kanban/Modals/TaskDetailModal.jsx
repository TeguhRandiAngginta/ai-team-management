import React from 'react';
import { useForm } from '@inertiajs/react';

export default function TaskDetailModal({ workspace, project, task, user, statusLabels, onClose, onApprove, onReject, onEdit, onDelete }) {
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

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6">
            <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* HEADER - TERKUNCI (SHRINK-0) */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.priority} Priority</span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-white border ${statusLabels[task.status]?.color.replace('bg-', 'text-').replace('400', '600')} border-gray-200 shadow-sm`}>{statusLabels[task.status]?.label}</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900">{task.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* BODY - BISA DI-SCROLL */}
                <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="space-y-8 flex-1">
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Deskripsi Tugas</h4>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{task.description || <span className="italic text-gray-400">Tidak ada deskripsi yang disertakan.</span>}</p>
                                </div>
                            </div>

                            {task.feedback && (
                                <div>
                                    <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Catatan Revisi Terakhir</h4>
                                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                                        <p className="text-sm text-red-700 whitespace-pre-wrap">{task.feedback}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Lampiran ({task.files?.length || 0})</h4>
                                {task.files?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {task.files.map(f => (
                                            <a key={f.id} href={`/storage/${f.file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-200">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 truncate group-hover:text-indigo-700">{f.original_name}</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-gray-400 italic">Tidak ada file yang dilampirkan.</p>}
                            </div>

                            {/* --- AREA DISKUSI / KOMENTAR --- */}
                            <div className="pt-8 mt-8 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 tracking-wider mb-5 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                    Diskusi Tugas
                                </h4>
                                
                                <div className="space-y-4 mb-6">
                                    {sortedComments.length > 0 ? sortedComments.map(comment => (
                                        <div key={comment.id} className={`flex gap-3 ${comment.user_id === user.id ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                                                {comment.user?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={`flex flex-col ${comment.user_id === user.id ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-xs font-bold text-gray-700">{comment.user_id === user.id ? 'Anda' : comment.user?.name}</span>
                                                    <span className="text-[10px] text-gray-400">{formatDateTime(comment.created_at)}</span>
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${comment.user_id === user.id ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-400 italic text-center py-4">Belum ada diskusi di tugas ini. Mulai percakapan!</p>
                                    )}
                                </div>

                                <form onSubmit={submitComment} className="mt-4 flex gap-2 relative">
                                    <input 
                                        type="text" 
                                        value={data.content} 
                                        onChange={e => setData('content', e.target.value)} 
                                        placeholder="Tulis pesan atau pertanyaan Anda di sini..." 
                                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-full pl-5 pr-14 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={processing || !data.content.trim()} 
                                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-5">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Dibuat Oleh</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">{task.author?.name.charAt(0).toUpperCase()}</div>
                                    <span className="text-sm font-semibold text-gray-800">{task.author?.name}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Penugasan</p>
                                {task.assignees?.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {task.assignees.map(a => (
                                            <div key={a.id} className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">{a.name.charAt(0).toUpperCase()}</div>
                                                <span className="text-sm font-semibold text-gray-800">{a.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <span className="text-sm text-gray-500">Belum ada penugasan</span>}
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Dibuat</p>
                                <p className="text-sm font-semibold text-gray-800">{formatDateTime(task.created_at)}</p>
                            </div>
                            {task.due_date && (
                                <div>
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Tenggat Waktu</p>
                                    <p className="text-sm font-bold text-red-600">{formatDate(task.due_date)}</p>
                                </div>
                            )}
                            {task.completed_at && (
                                <div>
                                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Diselesaikan Pada</p>
                                    <p className="text-sm font-bold text-green-600">{formatDateTime(task.completed_at)}</p>
                                </div>
                            )}
                        </div>
                        
                        {isUserTask && task.status !== 'done' && task.status !== 'archived' && (
                            <div className="flex gap-2">
                                <button onClick={() => { onClose(); onEdit(task); }} className="flex-1 py-2 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 transition-colors">Edit Tugas</button>
                                <button onClick={() => { onClose(); onDelete(task.id); }} className="flex-1 py-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 transition-colors">Hapus</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER - TERKUNCI (SHRINK-0) */}
                {task.status === 'review' && user.role !== 'karyawan' && (
                    <div className="p-6 bg-gray-900 border-t border-gray-800 flex gap-4 shrink-0">
                        <button onClick={() => { onClose(); onApprove(task.id); }} className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-extrabold text-sm py-4 rounded-xl shadow-lg transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            APPROVE & SELESAIKAN TUGAS
                        </button>
                        <button onClick={() => { onClose(); onReject(task); }} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 hover:bg-red-500 hover:border-red-400 text-white font-extrabold text-sm py-4 rounded-xl transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                            TOLAK & MINTA REVISI
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}