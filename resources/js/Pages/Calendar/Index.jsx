import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import TaskCalendarView from '@/Components/Kanban/TaskCalendarView';

export default function CalendarIndex({ tasks = [] }) {
    const [dayModal, setDayModal] = useState({ show: false, date: '', tasks: [] });

    const statusLabels = {
        todo: { label: 'To Do', color: 'bg-gray-400 dark:bg-gray-500' },
        in_progress: { label: 'In Progress', color: 'bg-blue-400 dark:bg-blue-500' },
        postponed: { label: 'Terkendala', color: 'bg-red-500 dark:bg-red-600' },
        review: { label: 'Review', color: 'bg-yellow-400 dark:bg-yellow-500' },
        done: { label: 'Done', color: 'bg-green-400 dark:bg-green-500' },
        archived: { label: 'Archived', color: 'bg-gray-600 dark:bg-gray-700' }
    };

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title="Kalender Global" />
            
            <div className="max-w-[1600px] mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
                
                <div className="relative w-full bg-gradient-to-r from-emerald-500/90 to-teal-600/90 dark:from-emerald-800/90 dark:to-teal-900/90 backdrop-blur-[26px] p-8 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-sm overflow-hidden group">
                    <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[150%] bg-white/10 blur-[50px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 text-white flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl shadow-inner border border-white/30">📅</div>
                        <div>
                            <h2 className="text-3xl font-extrabold mb-2 drop-shadow-sm">Kalender Master</h2>
                            <p className="text-emerald-50 dark:text-emerald-100 text-sm font-medium">Pantau jadwal dan tenggat waktu seluruh tugas Anda dari semua Workspace di sini.</p>
                        </div>
                    </div>
                </div>

                {/* Kalender Global */}
                <TaskCalendarView 
                    tasks={tasks} 
                    onDayClick={(date, dayTasks) => setDayModal({ show: true, date, tasks: dayTasks })} 
                    statusLabels={statusLabels} 
                />

                {/* MODAL LIST TUGAS PADA TANGGAL TERSEBUT */}
                {dayModal.show && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/80 dark:bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-white/90 dark:bg-[#0a192f]/95 backdrop-blur-[26px] rounded-[2rem] p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-white/50 dark:border-white/10 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Tugas pada {dayModal.date}</h3>
                                <button onClick={() => setDayModal({ show: false, date: '', tasks: [] })} className="p-2 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[60vh] overflow-y-auto hide-scrollbar">
                                {dayModal.tasks.length > 0 ? (
                                    dayModal.tasks.map(t => (
                                        <div key={t.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center justify-between">
                                            <div>
                                                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{t.title}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Proyek: {t.project?.name || 'Umum'}</p>
                                            </div>
                                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full text-white ${statusLabels[t.status]?.color || 'bg-gray-400'}`}>
                                                {statusLabels[t.status]?.label || t.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 py-8 font-medium">Tidak ada tugas pada tanggal ini.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}