import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CircleDot, Clock, FlaskConical, Info, X } from 'lucide-react';
import type { Priority } from '../data/types';
import type { ZoneInspectionStatus } from '../lib/analysis';

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'light';
const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-forest-800 text-paper hover:bg-forest-700',
  secondary: 'border border-forest-800/25 bg-transparent text-forest-900 hover:bg-forest-800/5',
  ghost: 'text-forest-800 hover:bg-forest-800/5',
  light: 'bg-root text-forest-900 hover:bg-white',
};

export function buttonClass(variant: BtnVariant = 'primary', extra = '') {
  return `${btnBase} ${btnVariants[variant]} ${extra}`;
}

export function ButtonLink({ to, variant = 'primary', children, className = '' }: { to: string; variant?: BtnVariant; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}

export function SampleBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-amber-600 ${className}`}>
      <FlaskConical className="h-3 w-3" aria-hidden="true" />
      Sample data
    </span>
  );
}

export const priorityStyles: Record<Priority, string> = {
  high: 'bg-rust-100 text-rust-600 border-rust-500/30',
  medium: 'bg-amber-100 text-amber-600 border-amber-500/30',
  low: 'bg-sage-100 text-forest-700 border-sage-500/40',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const Icon = priority === 'high' ? AlertTriangle : priority === 'medium' ? CircleDot : CheckCircle2;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${priorityStyles[priority]}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {priority}
    </span>
  );
}

const statusStyle: Record<ZoneInspectionStatus, { cls: string; label: string; Icon: typeof Info }> = {
  flagged: { cls: 'text-rust-600', label: 'Flagged', Icon: AlertTriangle },
  assigned: { cls: 'text-amber-600', label: 'Assigned', Icon: Clock },
  in_progress: { cls: 'text-forest-600', label: 'In progress', Icon: CircleDot },
  clear: { cls: 'text-muted', label: 'No open inspection', Icon: CheckCircle2 },
};

export function InspectionStatusBadge({ status }: { status: ZoneInspectionStatus }) {
  const s = statusStyle[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.cls}`}>
      <s.Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {s.label}
    </span>
  );
}

/** Accessible tooltip: shows on hover and keyboard focus, dismissible with Escape. */
export function Tooltip({ content, children, className = '' }: { content: ReactNode; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[16rem] -translate-x-1/2 rounded-md bg-forest-950 px-2.5 py-1.5 text-xs font-normal leading-snug text-root shadow-lg"
        >
          {content}
        </span>
      )}
    </span>
  );
}

export function InfoTip({ content, label = 'More information' }: { content: ReactNode; label?: string }) {
  return (
    <Tooltip content={content}>
      <button type="button" className="inline-flex text-subtle hover:text-forest-700" aria-label={label}>
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </Tooltip>
  );
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-12 text-center">
      {icon && <div className="mb-3 text-sage-600">{icon}</div>}
      <p className="font-display text-lg text-forest-900">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Modal dialog with focus trap, Escape to close and focus restore. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = () =>
      Array.from(node?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') ?? []);
    (focusables()[0] ?? node)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab') {
        const els = focusables();
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
      else document.querySelector<HTMLElement>('#dash-content, #main')?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  const width = size === 'md' ? 'max-w-lg' : size === 'lg' ? 'max-w-3xl' : 'max-w-5xl';
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-forest-950/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`animate-fade-up flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-t-2xl bg-paper shadow-2xl sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-xl text-forest-900">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted hover:bg-paper-2 hover:text-ink" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs font-medium text-rust-600" role="alert">
      {message}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, children, center = false }: { eyebrow?: string; title: ReactNode; children?: ReactNode; center?: boolean }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl leading-tight text-forest-900 sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{children}</p>}
    </div>
  );
}

export function Avatar({ initials, className = '' }: { initials: string; className?: string }) {
  return (
    <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-200 text-[11px] font-semibold text-forest-800 ${className}`} aria-hidden="true">
      {initials}
    </span>
  );
}
