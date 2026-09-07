import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import BackButton from '@/Components/BackButton';
import ActionBtn from '@/Components/ActionBtn';

import KanbanColumn from '@/Components/Kanban/KanbanColumn';
import TaskFormModal from '@/Components/Kanban/Modals/TaskFormModal';
import TaskDetailModal from '@/Components/Kanban/Modals/TaskDetailModal';
import TaskCalendarView from '@/Components/Kanban/TaskCalendarView';
import TaskGanttView from '@/Components/Kanban/TaskGanttView';
import ProjectChatbot from '@/Components/Kanban/ProjectChatbot';

export default function WorkspaceTasks({ workspace, project, tasks, members, projectFiles = [] }) {
    const { user } = usePage().props.auth;
    
    // UI States Utama
    const [viewMode, setViewMode] = useState('board'); // 'board' | 'calendar' | 'gantt' | 'files'
    
    const [formModal, setFormModal] = useState({ show: false, task: null });
    const [feedbackModal, setFeedbackModal] = useState({ show: false, task: null });
    const [errorMessage, setErrorMessage] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');

    const [dayModal, setDayModal] = useState({ show: false, date: '', tasks: [] });
    const [detailTaskId, setDetailTaskId] = useState(null);
    const activeDetailTask = Array.isArray(tasks) ? tasks.find(t => t.id === detailTaskId) : null;

    // States Filter Kanban
    const [searchQuery, setSearchQuery] = useState('');
    const [myTasksOnly, setMyTasksOnly] = useState(false);
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

    // States Modal Issue
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [issueModal, setIssueModal] = useState({ show: false, task: null, reason: '' });

    // States Pusat Berkas
    const [filesData, setFilesData] = useState([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [fileSearchQuery, setFileSearchQuery] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState('all');
    const [previewFile, setPreviewFile] = useState(null);

    const statusLabels = {
        todo: { label: 'To Do', color: 'bg-gray-400 dark:bg-gray-500' },
        in_progress: { label: 'In Progress', color: 'bg-blue-400 dark:bg-blue-500' },
        postponed: { label: 'Terkendala', color: 'bg-red-500 dark:bg-red-600' },
        review: { label: 'Review', color: 'bg-yellow-400 dark:bg-yellow-500' },
        done: { label: 'Done', color: 'bg-green-400 dark:bg-green-500' },
        archived: { label: 'Archived', color: 'bg-gray-600 dark:bg-gray-700' }
    };

    const updateTaskStatus = (taskId, newStatus, extraData = {}) => {
        router.patch(route('workspace.projects.tasks.update', { workspace: workspace.id, project: project.id, task: taskId }), 
        { status: newStatus, ...extraData }, { 
            preserveScroll: true,
            onSuccess: () => { setDetailTaskId(null); setIsDrawerOpen(false); }, 
            onError: (err) => setErrorMessage(err.message || "Akses ditolak.")
        });
    };

    const deleteTask = (id) => {
        if (confirm('Yakin ingin menghapus tugas ini?')) {
            router.delete(route('workspace.projects.tasks.destroy', { workspace: workspace.id, project: project.id, task: id }));
            setDetailTaskId(null);
        }
    };

    const submitFeedback = (e) => {
        e.preventDefault();
        if (feedbackModal.task) updateTaskStatus(feedbackModal.task.id, 'in_progress', { feedback: feedbackText });
        setFeedbackModal({ show: false, task: null });
        setFeedbackText('');
    };

    const submitIssue = (e) => {
        e.preventDefault();
        if (issueModal.task) updateTaskStatus(issueModal.task.id, 'postponed', { feedback: issueModal.reason });
        setIssueModal({ show: false, task: null, reason: '' });
    };

    const cardActions = {
        onEdit: (task) => setFormModal({ show: true, task }),
        onDelete: (id) => deleteTask(id),
        onDetail: (task) => setDetailTaskId(task.id)
    };

    // Filter Tugas
    const processedTasks = Array.isArray(tasks) ? tasks.filter(task => {
        if (myTasksOnly) {
            const isMine = task.author_id === user.id || (task.assignees && task.assignees.some(a => a.id === user.id));
            if (!isMine) return false;
        }
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        if (searchQuery.trim() !== '') {
            if (!task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        }
        return true;
    }) : [];

    const filteredTasks = (status) => processedTasks.filter(t => t.status === status);
    const postponedTasksCount = filteredTasks('postponed').length;

    // Helper Berkas
    const loadProjectFiles = async () => {
        setViewMode('files');
        if (filesData.length === 0) {
            setIsLoadingFiles(true);
            try {
                const response = await window.axios.get(route('workspace.projects.files', { workspace: workspace.id, project: project.id }));
                setFilesData(response.data.files);
            } catch (error) {
                console.error("Gagal memuat file", error);
            } finally {
                setIsLoadingFiles(false);
            }
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const getFileTypeCategory = (fileName = '', type = '') => {
        const ext = fileName.split('.').pop().toLowerCase();
        const t = type.toLowerCase();
        const imgExt = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];
        const docExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'ppt', 'pptx'];
        if (imgExt.includes(ext) || t.includes('image')) return 'image';
        if (docExt.includes(ext) || t.includes('pdf') || t.includes('document')) return 'document';
        return 'other';
    };

    const filteredProjectFiles = filesData.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) || 
                              file.task_title.toLowerCase().includes(fileSearchQuery.toLowerCase());
        const category = getFileTypeCategory(file.name, file.type);
        const matchesType = fileTypeFilter === 'all' || fileTypeFilter === category;
        return matchesSearch && matchesType;
    });

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title={`${project.name} - ${viewMode.toUpperCase()}`} />
            
            <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8 pb-12 mt-4">
                
                {/* Tautan Kembali */}
                <div className="px-2">
                    <Link href={route('workspace.projects', workspace.id)} className="inline-flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Kembali ke Daftar Proyek
                    </Link>
                </div>
                
                {/* HEADER UTAMA (LIQUID GLASS) */}
                <div className="relative bg-white/60 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] p-6 sm:p-8 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 overflow-hidden group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold mb-3 uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Workspace Proyek
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{project.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Atur alur kerja, pantau tugas, dan kelola berkas tim bersama-sama.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto relative z-10">
                        <div className="flex p-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl w-full sm:w-auto shadow-inner overflow-x-auto hide-scrollbar snap-x">
                            <button onClick={() => setViewMode('board')} className={`shrink-0 px-5 py-3 text-sm font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'board' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                                📋 Kanban
                            </button>
                            <button onClick={() => setViewMode('calendar')} className={`shrink-0 px-5 py-3 text-sm font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'calendar' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                                📅 Kalender
                            </button>
                            <button onClick={() => setViewMode('gantt')} className={`shrink-0 px-5 py-3 text-sm font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'gantt' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                                📊 Timeline
                            </button>
                            <button onClick={loadProjectFiles} className={`shrink-0 px-5 py-3 text-sm font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'files' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                                📁 Berkas
                            </button>
                        </div>
                        
                        {(viewMode === 'board' || viewMode === 'gantt') && (
                            <ActionBtn onClick={() => setFormModal({ show: true, task: null })} className="w-full sm:w-auto px-8 py-3.5 shadow-lg shadow-indigo-500/30 shrink-0">
                                + Buat Tugas
                            </ActionBtn>
                        )}
                    </div>
                </div>

                {/* FILTER SEARCH (LIQUID GLASS) */}
                {viewMode !== 'files' && viewMode !== 'calendar' && (
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-2 sm:p-3 rounded-3xl sm:rounded-full border border-white/50 dark:border-white/10 shadow-sm flex flex-col lg:flex-row items-center gap-3 w-full transition-all relative z-20">
                        <div className="relative w-full lg:flex-1 group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama tugas atau kata kunci..." className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40 border-none rounded-2xl sm:rounded-full text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-black/60 transition-all outline-none" />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                            <button onClick={() => setIsDrawerOpen(true)} className={`w-full sm:w-auto whitespace-nowrap px-6 py-3 sm:py-3.5 text-sm font-extrabold rounded-2xl sm:rounded-full border transition-all duration-300 flex items-center justify-center gap-2 ${postponedTasksCount > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 shadow-sm ring-2 ring-red-100 dark:ring-red-900/50 animate-pulse' : 'bg-white/40 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5'}`}>
                                🛑 Laci Kendala {postponedTasksCount > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs shadow-sm">{postponedTasksCount}</span>}
                            </button>
                            <button onClick={() => setMyTasksOnly(!myTasksOnly)} className={`w-full sm:w-auto whitespace-nowrap px-6 py-3 sm:py-3.5 text-sm font-extrabold rounded-2xl sm:rounded-full border transition-all duration-300 flex items-center justify-center gap-2 ${myTasksOnly ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white/40 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5'}`}>
                                {myTasksOnly ? 'Hanya Tugas Saya' : 'Tugas Saya'}
                            </button>
                            <div className="relative w-full sm:w-auto sm:min-w-[190px]">
                                <button onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)} className="w-full bg-white/40 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5 text-sm font-extrabold rounded-2xl sm:rounded-full py-3 sm:py-3.5 px-5 flex items-center justify-between gap-3 outline-none shadow-sm transition-colors">
                                    <span className="truncate">{priorityFilter === 'all' ? '🚦 Semua Prioritas' : priorityFilter === 'high' ? '🔴 High Priority' : priorityFilter === 'medium' ? '🟡 Medium Priority' : '🟢 Low Priority'}</span>
                                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isPriorityDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsPriorityDropdownOpen(false)}></div>
                                        <div className="absolute right-0 lg:left-0 mt-2 w-full min-w-[220px] bg-white dark:bg-[#0a192f] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-20">
                                            {['all', 'high', 'medium', 'low'].map(level => {
                                                const labels = { all: '🚦 Semua Prioritas', high: '🔴 High Priority', medium: '🟡 Medium Priority', low: '🟢 Low Priority' };
                                                return <button key={level} onClick={() => { setPriorityFilter(level); setIsPriorityDropdownOpen(false); }} className={`w-full text-left px-5 py-3.5 text-sm font-bold transition-colors ${priorityFilter === level ? 'bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}>{labels[level]}</button>;
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* KONTEN 1: BOARD KANBAN */}
                {viewMode === 'board' && (
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory relative z-10">
                        <KanbanColumn title="To Do" status="todo" taskList={filteredTasks('todo')} headerColor="bg-gray-400 dark:bg-gray-500" bgColor="bg-white/40 dark:bg-white/5 backdrop-blur-md" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="In Progress" status="in_progress" taskList={filteredTasks('in_progress')} headerColor="bg-blue-400 dark:bg-blue-500" bgColor="bg-blue-50/40 dark:bg-blue-900/10 backdrop-blur-md" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Review" status="review" taskList={filteredTasks('review')} headerColor="bg-yellow-400 dark:bg-yellow-500" bgColor="bg-yellow-50/40 dark:bg-yellow-900/10 backdrop-blur-md" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Done" status="done" taskList={filteredTasks('done')} headerColor="bg-green-400 dark:bg-green-500" bgColor="bg-green-50/40 dark:bg-green-900/10 backdrop-blur-md" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Archived" status="archived" taskList={filteredTasks('archived')} headerColor="bg-gray-600 dark:bg-gray-700" bgColor="bg-gray-100/40 dark:bg-gray-900/20 backdrop-blur-md" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                    </div>
                )}

                {/* KONTEN 2: KALENDER */}
                {viewMode === 'calendar' && (
                    <div className="pb-8">
                        <TaskCalendarView tasks={Array.isArray(tasks) ? tasks : []} onDayClick={(date, dayTasks) => setDayModal({ show: true, date, tasks: dayTasks })} statusLabels={statusLabels} />
                    </div>
                )}

                {/* KONTEN 3: TIMELINE (GANTT CHART) */}
                {viewMode === 'gantt' && (
                    <div className="pb-8">
                        <TaskGanttView tasks={processedTasks} statusLabels={statusLabels} />
                    </div>
                )}

                {/* KONTEN 4: PUSAT BERKAS (LIQUID GLASS UPGRADE) */}
                {viewMode === 'files' && (
                    <div className="space-y-6 pb-12 animate-fadeIn relative z-10">
                        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-2 sm:p-3 rounded-3xl sm:rounded-full border border-white/50 dark:border-white/10 shadow-sm flex flex-col lg:flex-row items-center gap-3 w-full">
                            <div className="relative w-full lg:flex-1 group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                                <input type="text" value={fileSearchQuery} onChange={(e) => setFileSearchQuery(e.target.value)} placeholder="Cari nama file atau tugas asal..." className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40 border-none rounded-2xl sm:rounded-full text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            </div>
                            <div className="flex w-full lg:w-auto gap-2 p-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl sm:rounded-full overflow-x-auto hide-scrollbar shadow-inner">
                                {['all', 'image', 'document', 'other'].map(type => {
                                    const labels = { all: 'Semua', image: '🖼️ Gambar', document: '📄 Dokumen', other: '📦 Lainnya' };
                                    return <button key={type} onClick={() => setFileTypeFilter(type)} className={`shrink-0 px-5 py-2.5 text-xs font-extrabold rounded-xl sm:rounded-full transition-all ${fileTypeFilter === type ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'}`}>{labels[type]}</button>;
                                })}
                            </div>
                        </div>

                        {isLoadingFiles ? (
                            <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900/50 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div></div>
                        ) : filteredProjectFiles.length === 0 ? (
                            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-[2rem] p-12 text-center border border-white/50 dark:border-white/10 shadow-sm"><div className="text-6xl mb-4 opacity-70">📭</div><h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Tidak ada berkas</h3><p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada lampiran atau kata kunci tidak cocok.</p></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredProjectFiles.map((file) => {
                                    const category = getFileTypeCategory(file.name, file.type);
                                    return (
                                        <div key={file.id} className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all group overflow-hidden flex flex-col">
                                            <div onClick={() => category === 'image' ? setPreviewFile(file) : window.open(file.url, '_blank')} className="h-36 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex items-center justify-center relative overflow-hidden shrink-0 cursor-pointer">
                                                {category === 'image' ? <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=Error'; }} /> : <div className="text-5xl group-hover:scale-110 transition-transform duration-500 opacity-80">{category === 'document' ? '📄' : '📦'}</div>}
                                                <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"><div className="w-12 h-12 bg-white dark:bg-[#0a192f] rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-lg hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{category === 'image' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />}</svg></div></div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white truncate mb-1" title={file.name}>{file.name}</h4>
                                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-3"><span className="uppercase">{file.name.split('.').pop()}</span><span>{formatBytes(file.size)}</span></div>
                                                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mb-1"><span className="font-bold text-gray-700 dark:text-gray-300">Tugas:</span> {file.task_title}</p>
                                                    <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 font-bold"><span>Oleh {file.uploader_name}</span><span>{new Date(file.created_at).toLocaleDateString('id-ID')}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL PREVIEW GAMBAR (LIQUID GLASS) */}
                {previewFile && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 dark:bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
                        <button onClick={() => setPreviewFile(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors outline-none focus:ring-2 focus:ring-white/50"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        <div className="max-w-5xl w-full flex flex-col items-center">
                            <img src={previewFile.url} alt={previewFile.name} className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl mb-6 border border-white/10" />
                            <div className="bg-white/10 dark:bg-black/40 backdrop-blur-[26px] border border-white/20 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between w-full max-w-lg text-white shadow-xl">
                                <div className="overflow-hidden mr-4"><h4 className="font-extrabold truncate text-lg">{previewFile.name}</h4><p className="text-white/70 text-sm font-medium truncate">Asal: {previewFile.task_title}</p></div>
                                <a href={previewFile.url} download className="shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2">Unduh File</a>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL & DRAWER LAINNYA */}
                {/* ... (Modal Task Form & Laci Kendala tetap berjalan normal, logika tidak diubah) ... */}
                {isDrawerOpen && <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-[90] transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>}
                
                <div className={`fixed inset-y-0 right-0 z-[100] w-full max-w-md bg-white dark:bg-[#04121b] shadow-2xl border-l border-gray-100 dark:border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0 backdrop-blur-md">
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center text-sm shadow-inner">🛑</span> Pusat Kendala</h3>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                        {filteredTasks('postponed').length === 0 ? (
                            <div className="text-center py-12"><p className="text-4xl mb-3 opacity-50">🎉</p><p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Tidak ada tugas yang terkendala!</p></div>
                        ) : (
                            filteredTasks('postponed').map(task => (
                                <div key={task.id} className="bg-white dark:bg-[#0a192f] p-5 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{task.title}</h4>
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-3 rounded-xl mb-4 mt-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">Alasan Kendala:</span>
                                        <p className="text-sm text-red-800 dark:text-red-300 font-medium">{task.feedback || 'Tidak ada alasan.'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {(user.role !== 'karyawan' || task.assignees?.some(a => a.id === user.id)) && (<button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold shadow-sm transition-colors">▶️ Lanjutkan</button>)}
                                        {user.role !== 'karyawan' && (<button onClick={() => { setIsDrawerOpen(false); setFormModal({ show: true, task }); }} className="flex-1 bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-xs font-bold transition-colors">🔄 Ganti Orang</button>)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* MODAL ISSUE (LIQUID GLASS) */}
                {issueModal.show && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-white dark:bg-[#0a192f] rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden">
                            <h3 className="text-xl font-extrabold mb-2 text-gray-900 dark:text-white">Lapor Tugas Terkendala</h3>
                            <form onSubmit={submitIssue} className="space-y-4">
                                <textarea value={issueModal.reason} onChange={(e) => setIssueModal({ ...issueModal, reason: e.target.value })} rows="4" className="w-full rounded-2xl border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 placeholder-red-300 dark:placeholder-red-700/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400 transition-colors" placeholder="Sebutkan masalahnya secara detail..." required></textarea>
                                <div className="flex justify-end space-x-3">
                                    <button type="button" onClick={() => setIssueModal({ show: false, task: null, reason: '' })} className="px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors outline-none">Batal</button>
                                    <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors outline-none">Kirim Laporan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modals Lama */}
                {formModal.show && <TaskFormModal workspace={workspace} project={project} members={members} taskToEdit={formModal.task} statusLabels={statusLabels} user={user} setErrorMessage={setErrorMessage} onClose={() => setFormModal({ show: false, task: null })} onError={(msg) => setErrorMessage(msg)} />}
                {activeDetailTask && <TaskDetailModal workspace={workspace} project={project} task={activeDetailTask} user={user} statusLabels={statusLabels} onClose={() => setDetailTaskId(null)} onApprove={(id) => updateTaskStatus(id, 'done')} onReject={(task) => setFeedbackModal({ show: true, task })} onEdit={(task) => setFormModal({ show: true, task })} onDelete={(id) => deleteTask(id)} onReportIssue={(task) => { setDetailTaskId(null); setIssueModal({ show: true, task, reason: '' }); }} />}
                
                {/* MODAL REVISI (LIQUID GLASS) */}
                {feedbackModal.show && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-white dark:bg-[#0a192f] rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden">
                            <h3 className="text-xl font-extrabold mb-2 text-gray-900 dark:text-white">Tolak Tugas & Minta Revisi</h3>
                            <form onSubmit={submitFeedback} className="space-y-4">
                                <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows="4" className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Tuliskan catatan revisi..." required></textarea>
                                <div className="flex justify-end space-x-3">
                                    <button type="button" onClick={() => { setFeedbackModal({ show: false, task: null }); setDetailTaskId(feedbackModal.task.id); }} className="px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors outline-none">Batal</button>
                                    <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors outline-none">Kirim Catatan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <ProjectChatbot project={project} user={user} />
            </div>
        </AuthenticatedLayout>
    );
}