import React, { useState, useRef, useEffect } from 'react';

export default function ProjectChatbot({ project, user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const chatEndRef = useRef(null);
    const storageKey = `naomi_chat_${project.id}_${user?.id}`;

    // 1. MEMORI PERMANEN
    const [chatHistory, setChatHistory] = useState(() => {
        const savedChat = localStorage.getItem(storageKey);
        if (savedChat) {
            return JSON.parse(savedChat);
        }
        
        // PERBAIKAN: Ambil nama depan dengan aman
        const firstName = user && user.name ? user.name.split(' ')[0] : 'Kakak';
        
        return [
            { role: 'assistant', content: `Halo Kak **${firstName}**! 👋 Aku Naomi, asisten proyek untuk **${project.name}**. Ada yang bisa aku bantu hari ini?` }
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
        if (!message.trim()) return;

        const userMsg = message.trim();
        const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
        
        setChatHistory(newHistory);
        setMessage('');
        setIsLoading(true);

        try {
            const apiHistory = newHistory.slice(1, -1).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await window.axios.post('/api/ai/project-chat', {
                message: userMsg,
                project_id: project.id,
                history: apiHistory
            });

            setChatHistory([...newHistory, { role: 'assistant', content: response.data.reply }]);
        } catch (error) {
            setChatHistory([...newHistory, { role: 'assistant', content: 'Maaf, terjadi kesalahan jaringan saat menghubungi server AI.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi reset ingatan chat
    const clearChat = () => {
        if(confirm('Hapus seluruh riwayat obrolan dengan Naomi?')) {
            const initialChat = [{ role: 'assistant', content: `Halo Kak **${user?.name?.split(' ')[0] || ''}**! Ada yang bisa saya bantu terkait proyek ini?` }];
            setChatHistory(initialChat);
            localStorage.setItem(storageKey, JSON.stringify(initialChat));
        }
    };

    const formatMessage = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[120]">
            <div className={`bg-white w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] rounded-[2rem] shadow-2xl border border-indigo-100 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 absolute bottom-0 right-0 pointer-events-none'}`}>
                
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner backdrop-blur-sm">🤖</div>
                        <div>
                            <h3 className="text-white font-extrabold text-sm">Naomi AI</h3>
                            <p className="text-indigo-100 text-[10px] font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={clearChat} title="Hapus Riwayat Chat" className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${chat.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'}`}>
                                <div dangerouslySetInnerHTML={{ __html: formatMessage(chat.content) }} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <form onSubmit={sendMessage} className="flex items-center gap-2 relative">
                        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tanya Naomi sesuatu..." disabled={isLoading} className="w-full bg-gray-50 border-none rounded-full px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all pr-12 disabled:opacity-50" />
                        <button type="submit" disabled={isLoading || !message.trim()} className="absolute right-1 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            </div>

            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group relative border-4 border-white">
                    <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    <span className="absolute w-full h-full bg-indigo-500 rounded-full animate-ping -z-10 opacity-40"></span>
                </button>
            )}
        </div>
    );
}