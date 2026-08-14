import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ActivityLogs({ logs }) {
    
    // Fungsi untuk mengubah warna badge berdasarkan tipe aksi
    const getActionColor = (action) => {
        if (action === 'created') return 'bg-green-100 text-green-700 border-green-200';
        if (action === 'updated') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (action === 'deleted') return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-2xl font-extrabold text-gray-900">Jejak Aktivitas</h2>}>
            <Head title="Activity Log" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <div className="mb-8">
                        <h3 className="text-2xl font-extrabold text-gray-900">Riwayat Perubahan (Audit Trail)</h3>
                        <p className="text-gray-500 mt-1">Semua aktivitas pembuatan, perubahan, dan penghapusan data terekam di sini.</p>
                    </div>

                    <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-4">
                        {logs.length > 0 ? logs.map((log) => (
                            <div key={log.id} className="relative pl-8 group">
                                {/* Timeline Dot */}
                                <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm group-hover:scale-125 transition-transform"></div>
                                
                                <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900">{log.user.name}</span>
                                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-400">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-3">{log.description}</p>
                                    
                                    {log.workspace && (
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            Workspace: {log.workspace.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="pl-8 text-sm text-gray-400 font-medium">
                                Belum ada aktivitas yang terekam.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}