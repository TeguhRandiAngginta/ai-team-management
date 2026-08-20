import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

export default function Authenticated({ header, children }) {
    const { user, notifications } = usePage().props.auth;
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // State khusus untuk Dropdown Notifikasi
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);

    // Fungsi kecil untuk mengecek link aktif
    const isActive = (path) => url.startsWith(path);
    
    const markAsRead = (id) => {
        router.post(route('notifications.read', id), {}, { preserveScroll: true });
    };

    // Menutup dropdown notifikasi jika user klik di luar area
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-[#F4F7FF] flex font-sans text-gray-900">
            
            {/* Mobile Overlay Background */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col rounded-r-3xl my-4 ml-4 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}>
                
                {/* Logo Area */}
                <div className="h-24 flex items-center px-8">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg shadow-indigo-200">
                        P
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-gray-800">Persevera</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-2">
                        Menu Utama
                    </div>
                    
                    <Link 
                        href={route('dashboard')} 
                        className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive('/dashboard') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}
                    >
                        <svg className={`w-5 h-5 mr-4 transition-colors ${isActive('/dashboard') ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    {/* MENU INI SEKARANG HANYA MUNCUL JIKA USER ADALAH SUPERADMIN */}
                    {user.role === 'superadmin' && (
                        <>
                            <Link 
                                href={route('activity-logs')} 
                                className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive('/activity-logs') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}
                            >
                                <svg className={`w-5 h-5 mr-4 transition-colors ${isActive('/activity-logs') ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Activity Log</span>
                            </Link>

                            <Link 
                                href={route('superadmin.users')} 
                                className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive('/superadmin/users') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}
                            >
                                <svg className={`w-5 h-5 mr-4 transition-colors ${isActive('/superadmin/users') ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="font-medium">Manajemen User</span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* Profile Footer */}
                <div className="p-4 border-t border-gray-50 mt-auto">
                    <Link 
                        href={route('profile.edit')} 
                        className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive('/profile') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}
                    >
                        <svg className={`w-5 h-5 mr-4 transition-colors ${isActive('/profile') ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Settings</span>
                    </Link>
                    
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button"
                        className="mt-2 w-full flex items-center p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium">Log Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                
                {/* Header (Top Bar) */}
                <header className="bg-transparent sticky top-0 z-30 pt-4 px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center justify-between h-16">
                        {/* Hamburger Menu for Mobile */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="p-2 rounded-xl bg-white shadow-sm text-gray-500 hover:text-indigo-600 focus:outline-none lg:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        {/* Page Header Content */}
                        <div className="flex-1 flex justify-between items-center ml-4 lg:ml-0">
                            {header}
                        </div>

                        {/* Top Right Action Icons */}
                        <div className="hidden md:flex items-center space-x-4">
                            
                            {/* --- INTEGRASI DROPDOWN NOTIFIKASI --- */}
                            <div className="relative" ref={notifRef}>
                                <button 
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="p-2.5 rounded-full bg-white shadow-sm text-gray-400 hover:text-indigo-600 transition-colors relative focus:outline-none"
                                >
                                    {/* Jika ada notif, tampilkan badge merah bergetar */}
                                    {notifications?.length > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white animate-pulse">
                                            {notifications.length}
                                        </span>
                                    )}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </button>

                                {/* Panel Dropdown Muncul Saat Lonceng Diklik */}
                                {isNotifOpen && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                        <div className="px-4 py-3 font-extrabold text-sm text-gray-800 bg-gray-50 border-b border-gray-100">
                                            Notifikasi Terbaru
                                        </div>
                                        {notifications?.length > 0 ? (
                                            <div className="max-h-72 overflow-y-auto">
                                                {notifications.map(notif => (
                                                    <div key={notif.id} className="block px-4 py-4 border-b border-gray-50 hover:bg-indigo-50/50 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.data.type === 'assigned' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900 leading-tight">{notif.data.title || 'Pemberitahuan'}</p>
                                                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{notif.data.message}</p>
                                                                <button 
                                                                    onClick={(e) => { e.preventDefault(); markAsRead(notif.id); }} 
                                                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-2 hover:underline focus:outline-none"
                                                                >
                                                                    Tandai sudah dibaca ✓
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-4 py-8 text-xs font-medium text-center text-gray-400">
                                                Tidak ada notifikasi baru.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* -------------------------------------- */}

                        </div>
                    </div>
                </header>

                {/* Page Content Body */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-20">
                    {children}
                </main>
            </div>
        </div>
    );
}