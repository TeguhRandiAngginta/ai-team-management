import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout header={<></>}>
            <Head title="Pengaturan Akun" />

            <div className="max-w-[1000px] mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8 pb-16">
                
                {/* Tautan Kembali */}
                <div>
                    <Link href={route('dashboard')} className="inline-flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Kembali ke Dashboard
                    </Link>
                </div>

                {/* Header Profil */}
                <div className="relative bg-white/60 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-sm flex items-center gap-5 overflow-hidden group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg relative z-10">
                        ⚙️
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Pengaturan Akun</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Kelola informasi profil, email, dan kata sandi Anda.</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-8 sm:p-10 rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl relative z-10"
                        />
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-8 sm:p-10 rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
                        <UpdatePasswordForm className="max-w-xl relative z-10" />
                    </div>

                    <div className="bg-red-50/50 dark:bg-red-900/10 backdrop-blur-md p-8 sm:p-10 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 shadow-sm relative overflow-hidden transition-colors">
                        <DeleteUserForm className="max-w-xl relative z-10" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}