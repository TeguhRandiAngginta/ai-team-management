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
    
    const [viewMode, setViewMode] = useState('board');
    const [formModal, setFormModal] = useState({ show: false, task: null });
    const [feedbackModal, setFeedbackModal] = useState({ show: false, task: null });
    const [errorMessage, setErrorMessage] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');

    const [dayModal, setDayModal] = useState({ show: false, date: '', tasks: [] });

    const [detailTaskId, setDetailTaskId] = useState(null);
    const activeDetailTask = Array.isArray(tasks) ? tasks.find(t => t.id === detailTaskId) : null;

    const statusLabels = {
        todo: { label: 'To Do', color: 'bg-gray-400' },
        in_progress: { label: 'In Progress', color: 'bg-blue-400' },
        postponed: { label: 'Postponed', color: 'bg-orange-400' },
        review: { label: 'Review', color: 'bg-yellow-400' },
        done: { label: 'Done', color: 'bg-green-400' },
        archived: { label: 'Archived', color: 'bg-gray-600' }
    };

    const todayObj = new Date();
    const actualTodayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

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

    const filteredTasks = (status) => Array.isArray(tasks) ? tasks.filter(t => t.status === status) : [];
    const statusOrder = ['todo', 'in_progress', 'review', 'postponed', 'done', 'archived'];

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title={`${project.name} - ${viewMode === 'board' ? 'Board' : 'Kalender'}`} />
            <div className="max-w-[1600px] mx-auto space-y-4">
                <BackButton href={route('workspace.projects', workspace.id)}>Kembali ke Daftar Proyek</BackButton>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 px-2">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.name}</h2>
                        <p className="text-gray-500 font-medium">Pantau tugas dan tenggat waktu proyek</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="flex p-1 bg-gray-200/60 rounded-xl w-full sm:w-auto">
                            <button onClick={() => setViewMode('board')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'board' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>📋 Kanban Board</button>
                            <button onClick={() => setViewMode('calendar')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>📅 Kalender</button>
                        </div>
                        <ActionBtn onClick={() => setFormModal({ show: true, task: null })}>+ Tambah Tugas</ActionBtn>
                    </div>
                </div>

                {viewMode === 'board' ? (
                    <div className="flex overflow-x-auto gap-6 pb-6 px-2 snap-x scroll-smooth">
                        <KanbanColumn title="To Do" status="todo" taskList={filteredTasks('todo')} headerColor="bg-gray-400" bgColor="bg-[#F8FAFC]" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="In Progress" status="in_progress" taskList={filteredTasks('in_progress')} headerColor="bg-blue-400" bgColor="bg-blue-50/50" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Postponed" status="postponed" taskList={filteredTasks('postponed')} headerColor="bg-orange-400" bgColor="bg-orange-50/50" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Review" status="review" taskList={filteredTasks('review')} headerColor="bg-yellow-400" bgColor="bg-yellow-50/50" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Done" status="done" taskList={filteredTasks('done')} headerColor="bg-green-400" bgColor="bg-green-50/50" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                        <KanbanColumn title="Archived" status="archived" taskList={filteredTasks('archived')} headerColor="bg-gray-600" bgColor="bg-gray-100" user={user} onDrop={updateTaskStatus} cardActions={cardActions} />
                    </div>
                ) : (
                    <div className="px-2 pb-6">
                        <TaskCalendarView tasks={Array.isArray(tasks) ? tasks : []} onDayClick={(date, dayTasks) => setDayModal({ show: true, date, tasks: dayTasks })} statusLabels={statusLabels} />
                    </div>
                )}

                {dayModal.show && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
                        <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                                <div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                                        <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Agenda: {dayModal.date}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1 font-medium">Total {dayModal.tasks.length} tugas ditemukan pada tanggal ini.</p>
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
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {tasksInStatus.map(task => {
                                                        const isOverdue = task.due_date && task.due_date.split('T')[0] < actualTodayStr && task.status !== 'done' && task.status !== 'archived';
                                                        
                                                        return (
                                                            <div 
                                                                key={task.id} 
                                                                onClick={() => { setDayModal({ show: false, date: '', tasks: [] }); setDetailTaskId(task.id); }} 
                                                                className={`cursor-pointer bg-white border p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group ${isOverdue ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100 hover:border-indigo-300'}`}
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex gap-1 items-center flex-wrap">
                                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.priority}</span>
                                                                        {isOverdue && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-600 text-white animate-pulse">⚠️ Terlambat</span>}
                                                                    </div>
                                                                    {task.assignees?.length > 0 && (
                                                                        <div className="flex -space-x-1.5 shrink-0 ml-1">
                                                                            {task.assignees.slice(0, 3).map(a => <div key={a.id} title={a.name} className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm">{a.name.charAt(0).toUpperCase()}</div>)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <h5 className="font-bold text-gray-800 text-sm mb-1 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{task.title}</h5>
                                                                <div className="flex justify-between items-center text-xs text-gray-400 mt-3 border-t border-gray-50 pt-2">
                                                                    <span>Oleh: {task.author?.name}</span>
                                                                    {!task.due_date && <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">Tanpa Tenggat</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
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