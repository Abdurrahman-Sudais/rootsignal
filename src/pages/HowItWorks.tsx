import { Cpu, FlaskConical, PlugZap } from 'lucide-react';
import { SectionHeading } from '../components/ui';
import { usePageMeta } from '../lib/usePageMeta';
import { FinalCta, PageHero, steps } from './shared';

const details: Record<string, string[]> = {
  '01': ['Create zones for each channel block, raft pond, row group or bench.', 'Record crop, cultivar, growing system, area and plant count.', 'Assign a responsible grower to every zone.'],
  '02': ['Capture root images with a consistent method (channel lift, slab cut-back, gutter window).', 'Log pH, EC, solution temperature, volume and dissolved oxygen where you measure them.', 'Import readings by CSV or enter them by hand — no sensor required to start.'],
  '03': ['New images are paired with the previous observation of the same zone.', 'Visible differences in root coverage and tone are outlined.', 'Readings from the same period are shown alongside, clearly labelled with units.'],
  '04': ['Zones with notable visible change or missing evidence move into the inspection queue.', 'Assign an inspector, add notes and review the evidence in one place.', 'Record the finding and mark the inspection complete, with full history retained.'],
};

export default function HowItWorks() {
  usePageMeta('How It Works', 'How Rootsignal organises growing zones, root observations and irrigation readings, compares observations over time, and supports inspection workflows.');
  return (
    <>
      <PageHero eyebrow="How it works" title="From scattered observations to a clear inspection list.">
        Rootsignal fits around the checks your team already does. It adds structure, comparison and follow-through.
      </PageHero>
      <section className="py-20">
        <div className="container-page">
          <ol className="relative space-y-6 before:absolute before:left-[1.4rem] before:top-2 before:bottom-2 before:w-px before:bg-line sm:before:left-[1.65rem]">
            {steps.map(({ n, title, body, Icon }) => (
              <li key={n} className="relative grid gap-4 pl-14 sm:pl-16 lg:grid-cols-[1fr_1fr] lg:gap-10">
                <span className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-forest-700 sm:h-[3.3rem] sm:w-[3.3rem]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-xs text-clay-500">Step {n}</p>
                  <h2 className="mt-1 text-2xl text-forest-900 sm:text-3xl">{title}</h2>
                  <p className="mt-3 text-muted">{body}</p>
                </div>
                <ul className="card space-y-3 p-5 text-sm">
                  {details[n].map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-500" /> {t}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="border-t border-line bg-paper-2/60 py-20">
        <div className="container-page">
          <SectionHeading eyebrow="In this demonstration" title="What’s simulated, and what would need integration.">
            The interactive dashboard runs entirely in your browser with sample data. Here is how it maps to a production deployment.
          </SectionHeading>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { Icon: FlaskConical, title: 'Simulated here', items: ['Sample greenhouse, zones and readings', 'Procedurally generated root images', 'Change outlines and summaries computed from sample image parameters', 'State stored in your browser only'] },
              { Icon: Cpu, title: 'Needs a real image model', items: ['Pixel-level comparison of uploaded photos', 'Image quality scoring (focus, exposure, glare)', 'Registration of images taken from slightly different angles'] },
              { Icon: PlugZap, title: 'Needs integrations', items: ['Sensor or climate-computer feeds for live readings', 'Fertigation controller exports', 'User accounts, permissions and secure storage'] },
            ].map(({ Icon, title, items }) => (
              <div key={title} className="card p-6">
                <Icon className="h-5 w-5 text-forest-600" aria-hidden="true" />
                <h3 className="mt-3 text-lg text-forest-900">{title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {items.map((i) => (
                    <li key={i}>— {i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
