import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import BackButton from '@/Components/BackButton';
import ActionBtn from '@/Components/ActionBtn';

export default function WorkspaceMembers({ workspace, members, availableUsers = [], roles = [] }) {
    const { user } = usePage().props.auth;
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

            <div className="max-w-7xl mx-auto space-y-6">
                
                <BackButton href={route('dashboard')}>
                    Kembali ke Daftar Workspace
                </BackButton>

                {/* Header Section dengan Navigasi Internal */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-extrabold text-xl">
                                {workspace.name.charAt(0)}
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">{workspace.name}</h2>
                        </div>
                        <p className="text-gray-500 ml-15">Kelola anggota tim dan hak akses mereka di workspace ini.</p>
                    </div>

                    {/* Navigasi Tab Modern */}
                    <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-200">
                        <Link 
                            href={route('workspace.dashboard', workspace.id)}
                            className="px-6 py-2.5 text-gray-500 hover:text-indigo-600 font-bold text-sm rounded-lg transition-colors"
                        >
                            Overview
                        </Link>
                        <span className="px-6 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-lg shadow-sm">
                            Tim
                        </span>
                        <Link 
                            href={route('workspace.projects', workspace.id)}
                            className="px-6 py-2.5 text-gray-500 hover:text-indigo-600 font-bold text-sm rounded-lg transition-colors"
                        >
                            Proyek
                        </Link>
                    </div>
                </div>

                {/* Tabel Anggota */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-extrabold text-gray-900">
                            Daftar Anggota Tim 
                            <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm ml-2 font-bold">
                                {members.length}
                            </span>
                        </h3>
                        
                        {/* Tombol Tambah Anggota (Hanya Superadmin & Admin) */}
                        {user.role !== 'karyawan' && (
                            <ActionBtn onClick={() => setShowModal(true)}>
                                + Tambah Anggota
                            </ActionBtn>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Anggota</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Peran (Role)</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    {user.role !== 'karyawan' && (
                                        <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold mr-4">
                                                    {member.user.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{member.user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                            {member.user.email}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                {member.role?.name || 'Member'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${member.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {member.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        {user.role !== 'karyawan' && (
                                            <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                                                {member.user_id !== user.id && (
                                                    <button
                                                        onClick={() => removeMember(member.id, member.user.name)}
                                                        className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
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

                {/* MODAL TAMBAH ANGGOTA */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-gray-100">
                            <h3 className="text-2xl font-extrabold mb-2 text-gray-900">Tambah Anggota Tim</h3>
                            <p className="text-gray-500 text-sm mb-6">Pilih pengguna yang terdaftar untuk dimasukkan ke workspace ini.</p>

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Pengguna</label>
                                    <select
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">-- Pilih Pengguna --</option>
                                        {availableUsers.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.email}) - {u.role}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
                                    {availableUsers.length === 0 && (
                                        <p className="text-amber-600 text-xs mt-2">Semua pengguna yang terdaftar sudah bergabung di workspace ini.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Peran di Workspace (Role)</label>
                                    <select
                                        value={data.role_id}
                                        onChange={(e) => setData('role_id', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">-- Pilih Peran --</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id}</p>}
                                </div>

                                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <ActionBtn type="submit" disabled={processing || availableUsers.length === 0}>
                                        {processing ? 'Menyimpan...' : 'Tambahkan'}
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