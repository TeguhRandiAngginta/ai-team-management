import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ workspaces }) {
    return (
        <AuthenticatedLayout header={<></>}>
            <Head title="Dashboard Utama" />
            
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-8 text-white mb-8 shadow-lg">
                    <h2 className="text-3xl font-extrabold mb-2">Halo, Selamat Datang! {UserActivation}👋</h2>
                    <p className="text-indigo-100">Silakan pilih Workspace (Proyek Induk) yang ingin Anda kerjakan hari ini.</p>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 mb-4 px-2">Daftar Workspace Anda</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                    {workspaces && workspaces.length > 0 ? workspaces.map(ws => (
                        <Link 
                            key={ws.id} 
                            href={route('workspace.dashboard', ws.id)} 
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all group"
                        >
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <h4 className="font-extrabold text-gray-900 text-xl mb-1 group-hover:text-indigo-600">{ws.name}</h4>
                            <p className="text-sm text-gray-500 mt-3 font-medium flex items-center gap-2 group-hover:text-indigo-500">
                                Masuk ke Workspace &rarr;
                            </p>
                        </Link>
                    )) : (
                        <div className="col-span-full p-8 text-center border-2 border-dashed border-gray-200 rounded-[2rem]">
                            <p className="text-gray-500 font-medium">Anda belum bergabung dengan Workspace mana pun.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}