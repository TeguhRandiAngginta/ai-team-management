import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import TaskCalendarView from '@/Components/Kanban/TaskCalendarView';

export default function WorkspaceDashboard({ workspace, allTasks }) {
    const { user } = usePage().props.auth;
    
    // State baru untuk mengatur tampilan widget di Overview
    const [activeWidget, setActiveWidget] = useState('overview'); // 'overview' | 'calendar' | 'analytics'
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [dayModal, setDayModal] = useState({ show: false, date: '', tasks: [] });

    const statusLabels = {
        todo: { label: 'To Do', color: 'bg-gray-400' },
        in_progress: { label: 'In Progress', color: 'bg-blue-400' },
        postponed: { label: 'Postponed', color: 'bg-orange-400' },
        review: { label: 'Review', color: 'bg-yellow-400' },
        done: { label: 'Done', color: 'bg-green-400' },
        archived: { label: 'Archived', color: 'bg-gray-600' }
    };
    const statusOrder = ['todo', 'in_progress', 'review', 'postponed', 'done', 'archived'];
    const todayObj = new Date();
    const actualTodayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    const totalTasks = Array.isArray(allTasks) ? allTasks.length : 0;
    const completedTasks = Array.isArray(allTasks) ? allTasks.filter(t => t.status === 'done' || t.status === 'archived').length : 0;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const overdueTasks = Array.isArray(allTasks) ? allTasks.filter(t => t.due_date && t.due_date.split('T')[0] < actualTodayStr && t.status !== 'done' && t.status !== 'archived').length : 0;

    const statusCounts = {
        todo: Array.isArray(allTasks) ? allTasks.filter(t => t.status === 'todo').length : 0,
        in_progress: Array.isArray(allTasks) ? allTasks.filter(t => t.status === 'in_progress').length : 0,
        review: Array.isArray(allTasks) ? allTasks.filter(t => t.status === 'review').length : 0,
        postponed: Array.isArray(allTasks) ? allTasks.filter(t => t.status === 'postponed').length : 0,
    };


    // Menghitung Produktivitas dan Beban Kerja per User
    const userStats = {};
    if (Array.isArray(allTasks)) {
        allTasks.forEach(task => {
            if (task.assignees && task.assignees.length > 0) {
                task.assignees.forEach(assignee => {
                    if (!userStats[assignee.id]) {
                        userStats[assignee.id] = { name: assignee.name, done: 0, pending: 0, avatar: assignee.name.charAt(0).toUpperCase() };
                    }
                    if (task.status === 'done' || task.status === 'archived') {
                        userStats[assignee.id].done += 1;
                    } else {
                        userStats[assignee.id].pending += 1;
                    }
                });
            }
        });
    }

    const leaderboard = Object.values(userStats).sort((a, b) => b.done - a.done).slice(0, 5);
    const workload = Object.values(userStats).sort((a, b) => b.pending - a.pending).slice(0, 5);
    const maxPending = workload.length > 0 ? workload[0].pending : 1; // Untuk rasio grafik batang
    const formatAIResponse = (text) => {
        if (!text) return { __html: '' };
        
        let formatted = text
            // 1. Sapu bersih SEMUA Header (#) jadi Judul Berwarna
            .replace(/^#{1,6}\s*(.*)$/gim, '<h4 class="text-indigo-700 font-extrabold mt-6 mb-2">$1</h4>')
            
            // 2. TANGKAP SEMUA BULLET (Strip, Bintang, Poin) termasuk yang menjorok/spasi
            .replace(/^\s*[-\*•]\s+(.*)$/gim, '<li class="ml-5 list-disc marker:text-indigo-500 font-medium text-gray-700 mb-1">$1</li>')
            
            // 3. Rapikan teks tebal (**teks**)
            .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-extrabold text-gray-900">$1</strong>');
            
        return { __html: formatted };
    };

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title={`${workspace.name} - Overview`} />
            
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                <div className="px-2">
                    <Link href={route('dashboard')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Kembali ke Daftar Workspace
                    </Link>
                </div>

                {/* HEADER KONSISTEN */}
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl font-extrabold shrink-0">
                            {workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">{workspace.name}</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Pusat komando dan ringkasan aktivitas workspace.</p>
                        </div>
                    </div>

                    <div className="flex p-1 bg-gray-50 border border-gray-100 rounded-xl w-full lg:w-auto">
                        <span className="px-6 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-lg shadow-sm flex-1 text-center cursor-default">
                            Overview
                        </span>
                        <Link href={route('workspace.members', workspace.id)} className="px-6 py-2.5 text-gray-500 hover:text-indigo-600 font-bold text-sm rounded-lg transition-colors flex-1 text-center">
                            Tim
                        </Link>
                        <Link href={route('workspace.projects', workspace.id)} className="px-6 py-2.5 text-gray-500 hover:text-indigo-600 font-bold text-sm rounded-lg transition-colors flex-1 text-center">
                            Proyek
                        </Link>
                    </div>
                </div>

                {/* --- KONTEN BERDASARKAN WIDGET AKTIF --- */}
                {activeWidget === 'overview' && (
                    <div className="px-2 pt-4 transition-all duration-300 animate-fadeIn">
                        <h3 className="text-xl font-extrabold text-gray-900 mb-4">Pusat Widget & Fitur</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            {/* KARTU BUKA KALENDER */}
                            <div 
                                onClick={() => setActiveWidget('calendar')}
                                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all cursor-pointer group relative"
                            >
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Kalender Global Master</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">Klik untuk melihat kalender gabungan seluruh tugas dari berbagai proyek.</p>
                                <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Buka Kalender <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </div>
                            </div>

                            {/* KARTU ANALITIK (SEKARANG AKTIF!) */}
                            <div 
                                onClick={() => setActiveWidget('analytics')}
                                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all cursor-pointer group relative"
                            >
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Analitik Dashboard</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">Lihat laporan produktivitas, grafik penyelesaian proyek, dan status beban kerja tim.</p>
                                <div className="mt-4 flex items-center text-xs font-bold text-blue-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Lihat Grafik <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </div>
                            </div>

                            {/* KARTU AI MANAGER (SEKARANG HIDUP!) */}
                            <div 
                            onClick={() => setActiveWidget('ai')}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 transition-all cursor-pointer group relative">
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">AI Manager</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">Asisten cerdas untuk merangkum progres dan memberikan rekomendasi proyek.</p>
                                    <div className="mt-4 flex items-center text-xs font-bold text-purple-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Buka Asisten <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* --- HALAMAN KALENDER --- */}
                {activeWidget === 'calendar' && (
                    <div className="px-2 pb-10 pt-4 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                                <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Kalender Master
                            </h3>
                            <button 
                                onClick={() => setActiveWidget('overview')}
                                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Kembali
                            </button>
                        </div>
                        <TaskCalendarView tasks={Array.isArray(allTasks) ? allTasks : []} onDayClick={(date, dayTasks) => setDayModal({ show: true, date, tasks: dayTasks })} statusLabels={statusLabels} />
                    </div>
                )}

                {/* --- HALAMAN ANALITIK DASHBOARD (BARU!) --- */}
                {activeWidget === 'analytics' && (
                    <div className="px-2 pb-10 pt-4 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                                <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Laporan Analitik
                            </h3>
                            <button 
                                onClick={() => setActiveWidget('overview')}
                                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Kembali
                            </button>
                        </div>

                        {/* Top 3 Kartu Ringkasan */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-2xl">{completionRate}%</div>
                                <div>
                                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Rasio Penyelesaian</p>
                                    <p className="text-3xl font-extrabold text-gray-900">{completedTasks} <span className="text-lg text-gray-400 font-medium">/ {totalTasks} Tugas</span></p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center font-extrabold text-2xl">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Sedang Berjalan</p>
                                    <p className="text-3xl font-extrabold text-gray-900">{pendingTasks} <span className="text-lg text-gray-400 font-medium">Tugas</span></p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-extrabold text-2xl">⚠️</div>
                                <div>
                                    <p className="text-red-400 text-sm font-bold uppercase tracking-wider mb-1">Terlambat (Overdue)</p>
                                    <p className="text-3xl font-extrabold text-red-600">{overdueTasks} <span className="text-lg text-red-400 font-medium">Tugas</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Bar Distribusi Status */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-8">
                            <h4 className="text-lg font-extrabold text-gray-900 mb-6">Distribusi Status Tugas Saat Ini</h4>
                            
                            {/* Visual Progress Bar (Berwarna) */}
                            <div className="w-full h-8 flex rounded-full overflow-hidden shadow-inner mb-6 bg-gray-100">
                                {statusCounts.todo > 0 && <div style={{ width: `${(statusCounts.todo / totalTasks) * 100}%` }} className="h-full bg-gray-400 border-r border-white/20" title={`To Do: ${statusCounts.todo}`}></div>}
                                {statusCounts.in_progress > 0 && <div style={{ width: `${(statusCounts.in_progress / totalTasks) * 100}%` }} className="h-full bg-blue-400 border-r border-white/20" title={`In Progress: ${statusCounts.in_progress}`}></div>}
                                {statusCounts.review > 0 && <div style={{ width: `${(statusCounts.review / totalTasks) * 100}%` }} className="h-full bg-yellow-400 border-r border-white/20" title={`Review: ${statusCounts.review}`}></div>}
                                {statusCounts.postponed > 0 && <div style={{ width: `${(statusCounts.postponed / totalTasks) * 100}%` }} className="h-full bg-orange-400 border-r border-white/20" title={`Postponed: ${statusCounts.postponed}`}></div>}
                                {completedTasks > 0 && <div style={{ width: `${(completedTasks / totalTasks) * 100}%` }} className="h-full bg-green-400" title={`Selesai: ${completedTasks}`}></div>}
                            </div>
                            
                            {/* Keterangan Warna (Legend) */}
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-600">
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400"></span> To Do ({statusCounts.todo})</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400"></span> In Progress ({statusCounts.in_progress})</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Review ({statusCounts.review})</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400"></span> Postponed ({statusCounts.postponed})</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400"></span> Selesai ({completedTasks})</div>
                            </div>
                        </div>

                        {/* Papan Peringkat (Leaderboard & Workload) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* 1. Leaderboard (Paling Produktif) */}
                            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                <h4 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-6">
                                    🏆 Tim Paling Produktif
                                </h4>
                                <div className="space-y-5">
                                    {leaderboard.length > 0 ? leaderboard.map((user, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                                                    {user.avatar}
                                                </div>
                                                <span className="font-bold text-gray-800">{user.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-green-600 font-extrabold">
                                                <span>{user.done}</span>
                                                <span className="text-xs bg-green-100 px-2 py-0.5 rounded-full text-green-700">Tugas Selesai</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-gray-400 text-center italic py-4">Belum ada tugas yang diselesaikan.</p>
                                    )}
                                </div>
                            </div>

                            {/* 2. Workload (Beban Kerja Tertinggi) */}
                            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                <h4 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-6">
                                    🏋️ Beban Kerja Anggota (Tertunda)
                                </h4>
                                <div className="space-y-6">
                                    {workload.length > 0 ? workload.map((user, idx) => {
                                        // Menghitung persentase bar relatif terhadap karyawan dengan beban tugas terbanyak
                                        const barWidth = Math.max((user.pending / maxPending) * 100, 5); 
                                        const isOverloaded = user.pending > 5; // Asumsi jika tugas pending > 5 = beban berat

                                        return (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-gray-800 text-sm">{user.name}</span>
                                                    <span className={`text-xs font-extrabold ${isOverloaded ? 'text-red-500' : 'text-blue-600'}`}>{user.pending} Tugas</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${isOverloaded ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
                                                        style={{ width: `${barWidth}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-gray-400 text-center italic py-4">Semua tugas telah diselesaikan!</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
                {/* --- HALAMAN AI MANAGER --- */}
{activeWidget === 'ai' && (
    <div className="px-2 pb-10 pt-4 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                <svg className="w-7 h-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Project Manager
            </h3>
            <button 
                onClick={() => setActiveWidget('overview')}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Kembali
            </button>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <h4 className="text-xl font-extrabold text-gray-900 mb-3">Hasilkan Ringkasan Cerdas</h4>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">AI akan menganalisis data {allTasks.length} tugas di workspace ini dan memberikan ringkasan status, mendeteksi risiko keterlambatan, serta saran langkah selanjutnya.</p>
            
            <button 
                onClick={async () => {
                    setIsGeneratingAi(true);
                    setAiSummary('');
                    try {
                        const response = await window.axios.post('/api/ai/workspace-summary', { tasks: allTasks });
                        setAiSummary(response.data.summary);
                    } catch (error) {
                        setAiSummary(error.response?.data?.summary || 'Terjadi kesalahan sistem saat menghubungi AI.');
                    } finally {
                        setIsGeneratingAi(false);
                    }
                }}
                disabled={isGeneratingAi}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3 mx-auto"
            >
                {isGeneratingAi ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> AI Sedang Berpikir...</>
                ) : (
                    <>✨ Generate AI Summary</>
                )}
            </button>

            {/* Hasil Teks AI */}
            {aiSummary && (
                <div className="mt-10 p-6 sm:p-8 bg-gray-50 border border-gray-100 rounded-2xl text-left animate-fadeIn relative shadow-inner">
                    <span className="absolute top-4 right-4 text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        AI Result
                    </span>
                    
                    <h5 className="font-extrabold text-gray-900 mb-6 text-xl border-b border-gray-200 pb-4">Laporan Eksekutif Proyek</h5>
                    
                    {/* PERUBAHAN DI SINI: Kita menggunakan formatAIResponse */}
                    <div 
                        className="text-sm sm:text-base text-gray-600 whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={formatAIResponse(aiSummary)}
                    />
                </div>
            )}
        </div>
    </div>
)}

                {/* MODAL AGENDA HARIAN MASTER (Sama seperti sebelumnya) */}
                {/* ... (Kode Modal DayCalendar tidak diubah, tetap ditaruh di sini agar berfungsi) ... */}
                {dayModal.show && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
                        <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                                <div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                                        <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Agenda Global: {dayModal.date}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1 font-medium">Total {dayModal.tasks.length} tugas ditemukan dari berbagai proyek.</p>
                                </div>
                                <button onClick={() => setDayModal({ show: false, date: '', tasks: [] })} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 shadow-sm transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-[#F8FAFC]">
                                {dayModal.tasks.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="text-6xl mb-4">🌴</div>
                                        <p className="text-gray-500 font-bold text-lg">Tidak ada tugas pada tanggal ini.</p>
                                    </div>
                                ) : (
                                    statusOrder.map(status => {
                                        const tasksInStatus = dayModal.tasks.filter(t => t.status === status);
                                        if (tasksInStatus.length === 0) return null;

                                        return (
                                            <div key={status} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <h4 className="text-sm font-extrabold uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-700 border-b border-gray-50 pb-3">
                                                    <span className={`w-3 h-3 rounded-full ${statusLabels[status].color}`}></span>
                                                    {statusLabels[status].label} <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md ml-1">{tasksInStatus.length}</span>
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {tasksInStatus.map(task => {
                                                        const isOverdue = task.due_date && task.due_date.split('T')[0] < actualTodayStr && task.status !== 'done' && task.status !== 'archived';
                                                        
                                                        return (
                                                            <Link 
                                                                key={task.id} 
                                                                href={route('workspace.projects.tasks', { workspace: workspace.id, project: task.project_id })}
                                                                className={`block cursor-pointer bg-white border p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group ${isOverdue ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100 hover:border-indigo-300'}`}
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex gap-1 items-center flex-wrap">
                                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.priority}</span>
                                                                        {isOverdue && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-600 text-white animate-pulse">⚠️ Terlambat</span>}
                                                                    </div>
                                                                    <div className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-500 flex items-center gap-1">
                                                                        Buka <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                    </div>
                                                                </div>
                                                                <h5 className="font-bold text-gray-800 text-sm mb-1 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{task.title}</h5>
                                                                <div className="flex justify-between items-center text-xs text-gray-400 mt-3 border-t border-gray-50 pt-2">
                                                                    {task.assignees?.length > 0 ? (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px] font-bold">{task.assignees[0].name.charAt(0)}</div>
                                                                            <span className="truncate max-w-[80px]">{task.assignees[0].name}</span>
                                                                        </div>
                                                                    ) : <span>Belum ditugaskan</span>}
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}