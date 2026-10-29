import { CheckCircle2 } from 'lucide-react';
import { UseCaseScene } from '../components/Illustrations';
import { usePageMeta } from '../lib/usePageMeta';
import { FinalCta, PageHero } from './shared';

const cases = [
  {
    id: 'hydroponic',
    kind: 'hydroponic' as const,
    title: 'Hydroponic farms',
    lead: 'NFT channels, deep-water rafts and vertical racks — where roots sit in shared solution and a change can travel along a channel.',
    scenario:
      'A grower lifts plant 40 on channel block 1 every week. This week the root mat looks thinner. Rootsignal places the image next to last week’s, outlines the regions that differ, and shows that solution temperature readings rose over the same period. The zone is added to the inspection queue for the crop scientist to check other channels.',
    points: ['Weekly lift photos linked to channel and position', 'Reservoir pH, EC, temperature and DO in one view', 'Queue for checking neighbouring channels'],
  },
  {
    id: 'greenhouse',
    kind: 'greenhouse' as const,
    title: 'Greenhouse operations',
    lead: 'High-wire tomato, cucumber and pepper on rockwool or coco, with drip irrigation across bays and many rows.',
    scenario:
      'The fruiting-crop grower records slab cut-backs on a rota. Drain and feed readings arrive as a weekly CSV export. Rootsignal marks the zone as having outdated readings until the next import, so a comparison isn’t made against stale numbers.',
    points: ['Slab and gutter observations by row', 'CSV import of feed and drain readings', 'Outdated-reading flags with a configurable threshold'],
  },
  {
    id: 'nursery',
    kind: 'nursery' as const,
    title: 'Commercial nurseries',
    lead: 'Propagation and young-plant production with large batches, frequent moves and short crop cycles.',
    scenario:
      'Inspectors pull sample plugs from each bench and photograph root development. Incomplete records — no capture method, no notes — are highlighted, so the team knows which batches still need a proper observation before dispatch.',
    points: ['Bench and batch-level zones', 'Incomplete-record indicators', 'Inspection history for customer and audit questions'],
  },
];

export default function UseCases() {
  usePageMeta('Grower Use Cases', 'How hydroponic farms, greenhouse operations and commercial nurseries use Rootsignal to organise root observations and prioritise inspections.');
  return (
    <>
      <PageHero eyebrow="Grower use cases" title="Built for the way commercial growers check what’s below.">
        Different systems, same question: which zones need a closer look this week?
      </PageHero>
      <div className="py-12">
        {cases.map((c, i) => (
          <section key={c.id} id={c.id} className="scroll-mt-20 py-12">
            <div className={`container-page grid items-center gap-10 lg:grid-cols-2 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <div className="card overflow-hidden">
                <UseCaseScene kind={c.kind} className="h-auto w-full" />
              </div>
              <div>
                <p className="eyebrow mb-3">0{i + 1}</p>
                <h2 className="text-3xl text-forest-900 sm:text-4xl">{c.title}</h2>
                <p className="mt-4 text-lg text-muted">{c.lead}</p>
                <div className="mt-6 rounded-xl border-l-2 border-clay-500 bg-paper-2 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Example scenario</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{c.scenario}</p>
                </div>
                <ul className="mt-6 space-y-2 text-sm">
                  {c.points.map((p) => (
                    <li key={p} className="flex gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>
      <FinalCta />
    </>
  );
}
