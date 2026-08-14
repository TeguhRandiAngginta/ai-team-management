import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BackButton from '@/Components/BackButton';
import ActionBtn from '@/Components/ActionBtn';

export default function WorkspaceProjects({ workspace, projects }) {
    const { user } = usePage().props.auth;
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
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
            <div className="max-w-7xl mx-auto space-y-6">
                <BackButton href={route('dashboard')}>Kembali ke Daftar Workspace</BackButton>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-extrabold text-xl">{workspace.name.charAt(0)}</div>
                            <h2 className="text-3xl font-extrabold text-gray-900">{workspace.name}</h2>
                        </div>
                        <p className="text-gray-500 ml-15">Buat proyek baru dan kelola pekerjaan tim Anda.</p>
                    </div>
                    <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-200">
                        <Link href={route('workspace.dashboard', workspace.id)} className="px-6 py-2.5 text-gray-500 hover:text-indigo-600 font-bold text-sm rounded-lg transition-colors">Overview</Link>
                        <Link href={route('workspace.members', workspace.id)} className="px-6 py-2.5 text-gray-500 hover:text-indigo-600 font-bold text-sm rounded-lg transition-colors">Tim</Link>
                        <span className="px-6 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-lg shadow-sm">Proyek</span>
                    </div>
                </div>

                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-extrabold text-gray-900">Daftar Proyek</h3>
                    <ActionBtn onClick={showForm ? () => setShowForm(false) : openCreateForm}>
                        {showForm ? 'Batal' : '+ Buat Proyek Baru'}
                    </ActionBtn>
                </div>

                {showForm && (
                    <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-indigo-50">
                        <h3 className="text-xl font-bold mb-6 text-gray-900">{editMode ? 'Edit Proyek' : 'Proyek Baru'}</h3>
                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Proyek</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-indigo-500 px-4 py-3" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi</label>
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3" rows="1"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3">
                                        <option value="active">Active</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <ActionBtn type="submit" disabled={processing} className="w-full sm:w-auto">
                                {processing ? 'Menyimpan...' : (editMode ? 'Update Proyek' : 'Simpan Proyek')}
                            </ActionBtn>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length > 0 ? projects.map(project => (
                        <div key={project.id} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative">
                            {/* Tombol Aksi (Kanan Atas) */}
                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditForm(project)} className="p-1.5 text-gray-400 hover:text-blue-500 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                
                                {/* TOMBOL HAPUS HANYA MUNCUL JIKA BUKAN KARYAWAN */}
                                {user.role !== 'karyawan' && (
                                    <button onClick={() => deleteProject(project.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    </div>
                                    <span className={`mr-16 px-3 py-1 text-xs font-bold rounded-full border ${project.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{project.status}</span>
                                </div>
                                <h4 className="font-extrabold text-xl text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{project.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{project.description || 'Tidak ada deskripsi.'}</p>
                            </div>
                            <div className="mt-8 pt-5 border-t border-gray-50">
                                <Link href={route('workspace.projects.tasks', { workspace: workspace.id, project: project.id })} className="flex items-center justify-center w-full py-3 bg-gray-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                                    Buka Task Board &rarr;
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-gray-200"><p className="text-gray-500 font-medium">Belum ada proyek. Silakan buat proyek pertama Anda!</p></div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}