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
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 min-h-[600px]">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-2xl font-extrabold text-gray-900">{monthNames[month]} {year}</h3>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2.5 px-4 bg-white border border-gray-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-bold transition-colors">&lt; Bulan Lalu</button>
                    <button onClick={goToToday} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-md hover:bg-gray-800 transition-colors">Bulan Ini</button>
                    <button onClick={nextMonth} className="p-2.5 px-4 bg-white border border-gray-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-bold transition-colors">Bulan Depan &gt;</button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center font-extrabold text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {blanks.map(blank => (
                    <div key={`blank-${blank}`} className="min-h-[100px] sm:min-h-[140px] bg-gray-50/50 rounded-2xl border border-dashed border-gray-200"></div>
                ))}
                
                {days.map(day => {
                    const { formattedDate, dayTasks } = getTasksForDay(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                    
                    return (
                        <div 
                            key={day} 
                            onClick={() => onDayClick(formattedDate, dayTasks)}
                            className={`min-h-[100px] sm:min-h-[140px] rounded-2xl border p-2 flex flex-col transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 ${isToday ? 'border-indigo-300 bg-indigo-50/30 ring-4 ring-indigo-50' : 'border-gray-100 bg-white hover:border-indigo-300'}`}
                        >
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-extrabold mb-2 ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-700 bg-gray-50'}`}>
                                {day}
                            </div>
                            
                            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto overflow-x-hidden pointer-events-none pr-1">
                                {dayTasks.slice(0, 3).map(task => {
                                    // Peringatan jika tugas ini overdue
                                    const isOverdue = task.due_date && task.due_date.split('T')[0] < actualTodayStr && task.status !== 'done' && task.status !== 'archived';
                                    
                                    return (
                                        <div 
                                            key={task.id} 
                                            className={`flex items-center text-[10px] sm:text-[11px] font-bold px-2 py-1.5 rounded-md truncate shadow-sm ${task.status === 'done' || task.status === 'archived' ? 'opacity-50 line-through bg-gray-50 text-gray-500 border-gray-200' : `${statusLabels[task.status]?.color.replace('bg-', 'text-').replace('400', '700')} bg-white border ${statusLabels[task.status]?.color.replace('bg-', 'border-').replace('400', '200')}`}`}
                                        >
                                            {isOverdue && <span className="mr-1">⚠️</span>}
                                            <span className="truncate">{task.title}</span>
                                        </div>
                                    )
                                })}
                                {dayTasks.length > 3 && (
                                    <div className="text-[9px] font-extrabold text-gray-500 text-center py-1 bg-gray-100 rounded-md mt-0.5 shadow-sm">
                                        + {dayTasks.length - 3} Tugas Lainnya
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