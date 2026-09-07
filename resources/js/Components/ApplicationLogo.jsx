export default function ApplicationLogo(props) {
    return (
        <svg {...props} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10L85 30V70L50 90L15 70V30L50 10Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M50 10V50M85 30L50 50M15 30L50 50M50 90V50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="50" cy="50" r="12" fill="currentColor"/>
        </svg>
    );
}