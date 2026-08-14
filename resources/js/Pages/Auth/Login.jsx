import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

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
        <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-4 sm:p-8">
            <Head title="Log in" />

            <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Bagian Kiri - Ilustrasi & Branding */}
                <div className="hidden md:flex md:w-1/2 bg-indigo-50 p-12 flex-col justify-center items-center relative overflow-hidden">
                    {/* Ornamen Dekoratif */}
                    <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                    
                    <div className="z-10 text-center">
                        <h2 className="text-4xl font-extrabold text-indigo-900 mb-4 tracking-tight">Persevera</h2>
                        <p className="text-indigo-600 font-medium mb-10">Kelola ruang kerja dan tim Anda dengan sistem yang terintegrasi cerdas.</p>
                        
                        {/* Placeholder Ilustrasi */}
                        <div className="w-full max-w-xs aspect-video bg-white/50 backdrop-blur-sm rounded-2xl border border-white shadow-sm flex items-center justify-center text-indigo-300 font-semibold">
                            [ Area Ilustrasi / Gambar ]
                        </div>
                    </div>
                </div>

                {/* Bagian Kanan - Form Login */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative z-10">
                    <div className="mb-10 text-center md:text-left">
                        <h3 className="text-3xl font-bold text-gray-900">Login</h3>
                        <p className="text-gray-500 mt-2 text-sm">Selamat datang kembali! Silakan masukkan detail Anda.</p>
                    </div>

                    {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Email or username"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-400 shadow-sm focus:ring-indigo-400"
                                />
                                <span className="ml-2 text-sm text-gray-500">Remember me</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-medium text-gray-400 hover:text-indigo-500 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#55c5d1] hover:bg-[#43aab5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#55c5d1] transition-all duration-200 disabled:opacity-50"
                        >
                            Log in
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}