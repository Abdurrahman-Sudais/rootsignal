import { ArrowRight, ClipboardCheck, GitCompareArrows, Layers3, Upload } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from '../components/ui';

export const steps = [
  {
    n: '01',
    title: 'Organise crops and growing zones',
    body: 'Map your operation into zones — channels, raft ponds, rows, benches — with crop, system, area and an assigned grower.',
    Icon: Layers3,
  },
  {
    n: '02',
    title: 'Upload root observations and measurements',
    body: 'Add root images with capture method and notes, alongside the irrigation readings your team already records: pH, EC, solution temperature and volume.',
    Icon: Upload,
  },
  {
    n: '03',
    title: 'Compare observations over time',
    body: 'Each new image is placed next to the previous one. Rootsignal outlines visible differences and shows the readings recorded over the same period.',
    Icon: GitCompareArrows,
  },
  {
    n: '04',
    title: 'Prioritise inspections and record actions',
    body: 'Flagged zones move into an inspection queue. Assign an inspector, gather evidence, record the finding and close the loop.',
    Icon: ClipboardCheck,
  },
];

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="botanical-grid border-b border-line">
      <div className="container-page py-16 sm:py-20">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="max-w-3xl text-4xl leading-[1.08] text-forest-900 sm:text-5xl">{title}</h1>
        {children && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{children}</p>}
      </div>
    </section>
  );
}

export function FinalCta({ title = 'Bring your growing-zone observations into focus.' }: { title?: string }) {
  return (
    <section className="bg-forest-800 text-root">
      <div className="container-page relative overflow-hidden py-20">
        <svg className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 text-forest-700 sm:h-80 sm:w-80" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M100 0v70M100 70c-10 30-40 50-60 110M100 70c4 40 20 70 50 120M100 90c-20 10-50 10-80 30M100 110c20 0 50 10 90 0M70 130c-10 10-14 30-12 60" />
        </svg>
        <div className="relative max-w-2xl">
          <h2 className="text-3xl leading-tight sm:text-5xl">{title}</h2>
          <p className="mt-5 text-lg text-root/75">Explore the interactive demonstration with sample data from a fictional greenhouse, or talk to us about your operation.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/dashboard" variant="light">
              Explore the Dashboard <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink to="/contact" variant="secondary" className="border-root/30 text-root hover:bg-white/10">
              Talk to us
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
