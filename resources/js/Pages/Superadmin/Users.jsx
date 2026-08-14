import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ActionBtn from '@/Components/ActionBtn';

export default function SuperadminUsers({ users }) {
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'karyawan',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('superadmin.users.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-2xl font-extrabold text-gray-900">Manajemen Pengguna Sistem</h2>}>
            <Head title="Manajemen User" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Tabel Daftar Pengguna */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-extrabold text-gray-900">Daftar Seluruh Pengguna</h3>
                            <p className="text-gray-500 text-sm mt-1">Kelola dan buat akun baru untuk Admin atau Karyawan.</p>
                        </div>
                        <ActionBtn onClick={() => setShowModal(true)}>
                            + Buat Akun Baru
                        </ActionBtn>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Nama</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role Sistem</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Terdaftar Sejak</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold mr-4">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'superadmin' ? 'bg-purple-50 text-purple-600 border border-purple-100' : u.role === 'admin' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(u.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL BUAT AKUN BARU */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-gray-100">
                            <h3 className="text-2xl font-extrabold mb-2 text-gray-900">Buat Akun Pengguna</h3>
                            <p className="text-gray-500 text-sm mb-6">Akun yang dibuat akan langsung bisa dimasukkan ke dalam workspace.</p>

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:ring-indigo-500" 
                                        required 
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email</label>
                                    <input 
                                        type="email" 
                                        value={data.email} 
                                        onChange={e => setData('email', e.target.value)} 
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:ring-indigo-500" 
                                        required 
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Password Sementara</label>
                                    <input 
                                        type="password" 
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:ring-indigo-500" 
                                        placeholder="Minimal 8 karakter"
                                        required 
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Role Sistem</label>
                                    <select 
                                        value={data.role} 
                                        onChange={e => setData('role', e.target.value)} 
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:ring-indigo-500"
                                    >
                                        <option value="karyawan">Karyawan</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                </div>

                                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)} 
                                        className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <ActionBtn type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Akun'}
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