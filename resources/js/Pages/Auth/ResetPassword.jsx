import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-[#04121b] selection:bg-indigo-500 selection:text-white">
            
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 dark:bg-indigo-600/30 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 dark:bg-purple-600/30 blur-[120px] pointer-events-none"></div>

            <Head title="Reset Kata Sandi" />

            <div className="w-full max-w-md px-6 relative z-10 animate-fadeIn">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-transform duration-300 border border-white/20">
                        <span className="text-3xl">🔑</span>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-[#0a192f]/80 backdrop-blur-[26px] saturate-[118%] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-2">Buat Sandi Baru</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">
                        Silakan masukkan kata sandi baru untuk akun <span className="font-bold text-gray-700 dark:text-gray-300">{email}</span>.
                    </p>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Sandi Baru</label>
                            <input
                                type="password" name="password" value={data.password}
                                className="w-full bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)} required autoFocus
                            />
                            {errors.password && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 mb-2 ml-1">Konfirmasi Sandi Baru</label>
                            <input
                                type="password" name="password_confirmation" value={data.password_confirmation}
                                className="w-full bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                                placeholder="••••••••"
                                onChange={(e) => setData('password_confirmation', e.target.value)} required
                            />
                            {errors.password_confirmation && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.password_confirmation}</p>}
                        </div>

                        <button type="submit" disabled={processing} className="w-full mt-4 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50">
                            {processing ? 'Memproses...' : 'Simpan Sandi Baru'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}