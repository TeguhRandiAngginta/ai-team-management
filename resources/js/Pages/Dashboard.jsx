import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard({ projects = [], selectedProjectId, stats }) {
    const [timeframe, setTimeframe] = useState('weekly');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cari proyek yang sedang aktif berdasarkan ID
    const selectedProject = projects.find(p => String(p.id) === String(selectedProjectId)) || projects[0];

    // Menutup dropdown jika diklik di luar area
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const data = stats || {
        total_tasks: 0,
        status_counts: { todo: 0, in_progress: 0, review: 0, done: 0, archived: 0, postponed: 0 },
        all_time: { ratio: 0, issues: 0, trend: [] },
        weekly: { ratio: 0, issues: 0, trend: [] },
        monthly: { ratio: 0, issues: 0, trend: [] }
    };

    const currentData = data[timeframe === 'all' ? 'all_time' : timeframe];

    const handleSelectProject = (projectId) => {
        setIsOpen(false);
        router.get(route('dashboard'), { project_id: projectId }, { preserveState: true, replace: true });
    };

    const getRatioLabel = (ratio) => {
        if (ratio >= 70) return 'Sangat Baik 🔥';
        if (ratio >= 40) return 'Cukup Baik 👍';
        return 'Perlu Didorong ⚠️';
    };

    const statusChartData = [
        { name: 'To Do', count: data.status_counts.todo, color: '#9CA3AF' },
        { name: 'In Progress', count: data.status_counts.in_progress, color: '#60A5FA' },
        { name: 'Review', count: data.status_counts.review, color: '#FACC15' },
        { name: 'Kendala', count: data.status_counts.postponed, color: '#F87171' },
        { name: 'Done', count: data.status_counts.done, color: '#4ADE80' },
        { name: 'Archived', count: data.status_counts.archived, color: '#4B5563' },
    ];

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title="Analitik Dashboard" />
            
            <div className="max-w-[1600px] mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
                
                {/* HERO BANNER & CUSTOM PROJECT SELECTOR */}
                <div className="relative w-full bg-gradient-to-r from-blue-600/90 to-indigo-700/90 dark:from-blue-900/80 dark:to-indigo-900/80 backdrop-blur-[26px] p-8 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-sm overflow-visible group z-30">
                    <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[150%] bg-white/10 blur-[50px] rounded-full transform skew-x-12 pointer-events-none"></div>
                    <div className="relative z-10 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl shadow-inner border border-white/30 shrink-0">📈</div>
                            <div>
                                <h2 className="text-3xl font-extrabold mb-2 drop-shadow-sm">Analitik Proyek</h2>
                                <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">Analisis mendalam siklus tugas spesifik per proyek secara terisolasi.</p>
                            </div>
                        </div>

                        {/* CUSTOM LIQUID GLASS DROPDOWN */}
                        <div className="w-full lg:w-72 relative" ref={dropdownRef}>
                            <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1.5 ml-1">Pilih Proyek Analisis</label>
                            
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full bg-black/30 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/10 text-white rounded-2xl px-4 py-3.5 text-sm font-bold flex items-center justify-between outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-inner"
                            >
                                <span className="truncate">📁 {selectedProject ? selectedProject.name : 'Pilih Proyek'}</span>
                                <svg className={`w-4 h-4 text-white/80 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* MENU LIST DROPDOWN (Z-Index Tinggi agar melayang di atas segalanya) */}
                            {isOpen && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-white/95 dark:bg-[#0a192f]/95 backdrop-blur-[26px] border border-white/50 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[999] animate-fadeIn">
                                    <div className="p-1.5 space-y-1 max-h-60 overflow-y-auto">
                                        {projects.length > 0 ? (
                                            projects.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => handleSelectProject(p.id)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${String(p.id) === String(selectedProjectId) ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                                >
                                                    <span>📁 {p.name}</span>
                                                    {String(p.id) === String(selectedProjectId) && (
                                                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">Aktif</span>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-400 text-center font-medium">Tidak ada proyek tersedia</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* KARTU STATISTIK UTAMA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-sm flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-2xl shadow-inner">
                            {data.total_tasks}
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Tugas Proyek</p>
                            <p className="text-xl font-extrabold text-gray-900 dark:text-white">Keseluruhan</p>
                        </div>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-sm flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-inner ${currentData.ratio >= 70 ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : currentData.ratio >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>
                            {currentData.ratio}%
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Rasio Penyelesaian</p>
                            <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                                {getRatioLabel(currentData.ratio)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-sm flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-inner ${currentData.issues > 0 ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'}`}>
                            {currentData.issues}
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tugas Terkendala</p>
                            <p className={`text-xl font-extrabold ${currentData.issues > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {currentData.issues > 0 ? 'Butuh Perhatian 🚨' : 'Aman Terkendali ✅'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- CHART 1: DISTRIBUSI STATUS TUGAS (BAR CHART) --- */}
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Distribusi Status Tugas Saat Ini</h3>
                        <span className="text-xs font-bold text-gray-400 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                            Spesifik Proyek Terpilih
                        </span>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value} Tugas`, 'Jumlah']}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={45}>
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- CHART 2: TREN PRODUKTIVITAS WAKTU --- */}
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                            Tren Penyelesaian Tugas ({timeframe === 'weekly' ? 'Mingguan' : timeframe === 'monthly' ? 'Bulanan' : 'Keseluruhan'})
                        </h3>

                        {/* TAB SWITCHER WAKTU */}
                        <div className="flex p-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-inner">
                            <button onClick={() => setTimeframe('weekly')} className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${timeframe === 'weekly' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                                Mingguan
                            </button>
                            <button onClick={() => setTimeframe('monthly')} className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${timeframe === 'monthly' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                                Bulanan
                            </button>
                            <button onClick={() => setTimeframe('all')} className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${timeframe === 'all' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                                Keseluruhan
                            </button>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        {currentData.trend.length > 0 && currentData.trend.every(d => d.tugas === 0) ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white/40 dark:bg-black/20 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                <span className="text-4xl mb-2">😴</span>
                                <p className="font-bold text-sm">Belum ada tugas selesai pada proyek dan rentang waktu ini.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={currentData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} allowDecimals={false} />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`${value} Tugas Selesai`, 'Tugas']}
                                    />
                                    <Bar dataKey="tugas" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}