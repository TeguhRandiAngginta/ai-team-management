import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ActionBtn from '@/Components/ActionBtn';

export default function WorkspaceProjects({ workspace, projects }) {
    const { user } = usePage().props.auth;
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, reset } = useForm({
        name: '', description: '', status: 'active',
    });

    const openCreateForm = () => {
        reset(); setEditMode(false); setEditingId(null); setShowForm(true);
    };

    const openEditForm = (project) => {
        setData({ name: project.name, description: project.description || '', status: project.status });
        setEditMode(true); setEditingId(project.id); setShowForm(true);
    };

    const deleteProject = (id) => {
        if (confirm('Yakin ingin menghapus proyek ini? Seluruh task di dalamnya akan ikut terhapus!')) {
            router.delete(route('workspace.projects.destroy', { workspace: workspace.id, project: id }));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('workspace.projects.update', { workspace: workspace.id, project: editingId }), {
                onSuccess: () => { reset(); setShowForm(false); },
            });
        } else {
            post(route('workspace.projects.store', workspace.id), {
                onSuccess: () => { reset(); setShowForm(false); },
            });
        }
    };

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title={`${workspace.name} - Proyek`} />
            
            <div className="max-w-[1600px] mx-auto space-y-6 pb-12 mt-4">
                
                {/* Tautan Kembali */}
                <div className="px-2">
                    <Link href={route('workspace.index')} className="inline-flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Kembali ke Daftar Workspace
                    </Link>
                </div>

                {/* HEADER KACA & TABS (DISINKRONKAN DENGAN DASHBOARD & MEMBERS) */}
                <div className="relative bg-white/60 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] p-6 sm:p-8 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-xl font-extrabold shrink-0 shadow-lg">
                            {workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{workspace.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Buat proyek baru dan kelola pekerjaan tim Anda.</p>
                        </div>
                    </div>

                    <div className="flex flex-row p-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl w-full lg:w-auto relative z-10 shadow-inner">
                        <Link href={route('workspace.members', workspace.id)} className="flex items-center justify-center gap-2 px-8 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm rounded-xl transition-colors flex-1 outline-none whitespace-nowrap">
                            👥 Tim
                        </Link>
                        <span className="flex items-center justify-center gap-2 px-8 py-2.5 bg-white dark:bg-white/10 text-indigo-600 dark:text-white font-bold text-sm rounded-xl shadow-sm flex-1 cursor-default transition-colors whitespace-nowrap">
                            📁 Proyek
                        </span>
                    </div>
                </div>

                {/* --- AREA KONTEN PROYEK --- */}
                <div className="relative w-full p-8 sm:p-10 bg-white/60 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-sm overflow-hidden group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Daftar Proyek</h3>
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold rounded-full text-sm border border-indigo-200 dark:border-indigo-800/50">
                                {projects.length}
                            </span>
                        </div>
                        <ActionBtn onClick={showForm ? () => setShowForm(false) : openCreateForm}>
                            {showForm ? 'Batal' : '+ Buat Proyek Baru'}
                        </ActionBtn>
                    </div>

                    {/* FORM TAMBAH/EDIT PROYEK (Liquid Glass) */}
                    {showForm && (
                        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-white/50 dark:border-white/10 mb-8 relative z-10 animate-fadeIn">
                            <h3 className="text-xl font-extrabold mb-6 text-gray-900 dark:text-white">{editMode ? 'Edit Proyek' : 'Proyek Baru'}</h3>
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Nama Proyek</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 px-4 py-3 text-sm transition-colors outline-none" required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Deskripsi</label>
                                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none" rows="2"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Status</label>
                                        <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3 text-sm font-bold focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none">
                                            <option value="active" className="text-gray-900">Active</option>
                                            <option value="on_hold" className="text-gray-900">On Hold</option>
                                            <option value="completed" className="text-gray-900">Completed</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <ActionBtn type="submit" disabled={processing} className="w-full sm:w-auto">
                                        {processing ? 'Menyimpan...' : (editMode ? 'Update Proyek' : 'Simpan Proyek')}
                                    </ActionBtn>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* KARTU PROYEK */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {projects.length > 0 ? projects.map(project => (
                            <div key={project.id} className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-[2rem] p-7 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between hover:shadow-xl hover:border-indigo-200 dark:hover:border-white/10 hover:-translate-y-1 transition-all duration-300 group/card relative">
                                
                                {/* Tombol Aksi (Kanan Atas) */}
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <button onClick={() => openEditForm(project)} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 bg-white dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-gray-100 dark:border-white/10 shadow-sm" title="Edit">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    
                                    {/* TOMBOL HAPUS HANYA MUNCUL JIKA BUKAN KARYAWAN */}
                                    {user.role !== 'karyawan' && (
                                        <button onClick={() => deleteProject(project.id)} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-gray-100 dark:border-white/10 shadow-sm" title="Hapus">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        </div>
                                        <span className={`mr-16 px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-full border ${project.status === 'active' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' : project.status === 'completed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h4 className="font-extrabold text-xl text-gray-900 dark:text-white mb-2 truncate group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">{project.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">{project.description || 'Tidak ada deskripsi.'}</p>
                                </div>
                                
                                <div className="mt-8 pt-5 border-t border-gray-100 dark:border-white/5">
                                    <Link href={route('workspace.projects.tasks', { workspace: workspace.id, project: project.id })} className="flex items-center justify-center w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm rounded-xl hover:bg-indigo-600 hover:border-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-sm">
                                        Buka Task Board &rarr;
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                                <div className="text-4xl mb-3 opacity-50">📂</div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Belum ada proyek. Silakan buat proyek pertama Anda!</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}