import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import ActionBtn from '@/Components/ActionBtn';

export default function WorkspaceMembers({ workspace, members, availableUsers = [], roles = [] }) {
    const { user } = usePage().props.auth;
    const isOwnerOrSuperAdmin = user.id === workspace.owner_id || user.role === 'superadmin';
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: '',
        role_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('workspace.members.store', workspace.id), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    const removeMember = (memberId, memberName) => {
        if (confirm(`Yakin ingin mengeluarkan ${memberName} dari workspace ini?`)) {
            router.delete(route('workspace.members.destroy', { workspace: workspace.id, member: memberId }));
        }
    };

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title={`${workspace.name} - Anggota Tim`} />

            <div className="max-w-[1600px] mx-auto space-y-6 pb-12 mt-4">
                
                {/* Tautan Kembali */}
                <div className="px-2">
                    <Link href={route('workspace.index')} className="inline-flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors outline-none">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Kembali ke Daftar Workspace
                    </Link>
                </div>

                {/* HEADER KACA & TABS */}
                <div className="relative bg-white/60 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] p-6 sm:p-8 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-xl font-extrabold shrink-0 shadow-lg">
                            {workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{workspace.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Kelola anggota tim dan hak akses mereka di workspace ini.</p>
                        </div>
                    </div>

                    <div className="flex flex-row p-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl w-full lg:w-auto relative z-10 shadow-inner">
                        <span className="flex items-center justify-center gap-2 px-8 py-2.5 bg-white dark:bg-white/10 text-indigo-600 dark:text-white font-bold text-sm rounded-xl shadow-sm flex-1 cursor-default transition-colors whitespace-nowrap">
                            👥 Tim
                        </span>
                        <Link href={route('workspace.projects', workspace.id)} className="flex items-center justify-center gap-2 px-8 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm rounded-xl transition-colors flex-1 outline-none whitespace-nowrap">
                            📁 Proyek
                        </Link>
                    </div>
                </div>

                {/* --- PANEL DAFTAR ANGGOTA TIM --- */}
                <div className="relative w-full p-8 sm:p-10 bg-white/60 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-sm overflow-hidden group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Daftar Anggota Tim</h3>
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold rounded-full text-sm border border-indigo-200 dark:border-indigo-800/50">
                                {members.length}
                            </span>
                        </div>
                        {isOwnerOrSuperAdmin && (
                            <ActionBtn onClick={() => setShowModal(true)} className="shadow-lg shadow-indigo-500/20">
                                + Tambah Anggota
                            </ActionBtn>
                        )}
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/10 relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/5">
                            <thead className="bg-gray-50/50 dark:bg-black/40">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Anggota</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peran (Role)</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    {isOwnerOrSuperAdmin && <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group/row">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold mr-4 shadow-inner">
                                                    {member.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white group-hover/row:text-indigo-600 dark:group-hover/row:text-indigo-400 transition-colors">
                                                    {member.user.name} {member.user.id === workspace.owner_id ? '👑' : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">{member.user.email}</td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${member.role?.name === 'admin' || member.user.role === 'superadmin' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-800' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800'}`}>
                                                {member.user.role === 'superadmin' ? 'SuperAdmin' : (member.role?.name || 'Member')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${member.is_active ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'}`}>
                                                {member.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        {isOwnerOrSuperAdmin && (
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                {member.user.id !== workspace.owner_id && (
                                                    <button onClick={() => removeMember(member.id, member.user.name)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold text-sm bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors border border-red-100 dark:border-red-900/30 outline-none focus:ring-2 focus:ring-red-400">
                                                        Keluarkan
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- MODAL TAMBAH ANGGOTA --- */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-white/90 dark:bg-[#0a192f]/95 backdrop-blur-[26px] saturate-[118%] rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-white/50 dark:border-white/10 relative overflow-hidden">
                            <h3 className="text-2xl font-extrabold mb-2 text-gray-900 dark:text-white">Tambah Anggota Tim</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">Pilih pengguna yang sudah terdaftar untuk dimasukkan ke workspace ini.</p>

                            <form onSubmit={submit} className="space-y-5 relative z-10">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Pilih Pengguna</label>
                                    {availableUsers.length > 0 ? (
                                        <select 
                                            value={data.user_id} 
                                            onChange={e => setData('user_id', e.target.value)} 
                                            className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3.5 text-sm font-bold focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none cursor-pointer" 
                                            required
                                        >
                                            <option value="" disabled className="text-gray-400">-- Pilih Anggota Baru --</option>
                                            {availableUsers.map(u => (
                                                <option key={u.id} value={u.id} className="text-gray-900 dark:text-gray-100">{u.name} ({u.email}) - {u.role}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="w-full rounded-2xl border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-4 py-3.5 text-sm font-bold shadow-inner">
                                            Semua pengguna yang terdaftar di sistem sudah berada di Workspace ini.
                                        </div>
                                    )}
                                    {errors.user_id && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.user_id}</p>}
                                </div>

                                {availableUsers.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Tetapkan Peran (Role)</label>
                                        <select 
                                            value={data.role_id} 
                                            onChange={e => setData('role_id', e.target.value)} 
                                            className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3.5 text-sm font-bold focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled className="text-gray-400">-- Pilih Peran --</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id} className="text-gray-900 dark:text-gray-100">{r.name}</option>
                                            ))}
                                        </select>
                                        {errors.role_id && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.role_id}</p>}
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-white/10">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)} 
                                        className="px-5 py-2.5 text-sm font-extrabold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Batal
                                    </button>
                                    <ActionBtn type="submit" disabled={processing || availableUsers.length === 0} className="shadow-lg shadow-indigo-500/20">
                                        {processing ? 'Menambahkan...' : 'Tambah ke Tim'}
                                    </ActionBtn>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}