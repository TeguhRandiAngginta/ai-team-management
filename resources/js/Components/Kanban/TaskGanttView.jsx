import React, { useMemo } from 'react';

export default function TaskGanttView({ tasks, statusLabels }) {
    // Menghitung rentang tanggal (Min & Max) dari seluruh tugas
    const { minDate, maxDate, dateRange, timelineTasks } = useMemo(() => {
        if (!tasks || tasks.length === 0) return { minDate: new Date(), maxDate: new Date(), dateRange: [], timelineTasks: [] };

        let min = new Date('2099-01-01');
        let max = new Date('2000-01-01');

        const processed = tasks.map(t => {
            const start = new Date(t.created_at.split('T')[0]);
            const end = t.due_date ? new Date(t.due_date.split('T')[0]) : new Date(start);
            
            if (end < start) end.setDate(start.getDate() + 1);

            if (start < min) min = new Date(start);
            if (end > max) max = new Date(end);

            return { ...t, start, end };
        });

        // Beri bantalan (padding) 3 hari sebelum dan 7 hari sesudah
        min.setDate(min.getDate() - 3);
        max.setDate(max.getDate() + 7);

        const range = [];
        let current = new Date(min);
        while (current <= max) {
            range.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return { minDate: min, maxDate: max, dateRange: range, timelineTasks: processed };
    }, [tasks]);

    if (!tasks || tasks.length === 0) {
        return (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-[2rem] p-12 text-center border border-white/50 dark:border-white/10 shadow-sm animate-fadeIn">
                <div className="text-6xl mb-4 opacity-70">🗓️</div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Timeline Kosong</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Gantt Chart belum bisa digambar karena tidak ada tugas.</p>
            </div>
        );
    }

    const totalDays = dateRange.length;
    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-[26px] saturate-[118%] border border-white/50 dark:border-white/10 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col animate-fadeIn relative">
            
            {/* Pantulan Kaca Transparan */}
            <div className="absolute inset-0 opacity-50 pointer-events-none transition-opacity duration-1000 overflow-hidden rounded-[2.5rem]">
                <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -skew-x-12 translate-x-[-50%]"></div>
            </div>

            <div className="overflow-x-auto hide-scrollbar relative z-10">
                <div className="min-w-[800px]">
                    
                    {/* --- HEADER TANGGAL --- */}
                    <div className="flex border-b border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 backdrop-blur-md sticky top-0 z-20">
                        <div className="w-64 sm:w-80 shrink-0 p-4 font-extrabold text-gray-700 dark:text-gray-300 text-sm border-r border-gray-100 dark:border-white/10 flex items-center bg-white/90 dark:bg-[#04121b]/90 sticky left-0 z-30 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_10px_-5px_rgba(255,255,255,0.05)]">
                            📝 Informasi Tugas
                        </div>
                        <div className="flex-1 relative flex">
                            {dateRange.map((date, i) => {
                                const isToday = date.getTime() === today.getTime();
                                return (
                                    <div key={i} className={`flex-1 min-w-[48px] border-r border-gray-100 dark:border-white/5 text-center py-2 flex flex-col justify-center transition-colors ${isToday ? 'bg-indigo-50/80 dark:bg-indigo-900/40' : ''}`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>{date.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                        <span className={`text-sm ${isToday ? 'font-extrabold text-indigo-700 dark:text-indigo-300' : 'font-semibold text-gray-700 dark:text-gray-300'}`}>{date.getDate()}</span>
                                        <span className={`text-[9px] ${isToday ? 'font-bold text-indigo-500 dark:text-indigo-400' : 'font-medium text-gray-400 dark:text-gray-600'}`}>{date.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- BODY TIMELINE (BALOK TUGAS) --- */}
                    <div className="divide-y divide-gray-50 dark:divide-white/5 relative">
                        {timelineTasks.map(task => {
                            const startIdx = Math.floor((task.start - minDate) / (1000 * 60 * 60 * 24));
                            
                            // PERBAIKAN LOGIKA DURASI: (+1) Ditambahkan agar 1 hari jadi 1, 2 hari jadi 2, dll.
                            const duration = Math.ceil((task.end - task.start) / (1000 * 60 * 60 * 24)) + 1;
                            
                            const leftPercent = (startIdx / totalDays) * 100;
                            const widthPercent = (duration / totalDays) * 100;
                            
                            // Mengekstrak warna status
                            const baseColorClass = statusLabels[task.status]?.color || 'bg-gray-400';
                            const colorClass = baseColorClass.includes('dark:') ? baseColorClass : `${baseColorClass} dark:${baseColorClass.replace('400', '500').replace('500', '600')}`;

                            return (
                                <div key={task.id} className="flex hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group relative">
                                    
                                    {/* Sidebar Kiri (Sticky) */}
                                    <div className="w-64 sm:w-80 shrink-0 p-4 border-r border-gray-100 dark:border-white/10 flex flex-col justify-center bg-white/90 dark:bg-[#04121b]/90 backdrop-blur-sm sticky left-0 z-20 group-hover:bg-gray-50 dark:group-hover:bg-[#0a192f] transition-colors shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_10px_-5px_rgba(255,255,255,0.02)]">
                                        <h4 className="text-sm font-extrabold text-gray-800 dark:text-white truncate mb-1" title={task.title}>{task.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                                                {statusLabels[task.status]?.label}
                                            </div>
                                            {task.assignees && task.assignees.length > 0 && (
                                                <div className="flex -space-x-1.5">
                                                    {task.assignees.slice(0, 3).map(a => (
                                                        <div key={a.id} className="w-4 h-4 rounded-full bg-indigo-500 border border-white dark:border-[#04121b] text-white flex items-center justify-center text-[7px] font-bold shadow-sm" title={a.name}>
                                                            {a.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Area Balok Gantt */}
                                    <div className="flex-1 relative py-4">
                                        {/* Background Grid Pattern */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {dateRange.map((date, i) => {
                                                const isToday = date.getTime() === today.getTime();
                                                return <div key={i} className={`flex-1 min-w-[48px] border-r border-gray-50 dark:border-white/5 ${isToday ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}></div>
                                            })}
                                        </div>

                                        {/* Balok Tugas Interaktif */}
                                        <div
                                            className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-lg shadow-sm flex items-center px-3 text-xs font-bold text-white overflow-hidden cursor-pointer hover:opacity-90 hover:shadow-md transition-all z-10 ${colorClass}`}
                                            style={{ left: `calc(${leftPercent}%)`, width: `calc(${widthPercent}%)`, minWidth: '48px' }}
                                            title={`${task.title} (${task.start.toLocaleDateString('id-ID')} - ${task.end.toLocaleDateString('id-ID')})`}
                                        >
                                            <span className="whitespace-nowrap drop-shadow-md">{duration} Hari</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}