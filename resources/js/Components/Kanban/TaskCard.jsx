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
            onDragStart={hasAccess ? (e) => { e.dataTransfer.setData('taskId', task.id); setTimeout(() => e.target.classList.add('opacity-40'), 0); } : undefined} 
            onDragEnd={hasAccess ? (e) => e.target.classList.remove('opacity-40') : undefined} 
            onClick={() => onDetail(task)} 
            // PERBAIKAN: Efek buram dihapus. Semua tugas kini 100% terlihat jelas
            className={`bg-white p-5 rounded-2xl shadow-sm border transition-all flex flex-col group relative cursor-pointer ${hasAccess ? 'hover:border-indigo-300 hover:shadow-md' : 'hover:border-gray-300'} ${task.feedback ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100'}`}
        >
            {hasAccess && !isCompact && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-lg shadow-sm border border-gray-100 z-10">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded" title="Edit"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Hapus"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            )}

            <div className="flex flex-wrap gap-1 mb-2.5">
                {!isCompact && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.priority}</span>}
                {task.tags && task.tags.split(',').map((tag, i) => <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{tag.trim()}</span>)}
            </div>

            <div className={`${isCompact ? 'mb-1' : 'pr-12 mb-3'}`}>
                <h5 className="text-sm font-bold text-gray-800 leading-snug">{task.title}</h5>
                {!isCompact && task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
            </div>

            {!isCompact && task.feedback && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-2.5"><span className="text-[10px] font-bold text-red-600 uppercase block mb-0.5">Catatan Revisi:</span><p className="text-xs text-red-700 leading-relaxed">{task.feedback}</p></div>
            )}

            {!isCompact && task.files?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {task.files.map(file => (
                        <div key={file.id} className="text-[10px] font-medium bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-indigo-600 flex items-center gap-1">📎 {file.original_name.length > 15 ? file.original_name.substring(0, 15) + '...' : file.original_name}</div>
                    ))}
                </div>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between">
                <div className="flex flex-col gap-1 w-full">
                    <span className="text-[10px] text-gray-400 font-medium">Oleh: {task.author?.name} • {formatDate(task.created_at)}</span>
                    {!isCompact && task.due_date && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-md w-fit"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Tenggat: {formatDate(task.due_date)}</span>}
                </div>
                {task.assignees?.length > 0 && (
                    <div className="flex -space-x-2 shrink-0 ml-2">
                        {task.assignees.map(assignee => <div key={assignee.id} title={assignee.name} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm">{assignee.name.charAt(0).toUpperCase()}</div>)}
                    </div>
                )}
            </div>
        </div>
    );
}