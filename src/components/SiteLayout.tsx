import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Menu, X } from 'lucide-react';
import { navLinks, site } from '../config/site';
import { RootMark, Wordmark } from './Logo';
import { buttonClass } from './ui';

function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between gap-6" aria-label="Main">
        <Wordmark />
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-forest-900' : 'text-muted hover:text-forest-900'}`
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    {l.label}
                    {isActive && <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded bg-forest-600" />}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/dashboard" className={buttonClass('primary', 'py-2')}>
            Explore the Dashboard
          </Link>
        </div>
        <button
          type="button"
          className="rounded-md p-2 text-forest-900 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="animate-fade-up border-t border-line bg-paper lg:hidden">
          <ul className="container-page flex flex-col py-3">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => `block rounded-md px-2 py-3 text-base font-medium ${isActive ? 'text-forest-900' : 'text-muted'}`}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/dashboard" className={buttonClass('primary', 'w-full')}>
                Explore the Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const cols = [
    { title: 'Product', links: [['/product', 'Product overview'], ['/how-it-works', 'How it works'], ['/dashboard', 'Interactive demo'], ['/pricing', 'Pricing']] },
    { title: 'Growers', links: [['/use-cases#hydroponic', 'Hydroponic farms'], ['/use-cases#greenhouse', 'Greenhouse operations'], ['/use-cases#nursery', 'Commercial nurseries']] },
    { title: 'Company', links: [['/about', 'About'], ['/contact', 'Contact']] },
  ];
  return (
    <footer className="bg-forest-900 text-root">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Wordmark inverted />
          <p className="mt-4 max-w-xs font-display text-lg italic text-sage-300">{site.tagline}</p>
          <a href={`mailto:${site.email}`} className="mt-6 inline-flex items-center gap-2 text-sm text-root/80 hover:text-white">
            <Mail className="h-4 w-4" aria-hidden="true" /> {site.email}
          </a>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
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
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-root/60 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <RootMark className="h-4 w-4" inverted /> © {new Date().getFullYear()} Rootsignal · {site.domain}
          </p>
          <p>Rootsignal organises observations and supports inspection decisions. It does not diagnose plant disease or prescribe treatment.</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
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
