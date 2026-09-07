import React, { useState } from 'react';

export default function TaskCalendarView({ tasks, onDayClick, statusLabels }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Tanggal asli dunia nyata hari ini
    const todayObj = new Date();
    const actualTodayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    // Filter cerdas
    const getTasksForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const formattedDate = `${day} ${monthNames[month]} ${year}`;
        const isRenderedDayActualToday = actualTodayStr === dateStr;

        return {
            formattedDate,
            dayTasks: tasks.filter(t => {
                const dueDate = t.due_date ? t.due_date.split('T')[0] : null;
                const createdAt = t.created_at ? t.created_at.split('T')[0] : null;
                
                // 1. Muncul di hari tenggat waktunya
                if (dueDate === dateStr) return true;
                
                // 2. Jika tidak punya tenggat, muncul di tanggal tugas itu dibuat (history)
                if (!dueDate && createdAt === dateStr) return true;
                
                // 3. FITUR OVERDUE: Tarik semua tugas dari masa lalu yang belum selesai ke Hari Ini!
                if (isRenderedDayActualToday && dueDate && dueDate < actualTodayStr && t.status !== 'done' && t.status !== 'archived') {
                    return true;
                }

                return false;
            })
        };
    };

    return (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-white/50 dark:border-white/10 p-6 sm:p-8 min-h-[600px] relative overflow-hidden group">
            
            {/* Pantulan Cahaya Kaca */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden rounded-[2.5rem]">
                <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 relative z-10">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">{monthNames[month]} {year}</h3>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2.5 px-4 bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">&lt; Bulan Lalu</button>
                    <button onClick={goToToday} className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-sm font-extrabold rounded-xl shadow-md transition-colors outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-500 dark:border-indigo-400">Hari Ini</button>
                    <button onClick={nextMonth} className="p-2.5 px-4 bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">Bulan Depan &gt;</button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-3 relative z-10">
                {dayNames.map(day => (
                    <div key={day} className="text-center font-extrabold text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 relative z-10">
                {blanks.map(blank => (
                    <div key={`blank-${blank}`} className="min-h-[100px] sm:min-h-[140px] bg-gray-50/30 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 backdrop-blur-sm"></div>
                ))}
                
                {days.map(day => {
                    const { formattedDate, dayTasks } = getTasksForDay(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                    
                    return (
                        <div 
                            key={day} 
                            onClick={() => onDayClick(formattedDate, dayTasks)}
                            className={`min-h-[100px] sm:min-h-[140px] rounded-2xl border p-2 flex flex-col transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm ${isToday ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30 ring-2 ring-indigo-100 dark:ring-indigo-500/20' : 'border-gray-200 dark:border-white/10 bg-white/40 dark:bg-black/20 hover:border-indigo-300 dark:hover:border-indigo-400'}`}
                        >
                            <div className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-extrabold mb-2 transition-colors ${isToday ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10'}`}>
                                {day}
                            </div>
                            
                            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto overflow-x-hidden pointer-events-none pr-1">
                                {dayTasks.slice(0, 3).map(task => {
                                    // Peringatan jika tugas ini overdue
                                    const isOverdue = task.due_date && task.due_date.split('T')[0] < actualTodayStr && task.status !== 'done' && task.status !== 'archived';
                                    
                                    // Mengekstrak warna status agar mendukung mode gelap (contoh: bg-blue-400 menjadi dark:bg-blue-500)
                                    const statusColorClass = statusLabels[task.status]?.color || 'bg-gray-400 dark:bg-gray-500';
                                    const textColorClass = statusColorClass.replace('bg-', 'text-').replace('400', '700').replace('500', '300');
                                    const borderColorClass = statusColorClass.replace('bg-', 'border-').replace('400', '200').replace('500', '800/50');
                                    const bgColorClass = statusColorClass.replace('400', '50').replace('500', '900/20');

                                    return (
                                        <div 
                                            key={task.id} 
                                            className={`flex items-center text-[10px] sm:text-[11px] font-bold px-2 py-1.5 rounded-lg truncate shadow-sm transition-colors ${task.status === 'done' || task.status === 'archived' ? 'opacity-50 line-through bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10' : `${textColorClass} ${bgColorClass} border ${borderColorClass}`}`}
                                        >
                                            {isOverdue && <span className="mr-1 inline-block animate-pulse">⚠️</span>}
                                            <span className="truncate w-full">{task.title}</span>
                                        </div>
                                    )
                                })}
                                {dayTasks.length > 3 && (
                                    <div className="text-[9px] font-extrabold text-gray-500 dark:text-gray-400 text-center py-1 bg-gray-100 dark:bg-white/10 rounded-lg mt-0.5 shadow-sm">
                                        + {dayTasks.length - 3} Tugas
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}