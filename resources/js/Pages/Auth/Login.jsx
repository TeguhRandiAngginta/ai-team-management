import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
            <Head title="Log in - Office Management" />

            {/* --- BACKGROUND IMAGE & OVERLAY (Latar Belakang Full) --- */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2564&auto=format&fit=crop" 
                    alt="Office Architecture" 
                    className="object-cover w-full h-full scale-105 animate-[pulse_30s_ease-in-out_infinite_alternate]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-[#04121b]/90 dark:from-[#04121b]/90 dark:to-[#04121b]/95 backdrop-blur-[2px] transition-colors duration-1000"></div>
            </div>

            {/* --- LIQUID GLASS PANEL (Di Tengah Layar) --- */}
            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white/70 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] border border-white/50 dark:border-white/10 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden group">
                
                {/* Efek Pantulan Cahaya Kaca (Saat Kursor Mengambang) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden rounded-[2.5rem]">
                    <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                </div>

                {/* LOGO & BRANDING */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-5 relative group-hover:scale-110 transition-transform duration-500">
                        <ApplicationLogo className="w-10 h-10 fill-current drop-shadow-md" />
                        <div className="absolute inset-0 rounded-2xl border-2 border-white/20"></div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-purple-800 dark:from-white dark:to-indigo-200">
                        Office Management
                    </h1>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-2">Masuk ke ruang kerja kolaboratif Anda.</p>
                </div>

                {status && <div className="mb-4 font-bold text-sm text-green-600 bg-green-50 p-3 rounded-xl text-center">{status}</div>}

                {/* FORM LOGIN */}
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 ml-1">
                            Alamat Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full rounded-2xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white px-5 py-3.5 focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none backdrop-blur-md"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@perusahaan.com"
                        />
                        <InputError message={errors.email} className="mt-2 ml-1" />
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2 ml-1 mr-1">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                Kata Sandi
                            </label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white hover:underline transition-colors">
                                    Lupa sandi?
                                </Link>
                            )}
                        </div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full rounded-2xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white px-5 py-3.5 focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none backdrop-blur-md"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                        />
                        <InputError message={errors.password} className="mt-2 ml-1" />
                    </div>

                    <div className="flex items-center ml-1 mt-2">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500 dark:bg-black/20 dark:checked:bg-indigo-500 transition-all cursor-pointer"
                            />
                            <span className="ml-3 text-sm font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                Ingat Saya
                            </span>
                        </label>
                    </div>

                    <button
                        className={`mt-8 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm uppercase tracking-widest rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_25px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center outline-none ${processing ? 'opacity-70 cursor-wait' : ''}`}
                        disabled={processing}
                    >
                        {processing ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            'Masuk Sistem'
                        )}
                    </button>
                </form>
            </div>
            
            {/* Dekorasi Footer */}
            <div className="absolute bottom-6 z-10 text-[10px] font-bold text-white/50 tracking-widest uppercase">
                &copy; {new Date().getFullYear()} Office Management System
            </div>
        </div>
    );
}