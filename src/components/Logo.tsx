import { Link } from 'react-router-dom';

export function RootMark({ className = 'h-7 w-7', inverted = false }: { className?: string; inverted?: boolean }) {
  const bg = inverted ? '#e9e3d2' : '#173a28';
  const fg = inverted ? '#173a28' : '#e9e3d2';
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill={bg} />
      <g fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round">
        <path d="M16 5v7" />
        <path d="M7 12h18" />
        <path d="M16 12v13" />
        <path d="M16 16c-3 1-5 3-6 7" />
        <path d="M16 18c3 1 5 3 6 6" />
      </g>
      <circle cx="22" cy="24" r="2.4" fill="#c9a24a" />
    </svg>
  );
}

export function Wordmark({ inverted = false, to = '/' }: { inverted?: boolean; to?: string }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5" aria-label="Rootsignal home">
      <RootMark inverted={inverted} />
      <span
        className={`font-display text-[1.35rem] font-medium leading-none tracking-tight ${inverted ? 'text-root' : 'text-forest-900'}`}
      >
        root<span className={inverted ? 'text-sage-300' : 'text-forest-600'}>signal</span>
      </span>
    </Link>
  );
}
