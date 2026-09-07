import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => setConfirmingUserDeletion(true);

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-xl font-extrabold text-red-600 dark:text-red-400">Hapus Akun</h2>
                <p className="mt-1 text-sm text-red-500/80 dark:text-red-400/80 font-medium">
                    Setelah akun Anda dihapus, semua sumber daya dan data akan dihapus secara permanen. Harap unduh data yang ingin Anda simpan.
                </p>
            </header>

            <button 
                onClick={confirmUserDeletion} 
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 outline-none focus:ring-2 focus:ring-red-500"
            >
                Hapus Akun Permanen
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-8 bg-white dark:bg-[#0a192f] border border-gray-100 dark:border-white/10 rounded-2xl">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Apakah Anda yakin ingin menghapus akun?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
                        Tindakan ini tidak dapat dibatalkan. Silakan masukkan kata sandi Anda untuk mengonfirmasi penghapusan.
                    </p>

                    <div>
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Kata Sandi Anda</label>
                        <input
                            id="password"
                            type="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3.5 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-red-500 transition-all outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="••••••••"
                        />
                        <InputError message={errors.password} className="mt-2 ml-1 font-bold text-red-600" />
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/10">
                        <button 
                            type="button" 
                            onClick={closeModal} 
                            className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors outline-none"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 outline-none"
                        >
                            {processing ? 'Menghapus...' : 'Konfirmasi Hapus'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}