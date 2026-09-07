import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function ProjectChatbot({ project, user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const chatEndRef = useRef(null);
    
    // Kunci storage tunggal agar ingatan Naomi berlaku global (tidak ter-reset saat pindah proyek)
    const storageKey = `naomi_chat_global_memory_${user?.id}`;

    // 1. MEMORI PERMANEN
    const [chatHistory, setChatHistory] = useState(() => {
        const savedChat = localStorage.getItem(storageKey);
        if (savedChat) {
            return JSON.parse(savedChat);
        }
        
        const firstName = user && user.name ? user.name.split(' ')[0] : 'Kakak';
        return [
            { role: 'assistant', content: `Halo Kak **${firstName}**! 👋 Aku Naomi, asisten AI untuk workspace kamu. Ada yang bisa aku bantu hari ini?` }
        ];
    });

    // 2. Simpan setiap perubahan chat ke memori browser
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(chatHistory));
    }, [chatHistory, storageKey]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, isOpen]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message.trim();
        const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
        
        setChatHistory(newHistory);
        setMessage('');
        setIsLoading(true);

        try {
            // Ambil 10 pesan terakhir agar API tidak kelebihan muatan
            const apiHistory = newHistory.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Mengirim request ke Backend
            const response = await axios.post('/api/ai/project-chat', {
                message: userMsg,
                project_id: project?.id || null,
                history: apiHistory
            });

            setChatHistory([...newHistory, { role: 'assistant', content: response.data.reply }]);
        } catch (error) {
            setChatHistory([...newHistory, { role: 'assistant', content: 'Maaf, sepertinya koneksiku ke server lagi terputus Kak. Coba lagi bentar ya!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        if(confirm('Hapus seluruh riwayat obrolan dengan Naomi? (Memori akan keriset ke awal)')) {
            const firstName = user?.name?.split(' ')[0] || '';
            const initialChat = [{ role: 'assistant', content: `Memori berhasil dihapus! Halo lagi Kak **${firstName}**! 👋 Ada yang bisa dibantu?` }];
            setChatHistory(initialChat);
            localStorage.setItem(storageKey, JSON.stringify(initialChat));
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[120]">
            
            {/* WIDGET KOTAK CHAT (LIQUID GLASS DENGAN ANIMASI) */}
            <div className={`bg-white/80 dark:bg-[#0a192f]/80 backdrop-blur-[26px] saturate-[118%] w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 absolute bottom-0 right-0 pointer-events-none'}`}>
                
                {/* HEADER CHATBOT */}
                <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 dark:from-indigo-800/90 dark:to-purple-900/90 p-5 flex items-center justify-between shrink-0 backdrop-blur-md relative border-b border-white/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[30px] rounded-full pointer-events-none"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner backdrop-blur-sm border border-white/30 relative">
                            🤖
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border border-indigo-600 rounded-full animate-pulse"></span>
                        </div>
                        <div>
                            <h3 className="text-white font-extrabold text-sm tracking-wide">Naomi AI</h3>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider">
                                {project?.name ? project.name : 'Global Workspace'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 relative z-10">
                        <button onClick={clearChat} title="Hapus Riwayat Chat" className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors outline-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors outline-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* BODY CHAT */}
                <div className="flex-1 p-5 overflow-y-auto bg-gray-50/50 dark:bg-black/20 space-y-4 hide-scrollbar">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                            <div className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm shadow-sm font-medium ${
                                chat.role === 'user' 
                                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-br-sm shadow-indigo-500/20' 
                                    : 'bg-white dark:bg-[#112240] border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 rounded-bl-sm backdrop-blur-md prose prose-sm prose-indigo dark:prose-invert'
                            }`}>
                                {/* Jika pesan bot, gunakan ReactMarkdown agar struktur rapi, kalau user render teks biasa */}
                                {chat.role === 'user' ? (
                                    chat.content
                                ) : (
                                    <ReactMarkdown>{chat.content}</ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start animate-fadeIn">
                            <div className="bg-white dark:bg-[#112240] border border-gray-100 dark:border-white/5 rounded-[1.25rem] rounded-bl-sm px-4 py-3.5 shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                                <span className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-4 bg-white/80 dark:bg-[#0a192f]/80 border-t border-gray-100 dark:border-white/10 shrink-0 backdrop-blur-md">
                    <form onSubmit={sendMessage} className="flex items-center gap-2 relative">
                        <input 
                            type="text" 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            placeholder="Tanya Naomi sesuatu..." 
                            disabled={isLoading} 
                            className="w-full bg-gray-100 dark:bg-black/40 border border-transparent dark:border-white/5 text-gray-900 dark:text-white rounded-full px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12 disabled:opacity-50 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner" 
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !message.trim()} 
                            className="absolute right-1.5 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* FLOATING BUTTON (BOLA NAOMI) */}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group relative border-4 border-white dark:border-[#04121b] outline-none">
                    <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    <span className="absolute w-full h-full bg-indigo-500 rounded-full animate-ping -z-10 opacity-40"></span>
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-[#04121b] rounded-full"></span>
                </button>
            )}
        </div>
    );
}