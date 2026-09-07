import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function AIManagerGlobal({ allTasks }) {
    const { user } = usePage().props.auth;
    const [activeMenu, setActiveMenu] = useState('insight');

    // State untuk menyimpan hasil AI
    const [insightResult, setInsightResult] = useState('');
    const [reportResult, setReportResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Memanggil API Analisis Kesehatan (Global Insight)
    const generateInsight = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(route('api.ai.health_analysis'), { tasks: allTasks });
            setInsightResult(res.data.summary);
        } catch (error) {
            setInsightResult("Maaf, terjadi kesalahan saat menyambung ke server AI.");
        }
        setIsLoading(false);
    };

    // Memanggil API Rangkuman Eksekutif (Laporan Otomatis)
    const generateReport = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(route('api.ai.workspace_summary'), { tasks: allTasks });
            setReportResult(res.data.summary);
        } catch (error) {
            setReportResult("Maaf, terjadi kesalahan saat menyambung ke server AI.");
        }
        setIsLoading(false);
    };

    return (
        <AuthenticatedLayout header={<></>}>
            <Head title="AI Manager - Naomi" />

            <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8 pb-12 mt-4 px-2 sm:px-4 lg:px-8">
                
                {/* --- HERO BANNER NAOMI --- */}
                <div className="relative w-full bg-gradient-to-r from-indigo-600/90 to-purple-700/90 dark:from-indigo-900/80 dark:to-purple-900/80 backdrop-blur-[26px] p-8 sm:p-12 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-sm overflow-hidden group">
                    <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-white/10 blur-[50px] rounded-full transform -skew-x-12 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-white">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-5xl border-2 border-white/30 shadow-inner shrink-0 relative">
                            🤖<span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full ring-2 ring-indigo-600 animate-pulse"></span>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 drop-shadow-sm">Markas Global Naomi AI</h2>
                            <p className="text-indigo-100 dark:text-indigo-200 text-lg font-medium max-w-2xl">
                                Halo, Kak {user.name.split(' ')[0]}! Saya siap menganalisis {allTasks?.length || 0} tugas di seluruh Workspace Anda, mendeteksi risiko, dan menyusun laporan eksekutif.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- MENU NAVIGASI KACA --- */}
                <div className="flex p-1.5 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl sm:rounded-full w-full shadow-inner overflow-x-auto">
                    <button onClick={() => setActiveMenu('insight')} className={`shrink-0 px-8 py-3 text-sm font-extrabold rounded-xl sm:rounded-full transition-all duration-300 flex items-center gap-2 ${activeMenu === 'insight' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                        📊 Global Insight (Risiko)
                    </button>
                    <button onClick={() => setActiveMenu('report')} className={`shrink-0 px-8 py-3 text-sm font-extrabold rounded-xl sm:rounded-full transition-all duration-300 flex items-center gap-2 ${activeMenu === 'report' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                        📝 Laporan Eksekutif
                    </button>
                </div>

                {/* --- KONTEN PANEL --- */}
                <div className="relative w-full p-8 sm:p-12 bg-white/60 dark:bg-white/10 backdrop-blur-[26px] border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-sm animate-fadeIn min-h-[400px]">
                    
                    {/* PANEL GLOBAL INSIGHT */}
                    {activeMenu === 'insight' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/10 pb-4">
                                <div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Analisis Kesehatan Proyek</h3>
                                    <p className="text-sm text-gray-500 mt-1">Mendeteksi hambatan dan memprediksi risiko berdasarkan tenggat waktu.</p>
                                </div>
                                <button onClick={generateInsight} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center gap-2">
                                    {isLoading ? 'Menganalisis...' : 'Mulai Analisis 🚀'}
                                </button>
                            </div>
                            
                            <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-6 border border-gray-100 dark:border-white/5 min-h-[200px] text-gray-800 dark:text-gray-200 prose prose-indigo dark:prose-invert max-w-none">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full py-12 text-indigo-500 animate-pulse">
                                        <span className="text-5xl mb-4">🧠</span>
                                        <p className="font-bold">Naomi sedang membaca data tugas...</p>
                                    </div>
                                ) : insightResult ? (
                                    <ReactMarkdown>{insightResult}</ReactMarkdown>
                                ) : (
                                    <p className="text-center text-gray-400 font-medium py-12">Klik "Mulai Analisis" untuk meminta Naomi memeriksa proyek Anda.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PANEL LAPORAN OTOMATIS */}
                    {activeMenu === 'report' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/10 pb-4">
                                <div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Laporan Eksekutif</h3>
                                    <p className="text-sm text-gray-500 mt-1">Rangkuman kinerja tim siap baca untuk keperluan rapat.</p>
                                </div>
                                <button onClick={generateReport} disabled={isLoading} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center gap-2">
                                    {isLoading ? 'Menulis Laporan...' : 'Buat Laporan 📝'}
                                </button>
                            </div>
                            
                            <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-6 border border-gray-100 dark:border-white/5 min-h-[200px] text-gray-800 dark:text-gray-200 prose prose-indigo dark:prose-invert max-w-none">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full py-12 text-green-500 animate-pulse">
                                        <span className="text-5xl mb-4">✍️</span>
                                        <p className="font-bold">Naomi sedang mengetik laporan...</p>
                                    </div>
                                ) : reportResult ? (
                                    <ReactMarkdown>{reportResult}</ReactMarkdown>
                                ) : (
                                    <p className="text-center text-gray-400 font-medium py-12">Klik "Buat Laporan" untuk memerintahkan Naomi merangkum progres.</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}