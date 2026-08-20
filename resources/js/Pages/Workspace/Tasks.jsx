import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BackButton from '@/Components/BackButton';
import ActionBtn from '@/Components/ActionBtn';

import KanbanColumn from '@/Components/Kanban/KanbanColumn';
import TaskFormModal from '@/Components/Kanban/Modals/TaskFormModal';
import TaskDetailModal from '@/Components/Kanban/Modals/TaskDetailModal';
import TaskCalendarView from '@/Components/Kanban/TaskCalendarView';

export default function WorkspaceTasks({ workspace, project, tasks, members }) {
    const { user } = usePage().props.auth;
    
    // UI States Utama
    const [viewMode, setViewMode] = useState('board');
    const [formModal, setFormModal] = useState({ show: false, task: null });
    const [feedbackModal, setFeedbackModal] = useState({ show: false, task: null });
    const [errorMessage, setErrorMessage] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');

    const [dayModal, setDayModal] = useState({ show: false, date: '', tasks: [] });
    const [detailTaskId, setDetailTaskId] = useState(null);
    const activeDetailTask = Array.isArray(tasks) ? tasks.find(t => t.id === detailTaskId) : null;

    // States Filter & Custom Dropdown
    const [searchQuery, setSearchQuery] = useState('');
    const [myTasksOnly, setMyTasksOnly] = useState(false);
    const [priorityFilter, setPriorityFilter] = useState('all');
    
    // --- STATE BARU UNTUK CUSTOM DROPDOWN ---
    const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

    const statusLabels = {
        todo: { label: 'To Do', color: 'bg-gray-400' },
        in_progress: { label: 'In Progress', color: 'bg-blue-400' },
        postponed: { label: 'Postponed', color: 'bg-orange-400' },
        review: { label: 'Review', color: 'bg-yellow-400' },
        done: { label: 'Done', color: 'bg-green-400' },
        archived: { label: 'Archived', color: 'bg-gray-600' }
    };

    const updateTaskStatus = (taskId, newStatus, extraData = {}) => {
        router.patch(route('workspace.projects.tasks.update', { workspace: workspace.id, project: project.id, task: taskId }), 
        { status: newStatus, ...extraData }, { 
            preserveScroll: true,
            onSuccess: () => setDetailTaskId(null), 
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

    const cardActions = {
        onEdit: (task) => setFormModal({ show: true, task }),
        onDelete: (id) => deleteTask(id),
        onDetail: (task) => setDetailTaskId(task.id)
    };

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

    const statusOrder = ['todo', 'in_progress', 'review', 'postponed', 'done', 'archived'];

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title={`${project.name} - ${viewMode === 'board' ? 'Board' : 'Kalender'}`} />
            
            <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8 px-2 sm:px-4 lg:px-8">
                
                <BackButton href={route('workspace.projects', workspace.id)}>Kembali ke Daftar Proyek</BackButton>
                
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Workspace Proyek
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{project.name}</h2>
                        <p className="text-gray-500 font-medium mt-2">Atur alur kerja, pantau tugas, dan capai target tim bersama-sama.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                        <div className="flex p-1 bg-gray-100/80 rounded-2xl w-full sm:w-auto shadow-inner border border-gray-200/50">
                            <button 
                                onClick={() => setViewMode('board')} 
                                className={`flex-1 sm:flex-none px-6 py-3 text-sm font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                                Papan Kanban
                            </button>
                            <button 
                                onClick={() => setViewMode('calendar')} 
                                className={`flex-1 sm:flex-none px-6 py-3 text-sm font-extrabold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Kalender
                            </button>
                        </div>
                        
                        <ActionBtn onClick={() => setFormModal({ show: true, task: null })} className="w-full sm:w-auto px-8 py-3.5 shadow-lg shadow-indigo-200">
                            + Buat Tugas
                        </ActionBtn>
                    </div>
                </div>

                {viewMode === 'board' && (
                    <div className="bg-white p-2 sm:p-3 rounded-3xl sm:rounded-full border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-3 w-full transition-all relative z-20">
                        
                        <div className="relative w-full lg:flex-1 group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama tugas atau kata kunci..." 
                                className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 hover:bg-gray-50 border-none rounded-2xl sm:rounded-full text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                            
                            <button 
                                onClick={() => setMyTasksOnly(!myTasksOnly)}
                                className={`w-full sm:w-auto whitespace-nowrap px-6 py-3 sm:py-3.5 text-sm font-extrabold rounded-2xl sm:rounded-full border transition-all duration-300 flex items-center justify-center gap-2 ${myTasksOnly ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {myTasksOnly ? 'Hanya Tugas Saya' : 'Tugas Saya'}
                            </button>

                            {/* --- PERBAIKAN: CUSTOM DROPDOWN PRIORITAS --- */}
                            <div className="relative w-full sm:w-auto sm:min-w-[190px]">
                                {/* Tombol Trigger Dropdown */}
                                <button 
                                    onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                                    className={`w-full bg-white border text-sm font-extrabold rounded-2xl sm:rounded-full py-3 sm:py-3.5 px-5 flex items-center justify-between gap-3 transition-all outline-none shadow-sm ${isPriorityDropdownOpen ? 'border-indigo-500 ring-2 ring-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                                >
                                    <span className="truncate">
                                        {priorityFilter === 'all' && '🚦 Semua Prioritas'}
                                        {priorityFilter === 'high' && '🔴 High Priority'}
                                        {priorityFilter === 'medium' && '🟡 Medium Priority'}
                                        {priorityFilter === 'low' && '🟢 Low Priority'}
                                    </span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isPriorityDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {/* Panel Menu Dropdown (Muncul jika tombol diklik) */}
                                {isPriorityDropdownOpen && (
                                    <>
                                        {/* Overlay tak terlihat untuk menutup dropdown jika klik di luar kotak */}
                                        <div className="fixed inset-0 z-10" onClick={() => setIsPriorityDropdownOpen(false)}></div>
                                        
                                        {/* Kotak Pilihan */}
                                        <div className="absolute right-0 lg:left-0 mt-2 w-full min-w-[220px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 origin-top animate-fadeIn">
                                            {['all', 'high', 'medium', 'low'].map(level => {
                                                const labels = {
                                                    all: '🚦 Semua Prioritas',
                                                    high: '🔴 High Priority',
                                                    medium: '🟡 Medium Priority',
                                                    low: '🟢 Low Priority'
                                                };
                                                return (
                                                    <button
                                                        key={level}
                                                        onClick={() => { setPriorityFilter(level); setIsPriorityDropdownOpen(false); }}
                                                        className={`w-full text-left px-5 py-3.5 text-sm font-bold transition-colors ${priorityFilter === level ? 'bg-indigo-50/80 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'}`}
                                                    >
                                                        {labels[level]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* ------------------------------------------- */}

                            {(searchQuery || myTasksOnly || priorityFilter !== 'all') && (
                                <button 
                                    onClick={() => { setSearchQuery(''); setMyTasksOnly(false); setPriorityFilter('all'); }}
                                    className="w-full sm:w-12 h-12 shrink-0 flex items-center justify-center gap-2 sm:gap-0 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl sm:rounded-full transition-colors group"
                                    title="Hapus Filter"
                                >
                                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    <span className="sm:hidden text-sm font-bold">Hapus Filter</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {viewMode === 'board' ? (
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory relative z-10">
                        <KanbanColumn title="To Do" status="todo" taskList={filteredTasks('todo')} headerColor="bg-gray-400" bgColor="bg-[#F8FAFC]" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="In Progress" status="in_progress" taskList={filteredTasks('in_progress')} headerColor="bg-blue-400" bgColor="bg-blue-50/50" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Postponed" status="postponed" taskList={filteredTasks('postponed')} headerColor="bg-orange-400" bgColor="bg-orange-50/50" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Review" status="review" taskList={filteredTasks('review')} headerColor="bg-yellow-400" bgColor="bg-yellow-50/50" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Done" status="done" taskList={filteredTasks('done')} headerColor="bg-green-400" bgColor="bg-green-50/50" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Archived" status="archived" taskList={filteredTasks('archived')} headerColor="bg-gray-600" bgColor="bg-gray-100" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                    </div>
                ) : (
                    <div className="pb-8">
                        <TaskCalendarView tasks={Array.isArray(tasks) ? tasks : []} onDayClick={(date, dayTasks) => setDayModal({ show: true, date, tasks: dayTasks })} statusLabels={statusLabels} />
                    </div>
                )}

                {/* MODALS */}
                {dayModal.show && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
                        <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                                <div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                                        <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Agenda: {dayModal.date}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1 font-medium">Total {dayModal.tasks.length} tugas jatuh tempo di hari ini.</p>
                                </div>
                                <button onClick={() => setDayModal({ show: false, date: '', tasks: [] })} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 shadow-sm transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-[#F8FAFC]">
                                {dayModal.tasks.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="text-6xl mb-4">🌴</div>
                                        <p className="text-gray-500 font-bold text-lg">Tidak ada tugas pada tanggal ini.</p>
                                        <p className="text-gray-400 text-sm">Waktunya bersantai atau rencanakan proyek baru!</p>
                                    </div>
                                ) : (
                                    statusOrder.map(status => {
                                        const tasksInStatus = dayModal.tasks.filter(t => t.status === status);
                                        if (tasksInStatus.length === 0) return null;

                                        return (
                                            <div key={status} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <h4 className="text-sm font-extrabold uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-700 border-b border-gray-50 pb-3">
                                                    <span className={`w-3 h-3 rounded-full ${statusLabels[status].color}`}></span>
                                                    {statusLabels[status].label} <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md ml-1">{tasksInStatus.length}</span>
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {tasksInStatus.map(task => (
                                                        <div 
                                                            key={task.id} 
                                                            onClick={() => { setDayModal({ show: false, date: '', tasks: [] }); setDetailTaskId(task.id); }} 
                                                            className="cursor-pointer bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:border-indigo-300 hover:shadow-md hover:-translate-y-1 transition-all group"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.priority}</span>
                                                                {task.assignees?.length > 0 && (
                                                                    <div className="flex -space-x-1.5">
                                                                        {task.assignees.slice(0, 3).map(a => <div key={a.id} title={a.name} className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm">{a.name.charAt(0).toUpperCase()}</div>)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <h5 className="font-bold text-gray-800 text-sm mb-1 leading-snug group-hover:text-indigo-600 transition-colors">{task.title}</h5>
                                                            <p className="text-xs text-gray-400 truncate mt-2 border-t border-gray-50 pt-2">Oleh: {task.author?.name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {formModal.show && (
                    <TaskFormModal workspace={workspace} project={project} members={members} taskToEdit={formModal.task} statusLabels={statusLabels} user={user} setErrorMessage={setErrorMessage} onClose={() => setFormModal({ show: false, task: null })} onError={(msg) => setErrorMessage(msg)} />
                )}

                {activeDetailTask && (
                    <TaskDetailModal workspace={workspace} project={project} task={activeDetailTask} user={user} statusLabels={statusLabels} onClose={() => setDetailTaskId(null)} onApprove={(id) => updateTaskStatus(id, 'done')} onReject={(task) => setFeedbackModal({ show: true, task })} onEdit={(task) => setFormModal({ show: true, task })} onDelete={(id) => deleteTask(id)} />
                )}

                {feedbackModal.show && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-gray-100">
                            <h3 className="text-xl font-extrabold mb-2 text-gray-900">Tolak Tugas & Minta Revisi</h3>
                            <p className="text-xs text-gray-500 mb-6">Tugas ini akan dikembalikan ke status **In Progress**. Tuliskan catatan perbaikan untuk anggota tim Anda:</p>
                            <form onSubmit={submitFeedback} className="space-y-4">
                                <div><textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows="4" className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required></textarea></div>
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => { setFeedbackModal({ show: false, task: null }); setDetailTaskId(feedbackModal.task.id); }} className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
                                    <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm">Kirim Catatan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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