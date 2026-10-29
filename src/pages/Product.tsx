import {
  BarChart3,
  Ban,
  ClipboardCheck,
  Database,
  Gauge,
  GitCompareArrows,
  Images,
  Layers3,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { RootImage } from '../components/RootImage';
import { SectionHeading } from '../components/ui';
import { createSampleData } from '../data/greenhouse';
import { latestPair } from '../lib/analysis';
import { usePageMeta } from '../lib/usePageMeta';
import { FinalCta, PageHero } from './shared';

const sample = createSampleData();

const features = [
  { Icon: Layers3, title: 'Zone records', body: 'Model channels, ponds, rows and benches as zones with crop, cultivar, system, area and an assigned grower.' },
  { Icon: Images, title: 'Root image history', body: 'Every image is stored with its capture date, method and author, building a visual timeline for each zone.' },
  { Icon: GitCompareArrows, title: 'Previous-versus-current comparison', body: 'A comparison view outlines regions where visible root material or tone differs from the last observation.' },
  { Icon: Gauge, title: 'Measurement context', body: 'pH, EC (mS/cm), solution temperature (°C), irrigation volume (L/day) and dissolved oxygen (mg/L) shown with units, and only when supplied.' },
  { Icon: Database, title: 'Data-quality indicators', body: 'Missing measurements, outdated readings, poor-quality photographs and incomplete records are flagged clearly.' },
  { Icon: ClipboardCheck, title: 'Inspection workflow', body: 'Open a flagged observation, review evidence, add notes, assign an inspector, record a finding and close it out.' },
  { Icon: BarChart3, title: 'Reports and exports', body: 'Inspection throughput, open items and data-quality summaries — exportable as CSV for your own records.' },
  { Icon: Users, title: 'Team ownership', body: 'Growers own zones, inspectors own inspections, and everyone can see who checked what and when.' },
];

export default function Product() {
  usePageMeta('Product', 'Zone records, root image history, visual comparison, measurement context, data-quality indicators and inspection workflows for commercial growers.');
  const zone = sample.zones[5];
  const { current, previous } = latestPair(sample, zone.id);
  return (
    <>
      <PageHero eyebrow="Product" title="A working record of every root zone in your operation.">
        Rootsignal is an organised, comparable history of what your team sees below the surface — and a queue for deciding where to look next.
      </PageHero>

      <section className="py-20">
        <div className="container-page">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ Icon, title, body }) => (
              <li key={title} className="card p-6">
                <Icon className="h-5 w-5 text-forest-600" aria-hidden="true" />
                <h2 className="mt-4 text-lg leading-snug text-forest-900">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-line bg-paper-2/60 py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Assisted summaries" title="Descriptions of what looks different — not diagnoses.">
              For each new observation, Rootsignal produces a short plain-language summary of visible differences from the previous image and lists the readings recorded over the same period. It is deliberately careful about what it does not know.
            </SectionHeading>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                'Describes apparent root coverage and tone versus the previous image.',
                'Lists supplied readings for context, without inferring cause.',
                'Flags when photo quality is too low for a reliable comparison.',
                'Recommends gathering more evidence through inspection when differences are notable.',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  <span className="text-ink">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          {current && previous && (
            <div className="card p-5">
              <div className="grid grid-cols-2 gap-3">
                <figure>
                  <div className="overflow-hidden rounded-lg">
                    <RootImage params={previous.image} medium={zone.medium} label="Previous observation, spinach zone GN-C2" />
                  </div>
                  <figcaption className="mt-1.5 text-xs text-muted">Previous</figcaption>
                </figure>
                <figure>
                  <div className="overflow-hidden rounded-lg">
                    <RootImage params={current.image} medium={zone.medium} compareTo={previous.image} label="Current observation, spinach zone GN-C2, differences outlined" />
                  </div>
                  <figcaption className="mt-1.5 text-xs text-muted">Current · differences outlined</figcaption>
                </figure>
              </div>
              <div className="mt-4 rounded-lg bg-paper-2 p-4 text-sm">
                <p className="font-medium text-forest-900">“Some visible differences from the previous observation. Supplied readings are listed for context. Consider including this zone in the next inspection round.”</p>
                <p className="mt-2 text-xs text-subtle">Example output · simulated in this demo</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div className="card p-7">
            <h2 className="text-2xl text-forest-900">What Rootsignal does</h2>
            <ul className="mt-5 space-y-3 text-sm text-ink">
              {['Organises root images, readings and notes by zone and date', 'Highlights visible change between observations', 'Surfaces gaps in your evidence', 'Helps teams prioritise and record inspections'].map((t) => (
                <li key={t} className="flex gap-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-7">
            <h2 className="text-2xl text-forest-900">What it does not do</h2>
            <ul className="mt-5 space-y-3 text-sm text-ink">
              {['Diagnose plant disease or pests from images', 'Determine nutrient deficiencies', 'Prescribe treatments or dosing changes', 'Replace laboratory analysis or an agronomist’s judgement'].map((t) => (
                <li key={t} className="flex gap-3">
                  <Ban className="h-4 w-4 shrink-0 text-rust-500" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
