import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import BackButton from '@/Components/BackButton';
import ActionBtn from '@/Components/ActionBtn';

export default function WorkspaceTasks({ workspace, project, tasks, members }) {
    const { user } = usePage().props.auth;
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // State Modal Catatan Revisi
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rejectingTask, setRejectingTask] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');

    // State Modal Detail (Review Mode)
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [activeTask, setActiveTask] = useState(null);

    // State Dropdown & Error
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAssigneeDropdownOpen(false); setIsPriorityDropdownOpen(false); setIsStatusDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { data, setData, post, patch, processing, reset } = useForm({
        title: '', description: '', status: 'todo', priority: 'medium', assignee_ids: [], due_date: '', tags: '', files: []
    });

    const openCreateForm = () => { 
        reset(); setEditMode(false); setEditingId(null); setShowModal(true); 
        setIsAssigneeDropdownOpen(false); setIsPriorityDropdownOpen(false); setIsStatusDropdownOpen(false);
    };

    const openEditForm = (task) => {
        setData({
            title: task.title, description: task.description || '', status: task.status, priority: task.priority,
            assignee_ids: task.assignees?.length > 0 ? task.assignees.map(a => a.id) : [], 
            due_date: task.due_date ? task.due_date.split('T')[0] : '', 
            tags: task.tags || '', files: []
        });
        setEditMode(true); setEditingId(task.id); setShowModal(true); 
        setIsAssigneeDropdownOpen(false); setIsPriorityDropdownOpen(false); setIsStatusDropdownOpen(false);
    };

    const deleteTask = (id) => {
        if (confirm('Yakin ingin menghapus tugas ini?')) {
            router.delete(route('workspace.projects.tasks.destroy', { workspace: workspace.id, project: project.id, task: id }));
            setShowDetailModal(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const closeAllDropdowns = () => { setIsAssigneeDropdownOpen(false); setIsPriorityDropdownOpen(false); setIsStatusDropdownOpen(false); };

        if (editMode) {
            router.post(route('workspace.projects.tasks.update', { workspace: workspace.id, project: project.id, task: editingId }), {
                _method: 'PATCH', ...data
            }, {
                onSuccess: () => { reset(); setShowModal(false); closeAllDropdowns(); if(activeTask) { setShowDetailModal(false); } },
                onError: (errors) => { if (errors.message) setErrorMessage(errors.message); }
            });
        } else {
            post(route('workspace.projects.tasks.store', { workspace: workspace.id, project: project.id }), { 
                onSuccess: () => { reset(); setShowModal(false); closeAllDropdowns(); },
                onError: (errors) => { if (errors.message) setErrorMessage(errors.message); }
            });
        }
    };

    const updateTaskStatus = (taskId, newStatus, extraData = {}) => {
        router.patch(route('workspace.projects.tasks.update', { workspace: workspace.id, project: project.id, task: taskId }), 
        { status: newStatus, ...extraData }, { 
            preserveScroll: true,
            onSuccess: () => setShowDetailModal(false), 
            onError: (errors) => {
                if (errors.message) setErrorMessage(errors.message);
                else setErrorMessage("Anda tidak memiliki izin untuk melakukan aksi ini.");
            }
        });
    };

    const handleOpenFeedback = (task) => {
        setRejectingTask(task); setFeedbackText(''); setShowFeedbackModal(true); setShowDetailModal(false);
    };

    const submitFeedback = (e) => {
        e.preventDefault();
        if (!rejectingTask) return;
        updateTaskStatus(rejectingTask.id, 'in_progress', { feedback: feedbackText });
        setShowFeedbackModal(false); setRejectingTask(null);
    };

    const handleDragStart = (e, taskId) => { e.dataTransfer.setData('taskId', taskId); setTimeout(() => { e.target.classList.add('opacity-40'); }, 0); };
    const handleDragEnd = (e) => { e.target.classList.remove('opacity-40'); };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = (e, newStatus) => {
        e.preventDefault(); const taskId = e.dataTransfer.getData('taskId');
        if (taskId) updateTaskStatus(taskId, newStatus);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const isUserTask = (task) => {
        if (user.role !== 'karyawan') return true; 
        const isAssignee = task.assignees?.some(a => a.id === user.id);
        const isAuthor = task.author_id === user.id;
        return isAssignee || isAuthor;
    };

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const postponedTasks = tasks.filter(t => t.status === 'postponed');
    const reviewTasks = tasks.filter(t => t.status === 'review');
    const doneTasks = tasks.filter(t => t.status === 'done');
    const archivedTasks = tasks.filter(t => t.status === 'archived');

    const statusLabels = {
        todo: { label: 'To Do', color: 'bg-gray-400' },
        in_progress: { label: 'In Progress', color: 'bg-blue-400' },
        postponed: { label: 'Postponed', color: 'bg-orange-400' },
        review: { label: 'Review', color: 'bg-yellow-400' },
        done: { label: 'Done', color: 'bg-green-400' },
        archived: { label: 'Archived', color: 'bg-gray-600' }
    };

    const KanbanColumn = ({ title, status, taskList, headerColor, bgColor }) => {
        const isCompact = status === 'done' || status === 'archived'; 

        return (
            <div className={`${bgColor} min-w-[320px] max-w-[320px] shrink-0 rounded-[2rem] p-5 min-h-[600px] border border-gray-100 transition-colors flex flex-col snap-start`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)}>
                <div className="flex items-center justify-between mb-5 px-2">
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-700 flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${headerColor}`}></span>{title}</h4>
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100">{taskList.length}</span>
                </div>
                
                <div className="space-y-4 flex-1">
                    {taskList.length > 0 ? taskList.map(task => {
                        const hasAccess = isUserTask(task);
                        return (
                            <div 
                                key={task.id} 
                                draggable={hasAccess ? "true" : "false"} 
                                onDragStart={hasAccess ? (e) => handleDragStart(e, task.id) : undefined} 
                                onDragEnd={hasAccess ? handleDragEnd : undefined} 
                                onClick={() => { setActiveTask(task); setShowDetailModal(true); }} 
                                className={`bg-white p-5 rounded-2xl shadow-sm border transition-all flex flex-col group relative cursor-pointer 
                                    ${hasAccess ? 'hover:border-indigo-300 hover:shadow-md' : 'opacity-80'} 
                                    ${task.feedback ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100'}`}
                            >
                                {/* Tombol Aksi Kanan Atas (KINI HANYA EDIT DAN HAPUS) */}
                                {hasAccess && !isCompact && (
                                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-lg shadow-sm border border-gray-100 z-10">
                                        <button onClick={(e) => { e.stopPropagation(); openEditForm(task); }} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded" title="Edit"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Hapus"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                )}

                                {/* Header Ringkas */}
                                <div className="flex flex-wrap gap-1 mb-2.5">
                                    {!isCompact && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.priority}</span>}
                                    {task.tags && task.tags.split(',').map((tag, i) => <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{tag.trim()}</span>)}
                                </div>

                                <div className={`${isCompact ? 'mb-1' : 'pr-12 mb-3'}`}>
                                    <h5 className="text-sm font-bold text-gray-800 leading-snug">{task.title}</h5>
                                    {!isCompact && task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                                </div>

                                {!isCompact && task.feedback && (
                                    <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-2.5">
                                        <span className="text-[10px] font-bold text-red-600 uppercase block mb-0.5">Catatan Revisi:</span>
                                        <p className="text-xs text-red-700 leading-relaxed">{task.feedback}</p>
                                    </div>
                                )}
                                {!isCompact && task.files && task.files.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {task.files.map(file => (
                                            <div key={file.id} className="text-[10px] font-medium bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-indigo-600 flex items-center gap-1">
                                                📎 {file.original_name.length > 15 ? file.original_name.substring(0, 15) + '...' : file.original_name}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between">
                                    <div className="flex flex-col gap-1 w-full">
                                        <span className="text-[10px] text-gray-400 font-medium">Oleh: {task.author?.name} • {formatDate(task.created_at)}</span>
                                        {!isCompact && task.due_date && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-md w-fit"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Tenggat: {formatDate(task.due_date)}</span>}
                                    </div>
                                    {task.assignees && task.assignees.length > 0 && (
                                        <div className="flex -space-x-2 shrink-0 ml-2">
                                            {task.assignees.map(assignee => <div key={assignee.id} title={assignee.name} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm">{assignee.name.charAt(0).toUpperCase()}</div>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }) : <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl"><span className="text-xs font-medium text-gray-400">Area Kosong</span></div>}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title={`${project.name} - Board`} />
            <div className="max-w-[1600px] mx-auto space-y-4">
                <BackButton href={route('workspace.projects', workspace.id)}>Kembali ke Daftar Proyek</BackButton>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-2">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.name}</h2>
                        <p className="text-gray-500 font-medium">Kanban Board Papan Tugas</p>
                    </div>
                    <ActionBtn onClick={openCreateForm}>+ Tambah Tugas</ActionBtn>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-6 px-2 snap-x scroll-smooth">
                    <KanbanColumn title="To Do" status="todo" taskList={todoTasks} headerColor="bg-gray-400" bgColor="bg-[#F8FAFC]" />
                    <KanbanColumn title="In Progress" status="in_progress" taskList={inProgressTasks} headerColor="bg-blue-400" bgColor="bg-blue-50/50" />
                    <KanbanColumn title="Postponed" status="postponed" taskList={postponedTasks} headerColor="bg-orange-400" bgColor="bg-orange-50/50" />
                    <KanbanColumn title="Review" status="review" taskList={reviewTasks} headerColor="bg-yellow-400" bgColor="bg-yellow-50/50" />
                    <KanbanColumn title="Done" status="done" taskList={doneTasks} headerColor="bg-green-400" bgColor="bg-green-50/50" />
                    <KanbanColumn title="Archived" status="archived" taskList={archivedTasks} headerColor="bg-gray-600" bgColor="bg-gray-100" />
                </div>

                {/* MODAL INPUT TUGAS / EDIT - DIPERBAIKI BUG LAYAR KEBESARAN */}
                {showModal && (
                    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
                        <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl border border-gray-100 my-10 relative" ref={dropdownRef}>
                            <h3 className="text-2xl font-extrabold mb-6 text-gray-900">{editMode ? 'Edit Tugas' : 'Tugas Baru'}</h3>
                            <form onSubmit={submit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Judul Tugas</label><input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required /></div>
                                    <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi</label><textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="3" className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"></textarea></div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-2">Kategori/Tag</label><input type="text" value={data.tags} onChange={e => setData('tags', e.target.value)} placeholder="Contoh: frontend, bugfix" className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" /></div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-2">Tenggat Waktu</label><input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 font-medium shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer appearance-none outline-none" /></div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Lampiran File</label>
                                        <input type="file" multiple onChange={(e) => setData('files', Array.from(e.target.files))} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-200 rounded-xl bg-gray-50" />
                                    </div>
                                    
                                    <div className="relative">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Penugasan</label>
                                        <button type="button" onClick={() => { setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen); setIsPriorityDropdownOpen(false); setIsStatusDropdownOpen(false); }} className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all flex justify-between items-center outline-none">
                                            <span className="text-gray-700 font-medium truncate">{data.assignee_ids.length === 0 ? '-- Pilih Anggota --' : `${data.assignee_ids.length} Anggota Dipilih`}</span>
                                            <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ease-in-out ${isAssigneeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        {isAssigneeDropdownOpen && (
                                            <div className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                                {members.length > 0 ? members.map(m => {
                                                    const isSelected = data.assignee_ids.includes(m.user?.id);
                                                    return (
                                                        <label key={m.user?.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}>
                                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" checked={isSelected} onChange={(e) => { if (e.target.checked) setData('assignee_ids', [...data.assignee_ids, m.user?.id]); else setData('assignee_ids', data.assignee_ids.filter(id => id !== m.user?.id)); }} />
                                                            <div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold shadow-sm">{m.user?.name.charAt(0).toUpperCase()}</div><span className={`text-sm ${isSelected ? 'font-bold text-indigo-900' : 'font-medium text-gray-700'}`}>{m.user?.name}</span></div>
                                                        </label>
                                                    )
                                                }) : <div className="px-4 py-4 text-sm text-center text-gray-500">Tidak ada anggota tersedia</div>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Prioritas</label>
                                        <button type="button" onClick={() => { setIsPriorityDropdownOpen(!isPriorityDropdownOpen); setIsAssigneeDropdownOpen(false); setIsStatusDropdownOpen(false); }} className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all flex justify-between items-center outline-none">
                                            <span className="text-gray-700 font-medium uppercase text-xs tracking-wider flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${data.priority === 'high' ? 'bg-red-500' : data.priority === 'low' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>{data.priority}</span>
                                            <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ease-in-out ${isPriorityDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        {isPriorityDropdownOpen && (
                                            <div className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
                                                {[{ value: 'low', label: 'Low', color: 'bg-green-500' }, { value: 'medium', label: 'Medium', color: 'bg-yellow-500' }, { value: 'high', label: 'High', color: 'bg-red-500' }].map((item) => (
                                                    <button key={item.value} type="button" onClick={() => { setData('priority', item.value); setIsPriorityDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-2.5 transition-colors border-b border-gray-50 last:border-0 ${data.priority === item.value ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span><span className="uppercase text-xs tracking-wider">{item.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {editMode && (
                                        <div className="md:col-span-2 relative">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                            <button type="button" onClick={() => { setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsAssigneeDropdownOpen(false); setIsPriorityDropdownOpen(false); }} className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all flex justify-between items-center outline-none">
                                                <span className="text-gray-700 font-medium uppercase text-xs tracking-wider flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${statusLabels[data.status]?.color || 'bg-gray-400'}`}></span>{statusLabels[data.status]?.label || data.status}</span>
                                                <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ease-in-out ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                            {isStatusDropdownOpen && (
                                                <div className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                                                    {[{ value: 'todo', label: 'To Do', color: 'bg-gray-400' }, { value: 'in_progress', label: 'In Progress', color: 'bg-blue-400' }, ...(user.role !== 'karyawan' ? [{ value: 'postponed', label: 'Postponed (Ditunda)', color: 'bg-orange-400' }] : []), { value: 'review', label: 'Review', color: 'bg-yellow-400' }, ...(user.role !== 'karyawan' ? [{ value: 'done', label: 'Done', color: 'bg-green-400' }, { value: 'archived', label: 'Archived (Arsip)', color: 'bg-gray-600' }] : [])].map((item) => (
                                                        <button key={item.value} type="button" onClick={() => { setData('status', item.value); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-2.5 transition-colors border-b border-gray-50 last:border-0 ${data.status === item.value ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span><span className="uppercase text-xs tracking-wider">{item.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
                                    <ActionBtn type="submit" disabled={processing}>{processing ? 'Menyimpan...' : (editMode ? 'Update Tugas' : 'Simpan Tugas')}</ActionBtn>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DETAIL TUGAS (REVIEW MODE FULL SCREEN) */}
                {showDetailModal && activeTask && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
                        <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                            
                            {/* Header Modal Detail */}
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${activeTask.priority === 'high' ? 'bg-red-100 text-red-700' : activeTask.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{activeTask.priority} Priority</span>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-white border ${statusLabels[activeTask.status]?.color.replace('bg-', 'text-').replace('400', '600')} border-gray-200 shadow-sm`}>{statusLabels[activeTask.status]?.label}</span>
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-gray-900">{activeTask.title}</h2>
                                </div>
                                <button onClick={() => setShowDetailModal(false)} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Body Modal Detail */}
                            <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Deskripsi */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Deskripsi Tugas</h4>
                                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{activeTask.description || <span className="italic text-gray-400">Tidak ada deskripsi yang disertakan.</span>}</p>
                                        </div>
                                    </div>

                                    {/* Catatan Revisi */}
                                    {activeTask.feedback && (
                                        <div>
                                            <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Catatan Revisi Terakhir</h4>
                                            <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                                                <p className="text-sm text-red-700 whitespace-pre-wrap">{activeTask.feedback}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lampiran File */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Lampiran ({activeTask.files?.length || 0})</h4>
                                        {activeTask.files?.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {activeTask.files.map(f => (
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
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-6">
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-5">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Dibuat Oleh</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">{activeTask.author?.name.charAt(0).toUpperCase()}</div>
                                                <span className="text-sm font-semibold text-gray-800">{activeTask.author?.name}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Penugasan</p>
                                            {activeTask.assignees?.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    {activeTask.assignees.map(a => (
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
                                            <p className="text-sm font-semibold text-gray-800">{formatDateTime(activeTask.created_at)}</p>
                                        </div>
                                        {activeTask.due_date && (
                                            <div>
                                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Tenggat Waktu</p>
                                                <p className="text-sm font-bold text-red-600">{formatDate(activeTask.due_date)}</p>
                                            </div>
                                        )}
                                        {activeTask.completed_at && (
                                            <div>
                                                <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Diselesaikan Pada</p>
                                                <p className="text-sm font-bold text-green-600">{formatDateTime(activeTask.completed_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isUserTask(activeTask) && (
                                        <div className="flex gap-2">
                                            <button onClick={() => { setShowDetailModal(false); openEditForm(activeTask); }} className="flex-1 py-2 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 transition-colors">Edit Tugas</button>
                                            <button onClick={() => deleteTask(activeTask.id)} className="flex-1 py-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 transition-colors">Hapus</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Modal Detail (TOMBOL REVIEW) */}
                            {activeTask.status === 'review' && user.role !== 'karyawan' && (
                                <div className="p-6 bg-gray-900 border-t border-gray-800 flex gap-4 mt-auto shrink-0">
                                    <button onClick={() => updateTaskStatus(activeTask.id, 'done')} className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-lg shadow-green-900/20">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        APPROVE & SELESAIKAN TUGAS
                                    </button>
                                    <button onClick={() => handleOpenFeedback(activeTask)} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 hover:bg-red-500 hover:border-red-400 text-white font-extrabold text-sm py-4 rounded-xl transition-all">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                        TOLAK & MINTA REVISI
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL FEEDBACK */}
                {showFeedbackModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-gray-100">
                            <h3 className="text-xl font-extrabold mb-2 text-gray-900">Tolak Tugas & Minta Revisi</h3>
                            <p className="text-xs text-gray-500 mb-6">Tugas ini akan dikembalikan ke status **In Progress**. Tuliskan catatan perbaikan untuk anggota tim Anda:</p>
                            <form onSubmit={submitFeedback} className="space-y-4">
                                <div><textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows="4" className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required></textarea></div>
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => { setShowFeedbackModal(false); setShowDetailModal(true); }} className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
                                    <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm">Kirim Catatan & Kembalikan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL ERROR */}
                {errorMessage && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Akses Ditolak</h3>
                            <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
                            <button onClick={() => setErrorMessage(null)} className="w-full px-5 py-3 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">Tutup</button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}