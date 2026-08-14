export default function ActionBtn({ onClick, type = 'button', children, className = '', disabled }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 active:scale-95 ${className}`}
        >
            {children}
        </button>
    );
}