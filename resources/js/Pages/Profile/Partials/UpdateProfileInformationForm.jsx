import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Informasi Profil</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">Perbarui nama dan alamat email akun Anda.</p>
            </header>

            <form onSubmit={submit} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Nama Lengkap</label>
                    <input
                        id="name"
                        type="text"
                        className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3.5 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-2 ml-1 font-bold" message={errors.name} />
                </div>

                <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Alamat Email</label>
                    <input
                        id="email"
                        type="email"
                        className="w-full rounded-2xl border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white px-4 py-3.5 text-sm focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2 ml-1 font-bold" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 p-4 rounded-xl">
                        <p className="text-sm text-yellow-800 dark:text-yellow-400 font-bold">
                            Alamat email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 underline hover:text-yellow-900 dark:hover:text-yellow-200 focus:outline-none"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-xs font-extrabold text-green-600 dark:text-green-400">Tautan verifikasi baru telah dikirim ke email Anda.</div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                    <button 
                        disabled={processing} 
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
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