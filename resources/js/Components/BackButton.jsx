import { Link } from '@inertiajs/react';

export default function BackButton({ href, children, className = '' }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors group mb-6 ${className}`}
        >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-all shadow-sm">
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </div>
            {children}
        </Link>
    );
}