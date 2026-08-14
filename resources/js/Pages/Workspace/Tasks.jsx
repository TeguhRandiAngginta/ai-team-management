import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BackButton from '@/Components/BackButton';
import ActionBtn from '@/Components/ActionBtn';

export default function WorkspaceTasks({ workspace, project, tasks, members }) {
    const { user } = usePage().props.auth;
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '',
    });

    const openCreateForm = () => {
        reset(); setEditMode(false); setEditingId(null); setShowModal(true);
    };

    const openEditForm = (task) => {
        setData({
            title: task.title, 
            description: task.description || '', 
            status: task.status,
            priority: task.priority, 
            assignee_id: task.assignee_id || ''
        });
        setEditMode(true); setEditingId(task.id); setShowModal(true);
    };

    const deleteTask = (id) => {
        if (confirm('Yakin ingin menghapus tugas ini?')) {
            router.delete(route('workspace.projects.tasks.destroy', { workspace: workspace.id, project: project.id, task: id }));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (editMode) {
            patch(route('workspace.projects.tasks.update', { workspace: workspace.id, project: project.id, task: editingId }), {
                onSuccess: () => { reset(); setShowModal(false); },
            });
        } else {
            post(route('workspace.projects.tasks.store', { workspace: workspace.id, project: project.id }), {
                onSuccess: () => { reset(); setShowModal(false); },
            });
        }
    };

    const updateTaskStatus = (taskId, newStatus) => {
        router.patch(route('workspace.projects.tasks.update', { workspace: workspace.id, project: project.id, task: taskId }), { status: newStatus }, { preserveScroll: true });
    };

    const handleDragStart = (e, taskId) => { e.dataTransfer.setData('taskId', taskId); setTimeout(() => { e.target.classList.add('opacity-40'); }, 0); };
    const handleDragEnd = (e) => { e.target.classList.remove('opacity-40'); };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = (e, newStatus) => {
        e.preventDefault(); const taskId = e.dataTransfer.getData('taskId');
        if (taskId) updateTaskStatus(taskId, newStatus);
    };

    // ==========================================
    // BARIS YANG HILANG SUDAH DIKEMBALIKAN DI SINI
    // ==========================================
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const reviewTasks = tasks.filter(t => t.status === 'review');
    const doneTasks = tasks.filter(t => t.status === 'done');
    // ==========================================

    const KanbanColumn = ({ title, status, taskList, headerColor, bgColor }) => (
        <div className={`${bgColor} rounded-[2rem] p-5 min-h-[500px] border border-gray-100 transition-colors flex flex-col`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)}>
            <div className="flex items-center justify-between mb-5 px-2">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${headerColor}`}></span>{title}
                </h4>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100">{taskList.length}</span>
            </div>
            
            <div className="space-y-4 flex-1">
                {taskList.length > 0 ? taskList.map(task => (
                    <div key={task.id} draggable="true" onDragStart={(e) => handleDragStart(e, task.id)} onDragEnd={handleDragEnd} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex flex-col group relative">
                        
                        {/* Tombol Aksi (Kanan Atas) */}
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                            <button onClick={() => openEditForm(task)} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded" title="Edit"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            
                            {/* TOMBOL HAPUS HANYA MUNCUL JIKA BUKAN KARYAWAN */}
                            {user.role !== 'karyawan' && (
                                <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Hapus"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            )}
                        </div>

                        {/* Judul KanBan */}
                        <div className="pr-12 mb-3">
                            <h5 className="text-sm font-bold text-gray-800 leading-snug">{task.title}</h5>
                            {task.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                            )}
                        </div>

                        {/* Indikator Status */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center text-[11px] text-gray-400 font-medium">
                                <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Posisi: 
                                <strong className="ml-1 text-gray-600">
                                    {task.status === 'todo' && 'To Do'}
                                    {task.status === 'in_progress' && 'In Progress'}
                                    {task.status === 'review' && 'Review'}
                                    {task.status === 'done' && 'Done'}
                                </strong>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl"><span className="text-xs font-medium text-gray-400">Area Kosong</span></div>
                )}
            </div>
        </div>
    );

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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KanbanColumn title="To Do" status="todo" taskList={todoTasks} headerColor="bg-gray-400" bgColor="bg-[#F8FAFC]" />
                    <KanbanColumn title="In Progress" status="in_progress" taskList={inProgressTasks} headerColor="bg-blue-400" bgColor="bg-blue-50/50" />
                    <KanbanColumn title="Review" status="review" taskList={reviewTasks} headerColor="bg-yellow-400" bgColor="bg-yellow-50/50" />
                    <KanbanColumn title="Done" status="done" taskList={doneTasks} headerColor="bg-green-400" bgColor="bg-green-50/50" />
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-gray-100">
                            <h3 className="text-2xl font-extrabold mb-6 text-gray-900">{editMode ? 'Edit Tugas' : 'Tugas Baru'}</h3>
                            <form onSubmit={submit} className="space-y-5">
                                <div><label className="block text-sm font-bold text-gray-700 mb-2">Judul Tugas</label><input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3" required /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-2">Penugasan</label><select value={data.assignee_id} onChange={e => setData('assignee_id', e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3"><option value="">-- Pilih Anggota --</option>{members.map(m => <option key={m.user?.id} value={m.user?.id}>{m.user?.name}</option>)}</select></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-bold text-gray-700 mb-2">Prioritas</label><select value={data.priority} onChange={e => setData('priority', e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-2">Status</label><select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3"><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="review">Review</option><option value="done">Done</option></select></div>
                                </div>
                                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
                                    <ActionBtn type="submit" disabled={processing}>{processing ? 'Menyimpan...' : (editMode ? 'Update Tugas' : 'Simpan Tugas')}</ActionBtn>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}