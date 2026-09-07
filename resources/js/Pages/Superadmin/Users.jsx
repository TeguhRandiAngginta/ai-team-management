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
        <AuthenticatedLayout header={<h2 className="text-xl font-extrabold text-gray-800 dark:text-white/90 leading-tight">Manajemen Pengguna Sistem</h2>}>
            <Head title="Manajemen User" />

            <div className="max-w-7xl mx-auto mt-4 pb-10">
                
                {/* --- PANEL LIQUID GLASS UTAMA --- */}
                <div className="relative w-full p-8 sm:p-10 bg-white/60 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-sm overflow-hidden group">
                    
                    {/* Pantulan Cahaya (Sheen) */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden rounded-[2.5rem]">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                        <div>
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Daftar Seluruh Pengguna</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kelola dan buat akun baru untuk Admin atau Karyawan.</p>
                        </div>
                        {/* ActionBtn tidak diubah agar fungsionalitas aslinya tetap aman */}
                        <ActionBtn onClick={() => setShowModal(true)}>
                            + Buat Akun Baru
                        </ActionBtn>
                    </div>

                    {/* Tabel Daftar Pengguna (Glass Effect) */}
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/10 relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-white/5">
                            <thead className="bg-gray-50/50 dark:bg-black/40">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role Sistem</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Terdaftar Sejak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group/row">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold mr-4 shadow-inner">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white group-hover/row:text-indigo-600 dark:group-hover/row:text-indigo-400 transition-colors">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">{u.email}</td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${u.role === 'superadmin' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-800' : u.role === 'admin' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 'bg-gray-50 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/20'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-400 dark:text-gray-500">
                                            {new Date(u.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- MODAL BUAT AKUN BARU --- */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-white dark:bg-[#0a192f] rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden">
                            
                            <h3 className="text-2xl font-extrabold mb-2 text-gray-900 dark:text-white">Buat Akun Pengguna</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">Akun yang dibuat akan langsung bisa dimasukkan ke dalam workspace.</p>

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none" 
                                        required 
                                    />
                                    {errors.name && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Alamat Email</label>
                                    <input 
                                        type="email" 
                                        value={data.email} 
                                        onChange={e => setData('email', e.target.value)} 
                                        className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none" 
                                        required 
                                    />
                                    {errors.email && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Password Sementara</label>
                                    <input 
                                        type="password" 
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none placeholder-gray-400 dark:placeholder-gray-500" 
                                        placeholder="Minimal 8 karakter"
                                        required 
                                    />
                                    {errors.password && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Role Sistem</label>
                                    <select 
                                        value={data.role} 
                                        onChange={e => setData('role', e.target.value)} 
                                        className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3 text-sm font-bold focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none"
                                    >
                                        <option value="karyawan" className="text-gray-900">Karyawan</option>
                                        <option value="admin" className="text-gray-900">Admin</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.role}</p>}
                                </div>

                                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-white/10">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)} 
                                        className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors outline-none focus:ring-2 focus:ring-indigo-500"
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