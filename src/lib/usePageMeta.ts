import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { site } from '../config/site';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Sets the document title, description, canonical URL and Open Graph tags per route. */
export function usePageMeta(title: string, description: string = site.description) {
  const { pathname } = useLocation();
  useEffect(() => {
    const full = title ? `${title} · ${site.name}` : `${site.name} — ${site.tagline.replace(/\.$/, '')}`;
    document.title = full;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', `${site.url}${pathname}`);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.setAttribute('href', `${site.url}${pathname}`);
  }, [title, description, pathname]);
}
