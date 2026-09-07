import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-[#04121b] selection:bg-indigo-500 selection:text-white">
            
            {/* EFEK CAHAYA AMBIENT (BACKGROUND BLOBS) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 dark:bg-indigo-600/30 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 dark:bg-purple-600/30 blur-[120px] pointer-events-none"></div>

            <Head title="Lupa Kata Sandi" />

            <div className="w-full max-w-md px-6 relative z-10 animate-fadeIn">
                
                {/* LOGO / IKON HEADER */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-transform duration-300 border border-white/20">
                        <span className="text-3xl">🔐</span>
                    </div>
                </div>

                {/* KARTU LIQUID GLASS */}
                <div className="bg-white/80 dark:bg-[#0a192f]/80 backdrop-blur-[26px] saturate-[118%] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-2">Lupa Kata Sandi?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">
                        Tidak masalah. Masukkan alamat email Anda dan sistem akan mengirimkan tautan ajaib untuk mereset kata sandi Anda.
                    </p>

                    {/* ALERT SUKSES */}
                    {status && (
                        <div className="mb-6 font-bold text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl text-center border border-green-100 dark:border-green-800/30 animate-pulse">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">
                                Email Anda
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-inner"
                                placeholder="contoh@email.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoFocus
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Memproses...
                                </span>
                            ) : (
                                'Kirim Tautan Reset Sandi'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href={route('login')}
                            className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors outline-none focus:underline"
                        >
                            ← Kembali ke halaman Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}