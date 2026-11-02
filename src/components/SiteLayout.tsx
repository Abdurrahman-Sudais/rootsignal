import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Menu, X } from 'lucide-react';
import { FOUNDERS, footerNav, navLinks, site } from '../config/site';
import { useRevealOnScroll } from '../lib/motion';
import { RootMark, Wordmark } from './Logo';
import { buttonClass } from './ui';

function navClass(to: string, isActive: boolean, mobile = false) {
  const active = isActive && !to.includes('#');
  if (mobile) return `block rounded-md px-2 py-3 text-base font-medium ${active ? 'text-forest-900' : 'text-muted'}`;
  return `rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${active ? 'text-forest-900' : 'text-muted hover:text-forest-900'}`;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur transition-[background-color,box-shadow,border-color] duration-300 ${scrolled || open ? 'border-line/80 bg-paper/90 shadow-[0_8px_30px_-20px_rgba(16,41,28,0.35)]' : 'border-transparent bg-paper/60'}`}>
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Wordmark />
        <ul className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end className={({ isActive }) => navClass(l.to, isActive)}>
                {({ isActive }) => (
                  <span className="relative">
                    {l.label}
                    {isActive && !l.to.includes('#') && <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded bg-forest-600" />}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 xl:flex">
          <Link to="/dashboard" className={buttonClass('ghost', 'py-2')}>
            Live demo
          </Link>
          <Link to="/contact?type=demo" className={buttonClass('primary', 'py-2')}>
            Request early access
          </Link>
        </div>
        <button
          type="button"
          className="rounded-md p-2 text-forest-900 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="animate-fade-up max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-paper xl:hidden">
          <ul className="container-page flex flex-col py-3">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end className={({ isActive }) => navClass(l.to, isActive, true)} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="grid gap-2 pt-3 sm:grid-cols-2">
              <Link to="/contact?type=demo" className={buttonClass('primary', 'w-full')}>
                Request early access <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className={buttonClass('secondary', 'w-full')}>
                Explore the live demo
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-forest-900 text-root">
      <div className="container-page grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <Wordmark inverted />
          <p className="mt-4 max-w-xs font-display text-lg italic text-sage-300">{site.tagline}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-root/80">
            <span className="live-dot !bg-sage-300" aria-hidden="true" /> Early access open
          </p>
          <a href={`mailto:${site.email}`} className="mt-5 flex items-center gap-2 break-all text-sm text-root/80 hover:text-white">
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {site.email}
          </a>
        </div>
        {footerNav.map((c) => (
          <div key={c.title} className="min-w-0">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-sage-300">{c.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-root/80 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-root/60 lg:flex-row lg:items-center lg:justify-between">
          <p className="flex flex-wrap items-center gap-2">
            <RootMark className="h-4 w-4" inverted /> © {new Date().getFullYear()} Rootsignal · {site.domain} · Founded by{' '}
            {FOUNDERS.map((f, i) => (
              <span key={f.name}>
                {i > 0 && ' & '}
                <Link to="/about#team" className="text-root/80 hover:text-white">
                  {f.name}
                </Link>{' '}
                ({f.role})
              </span>
            ))}
          </p>
          <p className="max-w-xl">Rootsignal organises observations and supports inspection decisions. It does not diagnose plant disease or prescribe treatment.</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  const { pathname, hash } = useLocation();
  useRevealOnScroll(pathname);
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Lazy routes and reveal content may not exist yet: retry until the anchor is mounted, then settle again.
    let tries = 0;
    let settle = 0;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 40) {
        window.clearInterval(timer);
        if (el) {
          el.scrollIntoView({ block: 'start' });
          settle = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 450);
        }
      }
    }, 50);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(settle);
    };
  }, [pathname, hash]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-forest-800 focus:px-3 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
