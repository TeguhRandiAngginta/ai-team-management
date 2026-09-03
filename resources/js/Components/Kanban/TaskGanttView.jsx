import React, { useMemo } from 'react';

export default function TaskGanttView({ tasks, statusLabels }) {
    // Menghitung rentang tanggal (Min & Max) dari seluruh tugas
    const { minDate, maxDate, dateRange, timelineTasks } = useMemo(() => {
        if (!tasks || tasks.length === 0) return { minDate: new Date(), maxDate: new Date(), dateRange: [], timelineTasks: [] };

        let min = new Date('2099-01-01');
        let max = new Date('2000-01-01');

        const processed = tasks.map(t => {
            // Kita gunakan tanggal dibuat sbg start, dan due_date sbg end
            const start = new Date(t.created_at.split('T')[0]);
            const end = t.due_date ? new Date(t.due_date.split('T')[0]) : new Date(start);
            
            // Jika due_date kebetulan lebih awal dari dibuat, kita perbaiki
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
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm animate-fadeIn">
                <div className="text-6xl mb-4">🗓️</div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Timeline Kosong</h3>
                <p className="text-gray-500 font-medium">Gantt Chart belum bisa digambar karena tidak ada tugas.</p>
            </div>
        );
    }

    const totalDays = dateRange.length;
    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col animate-fadeIn">
            <div className="overflow-x-auto hide-scrollbar">
                <div className="min-w-[800px]">
                    
                    {/* --- HEADER TANGGAL --- */}
                    <div className="flex border-b border-gray-100 bg-gray-50/80 sticky top-0 z-20">
                        <div className="w-64 sm:w-80 shrink-0 p-4 font-extrabold text-gray-700 text-sm border-r border-gray-100 flex items-center bg-white sticky left-0 z-30 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                            📝 Informasi Tugas
                        </div>
                        <div className="flex-1 relative flex">
                            {dateRange.map((date, i) => {
                                const isToday = date.getTime() === today.getTime();
                                return (
                                    <div key={i} className={`flex-1 min-w-[48px] border-r border-gray-100 text-center py-2 flex flex-col justify-center ${isToday ? 'bg-indigo-50/50' : ''}`}>
                                        <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-600' : 'text-gray-400 uppercase'}`}>{date.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                        <span className={`text-sm ${isToday ? 'font-extrabold text-indigo-700' : 'font-semibold text-gray-700'}`}>{date.getDate()}</span>
                                        <span className={`text-[9px] ${isToday ? 'font-bold text-indigo-500' : 'font-medium text-gray-400'}`}>{date.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- BODY TIMELINE (BALOK TUGAS) --- */}
                    <div className="divide-y divide-gray-50 relative">
                        {timelineTasks.map(task => {
                            const startIdx = Math.floor((task.start - minDate) / (1000 * 60 * 60 * 24));
                            const duration = Math.ceil((task.end - task.start) / (1000 * 60 * 60 * 24)) || 1;
                            
                            const leftPercent = (startIdx / totalDays) * 100;
                            const widthPercent = (duration / totalDays) * 100;
                            const colorClass = statusLabels[task.status]?.color || 'bg-gray-400';

                            return (
                                <div key={task.id} className="flex hover:bg-gray-50 transition-colors group relative">
                                    
                                    {/* Sidebar Kiri (Sticky) */}
                                    <div className="w-64 sm:w-80 shrink-0 p-4 border-r border-gray-100 flex flex-col justify-center bg-white sticky left-0 z-20 group-hover:bg-gray-50 transition-colors shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                                        <h4 className="text-sm font-extrabold text-gray-800 truncate mb-1" title={task.title}>{task.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                                                {statusLabels[task.status]?.label}
                                            </div>
                                            {task.assignees && task.assignees.length > 0 && (
                                                <div className="flex -space-x-1.5">
                                                    {task.assignees.slice(0, 3).map(a => (
                                                        <div key={a.id} className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px] font-bold ring-1 ring-white" title={a.name}>
                                                            {a.name.charAt(0)}
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
                                                return <div key={i} className={`flex-1 min-w-[48px] border-r border-gray-50 ${isToday ? 'bg-indigo-50/30' : ''}`}></div>
                                            })}
                                        </div>

                                        {/* Balok Tugas Interaktif */}
                                        <div
                                            className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-lg shadow-sm flex items-center px-3 text-xs font-bold text-white overflow-hidden cursor-pointer group-hover:-translate-y-4 group-hover:scale-y-110 transition-transform z-10 ${colorClass}`}
                                            style={{ left: `calc(${leftPercent}%)`, width: `calc(${widthPercent}%)`, minWidth: '48px' }}
                                            title={`${task.title} (${task.start.toLocaleDateString('id-ID')} - ${task.end.toLocaleDateString('id-ID')})`}
                                        >
                                            <span className="truncate drop-shadow-md">{duration} Hari</span>
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