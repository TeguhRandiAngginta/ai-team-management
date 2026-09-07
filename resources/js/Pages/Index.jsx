import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AIManagerIndex() {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-extrabold text-gray-800 dark:text-white/90 leading-tight">AI Manager (Naomi)</h2>}
        >
            <Head title="AI Manager" />
            
            <div className="max-w-7xl mx-auto mt-4 h-[70vh]">
                <div className="relative w-full h-full p-8 sm:p-10 bg-white/60 dark:bg-white/10 backdrop-blur-[26px] saturate-[118%] border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center group overflow-hidden">
                    
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 overflow-hidden rounded-[2.5rem]">
                        <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-[sheen_1.5s_ease-in-out]"></div>
                    </div>

                    <div className="text-6xl mb-6 relative">
                        🤖
                        <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#04121b] rounded-full animate-pulse"></span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-white dark:to-indigo-200 mb-2 text-center">
                        Konfigurasi Kecerdasan Buatan
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 font-medium text-center max-w-md">
                        Di sinilah Anda dapat mengatur batasan, gaya bahasa, serta memberikan dokumen referensi khusus (*knowledge base*) kepada Naomi AI.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}