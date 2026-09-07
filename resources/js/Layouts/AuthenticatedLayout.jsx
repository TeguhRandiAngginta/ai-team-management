import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ProjectChatbot from '@/Components/Kanban/ProjectChatbot';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, global_issues, global_issues_count, project } = usePage().props;
    const { user, notifications } = auth;
    const { url } = usePage();

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isIssueOpen, setIsIssueOpen] = useState(false);
    const notifRef = useRef(null);
    const issueRef = useRef(null);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
    const isActive = (path) => url.startsWith(path);
    
    // Fungsi lama untuk tombol centang manual
    const markAsRead = (id) => router.post(route('notifications.read', id), {}, { preserveScroll: true });

    // FUNGSI BARU: Klik notifikasi langsung pindah ke Kanban
    const handleNotificationClick = (notif) => {
        // Tandai sudah dibaca tanpa mereload halaman
        window.axios.post(route('notifications.read', notif.id)).catch(console.error);
        setIsNotifOpen(false);
        
        // Cek jika data workspace dan project tersedia, lalu pindah halaman
        if (notif.data.workspace_id && notif.data.project_id) {
            router.get(route('workspace.projects.tasks', {
                workspace: notif.data.workspace_id,
                project: notif.data.project_id
            }));
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
            if (issueRef.current && !issueRef.current.contains(event.target)) setIsIssueOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        { name: 'Analitik Dashboard', routeName: 'dashboard', icon: '📊' },
        { name: 'Main Workspace', routeName: 'workspace.index', icon: '🏢' }, 
        { name: 'Kalender Global', routeName: 'calendar.index', icon: '📅' }, 
        { name: 'AI Manager', routeName: 'ai.manager', icon: '🤖' },
    ];

    return (
        <div className="h-screen w-full transition-colors duration-500 ease-in-out bg-[#F4F7FF] dark:bg-[#04121b] text-gray-900 dark:text-white relative overflow-hidden flex">
            
            {/* BACKGROUND ESTETIK LIQUID GLASS */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 dark:bg-indigo-600/30 blur-[120px] rounded-full mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-500/20 dark:bg-purple-900/30 blur-[150px] rounded-full mix-blend-screen"></div>
            </div>

            {showingNavigationDropdown && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity" 
                    onClick={() => setShowingNavigationDropdown(false)}
                ></div>
            )}

            {/* SIDEBAR KIRI */}
            <nav className={`fixed inset-y-0 left-0 z-40 w-72 h-full shrink-0 transform transition-transform duration-300 ease-in-out lg:relative flex flex-col p-4 ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}`}>
                <div className="flex-1 flex flex-col bg-white/80 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] border border-white/40 dark:border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden relative group transition-all duration-500 h-full">
                    
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden rounded-[2rem]">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>

                    <div className="h-24 flex items-center px-6 border-b border-gray-200/50 dark:border-white/10 shrink-0 relative z-10">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 mr-3">
                            <ApplicationLogo className="w-6 h-6 fill-current" />
                        </div>
                        <div className="leading-tight">
                            <h1 className="text-sm font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-white dark:to-indigo-200">Office</h1>
                            <h1 className="text-sm font-extrabold tracking-tight text-gray-800 dark:text-white/90">Management</h1>
                        </div>
                    </div>

                    <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto hide-scrollbar relative z-10">
                        <div className="text-[10px] font-extrabold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4 px-4">Menu Utama</div>
                        {navItems.map((item) => (
                            <Link key={item.name} href={route(item.routeName)} onClick={() => setShowingNavigationDropdown(false)} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm outline-none group ${route().current(item.routeName) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'}`}>
                                <span className={`text-lg transition-transform ${route().current(item.routeName) ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                        {user.role === 'superadmin' && (
                            <>
                                <div className="text-[10px] font-extrabold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4 mt-6 px-4">Admin Area</div>
                                <Link href={route('activity-logs')} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group ${route().current('activity-logs') ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'}`}>
                                    <span className="text-lg">📜</span> Activity Log
                                </Link>
                                <Link href={route('superadmin.users')} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group ${route().current('superadmin.users') ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'}`}>
                                    <span className="text-lg">👥</span> Manajemen User
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200/50 dark:border-white/10 shrink-0 relative z-10">
                        <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-200 flex items-center justify-center font-bold shadow-sm shrink-0">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">{user.name}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate uppercase">{user.role || 'Karyawan'}</p>
                                </div>
                            </div>
                            <Link href={route('profile.edit')} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors">⚙️</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex flex-col h-full min-w-0 relative transition-all duration-500">
                
                {/* Header Atas */}
                <header className="shrink-0 pt-4 px-4 sm:px-6 lg:px-10 relative z-50">
                    <div className="flex items-center justify-between h-16">
                        
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowingNavigationDropdown(true)} className="lg:hidden p-2.5 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-sm text-gray-500 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <div className="hidden sm:block text-gray-900 dark:text-white">
                                {header}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2.5">
                            {/* SIRINE KENDALA */}
                            {user.role !== 'karyawan' && (
                                <div className="relative" ref={issueRef}>
                                    <button onClick={() => setIsIssueOpen(!isIssueOpen)} className="p-2.5 rounded-full bg-white dark:bg-white/10 shadow-sm text-gray-400 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors relative focus:outline-none">
                                        {global_issues_count > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-[#04121b] animate-pulse">{global_issues_count}</span>}
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </button>

                                    {isIssueOpen && (
                                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0a192f] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-fadeIn">
                                            <div className="px-4 py-3 font-extrabold text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">🚨 Pusat Kendala Proyek</div>
                                            {global_issues_count > 0 ? (
                                                <><div className="max-h-72 overflow-y-auto p-2">
                                                    {global_issues?.map(issue => (
                                                        <div key={issue.id} className="block px-3 py-3 border-b border-gray-50 dark:border-white/5 hover:bg-red-50/50 dark:hover:bg-red-900/10 rounded-xl transition-colors mb-1 group"><h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400">{issue.title}</h4><p className="text-xs text-red-600 dark:text-red-400 mt-1 line-clamp-2">"{issue.feedback || 'Tidak ada alasan'}"</p></div>
                                                    ))}
                                                </div>
                                                <div className="p-3 border-t border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-[#0a192f]"><Link href={route('issues.index')} className="block w-full py-2 text-xs font-extrabold text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-white/5 rounded-lg transition-colors">Lihat Semua ({global_issues_count}) Kendala &rarr;</Link></div></>
                                            ) : (<div className="px-4 py-8 text-xs font-medium text-center text-gray-400 dark:text-gray-500">Semua proyek berjalan lancar! 🎉</div>)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* LONCENG NOTIFIKASI */}
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2.5 rounded-full bg-white dark:bg-white/10 shadow-sm text-gray-400 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative focus:outline-none">
                                    {notifications?.length > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-indigo-500 rounded-full border-2 border-white dark:border-[#04121b] animate-pulse">{notifications.length}</span>}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </button>
                                {isNotifOpen && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0a192f] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-50">
                                        <div className="px-4 py-3 font-extrabold text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">Notifikasi Terbaru</div>
                                        {notifications?.length > 0 ? (
                                            <div className="max-h-72 overflow-y-auto">
                                                {/* INI BAGIAN YANG DIUBAH AGAR BISA DIKLIK KESELURUHANNYA */}
                                                {notifications.map(notif => (
                                                    <div 
                                                        key={notif.id} 
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className="block px-4 py-4 border-b border-gray-50 dark:border-white/5 hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 shadow-sm ${notif.data.type === 'assigned' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900 dark:text-gray-200 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                    {notif.data.title || 'Pemberitahuan'}
                                                                </p>
                                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                                    {notif.data.message}
                                                                </p>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        Lihat Tugas &rarr;
                                                                    </p>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} 
                                                                        className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
                                                                    >
                                                                        Tandai dibaca
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (<div className="px-4 py-8 text-xs font-medium text-center text-gray-400 dark:text-gray-500">Tidak ada notifikasi baru.</div>)}
                                    </div>
                                )}
                            </div>

                            {/* TEMA & LOGOUT */}
                            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-white/10">
                                <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 transition-all text-gray-600 dark:text-white shadow-sm outline-none">
                                    {theme === 'dark' ? '☀️' : '🌙'}
                                </button>
                                <Link method="post" href={route('logout')} as="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all font-bold shadow-sm outline-none">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-24 relative hide-scrollbar">
                    {children}
                </div>
                
            </main>

            <ProjectChatbot project={project || { id: 0, name: 'Kantor Utama' }} user={user} />
        </div>
    );
}