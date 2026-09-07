import React from 'react';

export default function TaskCard({ task, hasAccess, isCompact, onEdit, onDelete, onDetail }) {
    if (!task) return null;
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div 
            draggable={hasAccess ? "true" : "false"} 
            onDragStart={hasAccess ? (e) => { 
                e.dataTransfer.setData('taskId', task.id); 
                setTimeout(() => e.target.classList.add('opacity-40'), 0); 
            } : undefined} 
            onDragEnd={hasAccess ? (e) => e.target.classList.remove('opacity-40') : undefined} 
            onClick={() => onDetail(task)} 
            // LIQUID GLASS + DARK MODE UPGRADE
            className={`bg-white/80 dark:bg-white/5 backdrop-blur-[12px] p-5 rounded-2xl shadow-sm border transition-all flex flex-col group relative cursor-pointer
                ${hasAccess ? 'hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md hover:-translate-y-1 hover:bg-white dark:hover:bg-white/10' : 'hover:border-gray-300 dark:hover:border-white/20'} 
                ${task.feedback ? 'border-red-300 dark:border-red-800/50 ring-2 ring-red-100 dark:ring-red-900/30 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-100 dark:border-white/10'}
            `}
        >
            {hasAccess && !isCompact && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/60 backdrop-blur-md p-1 rounded-lg shadow-sm border border-gray-100 dark:border-white/10 z-10">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors" title="Edit">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Hapus">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-2.5">
                {!isCompact && (
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' : 
                        task.priority === 'low' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' : 
                        'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                    }`}>
                        {task.priority}
                    </span>
                )}
                {task.tags && task.tags.split(',').map((tag, i) => (
                    <span key={i} className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                        {tag.trim()}
                    </span>
                ))}
            </div>

            <div className={`${isCompact ? 'mb-1' : 'pr-12 mb-3'}`}>
                <h5 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</h5>
                {!isCompact && task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 font-medium">{task.description}</p>}
            </div>

            {!isCompact && task.feedback && (
                <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-2.5 shadow-inner">
                    <span className="text-[9px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-0.5">Catatan Revisi / Kendala:</span>
                    <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed font-medium line-clamp-2" title={task.feedback}>{task.feedback}</p>
                </div>
            )}

            {!isCompact && task.files?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {task.files.map(file => (
                        <div key={file.id} className="text-[10px] font-bold bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-1 shadow-sm">
                            📎 {file.original_name.length > 12 ? file.original_name.substring(0, 12) + '...' : file.original_name}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/10 flex items-end justify-between">
                <div className="flex flex-col gap-1 w-full">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold truncate pr-2">
                        Oleh: {task.author?.name.split(' ')[0]} • {formatDate(task.created_at)}
                    </span>
                    {!isCompact && task.due_date && (
                        <span className="text-[9px] text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 px-1.5 py-0.5 rounded-md w-fit uppercase tracking-wider">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Tenggat: {formatDate(task.due_date)}
                        </span>
                    )}
                </div>
                {task.assignees?.length > 0 && (
                    <div className="flex -space-x-2 shrink-0 ml-2">
                        {task.assignees.map(assignee => (
                            <div key={assignee.id} title={assignee.name} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-[#0a192f] flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                                {assignee.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}