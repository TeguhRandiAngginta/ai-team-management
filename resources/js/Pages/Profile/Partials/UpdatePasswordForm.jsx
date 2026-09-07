import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '', password: '', password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) { reset('password', 'password_confirmation'); passwordInput.current.focus(); }
                if (errors.current_password) { reset('current_password'); currentPasswordInput.current.focus(); }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Ubah Kata Sandi</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">Gunakan kata sandi yang panjang dan acak untuk menjaga keamanan akun Anda.</p>
            </header>

            <form onSubmit={updatePassword} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="current_password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Kata Sandi Saat Ini</label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3.5 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-2 ml-1 font-bold" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Kata Sandi Baru</label>
                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3.5 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-2 ml-1 font-bold" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Konfirmasi Kata Sandi Baru</label>
                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3.5 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2 ml-1 font-bold" />
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <button 
                        disabled={processing} 
                        className="px-6 py-3 bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white font-extrabold text-sm rounded-xl shadow-sm transition-all disabled:opacity-50 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {processing ? 'Menyimpan...' : 'Perbarui Sandi'}
                    </button>

                    <Transition show={recentlySuccessful} enter="transition ease-in-out duration-300" enterFrom="opacity-0 translate-y-2" leave="transition ease-in-out duration-300" leaveTo="opacity-0 translate-y-2">
                        <p className="text-sm font-extrabold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800/50 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}