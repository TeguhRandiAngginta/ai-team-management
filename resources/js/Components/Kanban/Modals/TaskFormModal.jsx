import React, { useState, useRef, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import ActionBtn from '@/Components/ActionBtn';

export default function TaskFormModal({ workspace, project, members, taskToEdit, statusLabels, user, onClose, onError }) {
    const editMode = !!taskToEdit;
    const dropdownRef = useRef(null);
    
    const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState('');
    const [isGeneratingAssignee, setIsGeneratingAssignee] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsAssigneeOpen(false); setIsPriorityOpen(false); setIsStatusOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { data, setData, post, processing } = useForm({
        title: taskToEdit?.title || '', 
        description: taskToEdit?.description || '', 
        status: taskToEdit?.status || 'todo', 
        priority: taskToEdit?.priority || 'medium', 
        assignee_ids: taskToEdit?.assignees ? taskToEdit.assignees.map(a => a.id) : [], 
        due_date: taskToEdit?.due_date ? taskToEdit.due_date.split('T')[0] : '', 
        tags: taskToEdit?.tags || '', 
        files: []
    });

    // FUNGSI BARU: Memanggil AI untuk memecah tugas (Versi Nomor Angka)
    const handleAIBreakdown = async () => {
        if (!data.title) {
            alert('Silakan isi "Judul Tugas" terlebih dahulu agar AI tahu apa yang harus dipecah.');
            return;
        }

        setIsGeneratingAi(true);
        try {
            const response = await window.axios.post('/api/ai/breakdown-task', {
                title: data.title,
                description: data.description
            });

            const subtasks = response.data.subtasks || [];
            
            if (subtasks.length > 0) {
                // PERUBAHAN DI SINI: Menggunakan nomor (1., 2., 3.) tanpa tanda bintang/strip
                const checklistText = subtasks.map((task, index) => `${index + 1}. ${task}`).join('\n');
                
                // Menghilangkan tanda bintang (**) di judul
                const newDescription = data.description 
                    ? `${data.description}\n\nLangkah Eksekusi (AI):\n${checklistText}` 
                    : `Langkah Eksekusi (AI):\n${checklistText}`;
                
                setData('description', newDescription);
            } else {
                alert('AI gagal membuat checklist. Silakan coba lagi.');
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat menghubungi server AI.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleAIRecommend = async () => {
        if (!data.title) {
            alert('Silakan isi "Judul Tugas" terlebih dahulu agar AI tahu tugas apa yang akan didelegasikan.');
            return;
        }

        setIsGeneratingAssignee(true);
        setAiRecommendation('');
        
        try {
            const response = await window.axios.post('/api/ai/recommend-assignee', {
                title: data.title,
                description: data.description,
                project_id: project.id
            });
            setAiRecommendation(response.data.recommendation);
        } catch (error) {
            setAiRecommendation('Terjadi kesalahan saat menghubungi server AI.');
        } finally {
            setIsGeneratingAssignee(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (editMode) {
            router.post(route('workspace.projects.tasks.update', { workspace: workspace.id, project: project.id, task: taskToEdit.id }), {
                _method: 'PATCH', ...data
            }, {
                onSuccess: () => onClose(),
                onError: (err) => { if (err.message) onError(err.message); }
            });
        } else {
            post(route('workspace.projects.tasks.store', { workspace: workspace.id, project: project.id }), { 
                onSuccess: () => onClose(),
                onError: (err) => { if (err.message) onError(err.message); }
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl border border-gray-100 my-10 relative" ref={dropdownRef}>
                <h3 className="text-2xl font-extrabold mb-6 text-gray-900">{editMode ? 'Edit Tugas' : 'Tugas Baru'}</h3>
                
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Tugas</label>
                            <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Contoh: Buat Modul Login Pengguna" className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
                        </div>
                        
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-sm font-bold text-gray-700">Deskripsi</label>
                                
                                <button 
                                    type="button" 
                                    onClick={handleAIBreakdown} 
                                    disabled={isGeneratingAi || !data.title}
                                    className="px-3 py-1.5 text-xs font-extrabold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Isi Judul Tugas terlebih dahulu untuk mengaktifkan AI"
                                >
                                    {isGeneratingAi ? (
                                        <><span className="w-3 h-3 border-2 border-purple-400 border-t-purple-700 rounded-full animate-spin"></span> Berpikir...</>
                                    ) : (
                                        <>✨ AI Breakdown</>
                                    )}
                                </button>
                            </div>
                            
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="4" placeholder="Tulis deskripsi detail, atau klik tombol AI Breakdown di atas..." className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kategori/Tag</label>
                            <input type="text" value={data.tags} onChange={e => setData('tags', e.target.value)} placeholder="Contoh: frontend, bugfix" className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tenggat Waktu</label>
                            <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 font-medium shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer appearance-none outline-none" />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Lampiran File Baru</label>
                            <input type="file" multiple onChange={(e) => setData('files', Array.from(e.target.files))} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-200 rounded-xl bg-gray-50" />
                        </div>
                        
                        {/* --- WIDGET AI REKOMENDASI DELEGASI --- */}
                    <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-extrabold text-indigo-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                Asisten Delegasi AI
                            </h4>
                            <button 
                                type="button"
                                onClick={handleAIRecommend}
                                disabled={isGeneratingAssignee}
                                className="px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-extrabold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isGeneratingAssignee ? (
                                    <><span className="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></span> Menganalisis...</>
                                ) : (
                                    <>Tanya AI</>
                                )}
                            </button>
                        </div>
                        
                        {aiRecommendation ? (
                            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm text-sm text-gray-700 whitespace-pre-wrap animate-fadeIn">
                                {aiRecommendation}
                            </div>
                        ) : (
                            <p className="text-xs text-indigo-400 font-medium">Bingung menugaskan ke siapa? Biarkan AI memeriksa beban kerja tim secara live.</p>
                        )}
                    </div>
                    
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Penugasan</label>
                            <button type="button" onClick={() => { setIsAssigneeOpen(!isAssigneeOpen); setIsPriorityOpen(false); setIsStatusOpen(false); }} className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all flex justify-between items-center outline-none">
                                <span className="text-gray-700 font-medium truncate">{data.assignee_ids.length === 0 ? '-- Pilih Anggota --' : `${data.assignee_ids.length} Anggota Dipilih`}</span>
                                <svg className={`w-5 h-5 text-gray-500 transition-transform ${isAssigneeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {isAssigneeOpen && (
                                <div className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                    {members.length > 0 ? members.map(m => {
                                        const isSelected = data.assignee_ids.includes(m.user?.id);
                                        return (
                                            <label key={m.user?.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}>
                                                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" checked={isSelected} onChange={(e) => { if (e.target.checked) setData('assignee_ids', [...data.assignee_ids, m.user?.id]); else setData('assignee_ids', data.assignee_ids.filter(id => id !== m.user?.id)); }} />
                                                <div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold shadow-sm">{m.user?.name.charAt(0).toUpperCase()}</div><span className={`text-sm ${isSelected ? 'font-bold text-indigo-900' : 'font-medium text-gray-700'}`}>{m.user?.name}</span></div>
                                            </label>
                                        )
                                    }) : <div className="px-4 py-4 text-sm text-center text-gray-500">Tidak ada anggota tersedia</div>}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Prioritas</label>
                            <button type="button" onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsAssigneeOpen(false); setIsStatusOpen(false); }} className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all flex justify-between items-center outline-none">
                                <span className="text-gray-700 font-medium uppercase text-xs tracking-wider flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${data.priority === 'high' ? 'bg-red-500' : data.priority === 'low' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>{data.priority}</span>
                                <svg className={`w-5 h-5 text-gray-500 transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {isPriorityOpen && (
                                <div className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
                                    {[{ value: 'low', label: 'Low', color: 'bg-green-500' }, { value: 'medium', label: 'Medium', color: 'bg-yellow-500' }, { value: 'high', label: 'High', color: 'bg-red-500' }].map((item) => (
                                        <button key={item.value} type="button" onClick={() => { setData('priority', item.value); setIsPriorityOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-2.5 transition-colors border-b border-gray-50 last:border-0 ${data.priority === item.value ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span><span className="uppercase text-xs tracking-wider">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {editMode && (
                            <div className="md:col-span-2 relative">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                <button type="button" onClick={() => { setIsStatusOpen(!isStatusOpen); setIsAssigneeOpen(false); setIsPriorityOpen(false); }} className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all flex justify-between items-center outline-none">
                                    <span className="text-gray-700 font-medium uppercase text-xs tracking-wider flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${statusLabels[data.status]?.color || 'bg-gray-400'}`}></span>{statusLabels[data.status]?.label || data.status}</span>
                                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isStatusOpen && (
                                    <div className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                                        {[{ value: 'todo', label: 'To Do', color: 'bg-gray-400' }, { value: 'in_progress', label: 'In Progress', color: 'bg-blue-400' }, ...(user.role !== 'karyawan' ? [{ value: 'postponed', label: 'Postponed (Ditunda)', color: 'bg-orange-400' }] : []), { value: 'review', label: 'Review', color: 'bg-yellow-400' }, ...(user.role !== 'karyawan' ? [{ value: 'done', label: 'Done', color: 'bg-green-400' }, { value: 'archived', label: 'Archived (Arsip)', color: 'bg-gray-600' }] : [])].map((item) => (
                                            <button key={item.value} type="button" onClick={() => { setData('status', item.value); setIsStatusOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-2.5 transition-colors border-b border-gray-50 last:border-0 ${data.status === item.value ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span><span className="uppercase text-xs tracking-wider">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
                        <ActionBtn type="submit" disabled={processing}>{processing ? 'Menyimpan...' : (editMode ? 'Update Tugas' : 'Simpan Tugas')}</ActionBtn>
                    </div>
                </form>
            </div>
        </div>
    );
}