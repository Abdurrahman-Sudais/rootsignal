import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FolderOpen,
  History,
  ImageOff,
  NotebookPen,
  Ruler,
  ScanSearch,
} from 'lucide-react';
import { DashboardPreview } from '../components/DashboardPreview';
import { ComparisonSlider } from '../components/ComparisonSlider';
import { ChannelCrossSection, UseCaseScene } from '../components/Illustrations';
import { RootImage } from '../components/RootImage';
import { ButtonLink, SampleBadge, SectionHeading } from '../components/ui';
import { createSampleData } from '../data/greenhouse';
import { allQualityIssues, formatMeasurement, latestPair, measurementDefs, SUMMARY_DISCLAIMER, summariseObservation, zoneObservations, zoneReadings } from '../lib/analysis';
import { daysAgo, formatShort } from '../lib/dates';
import { usePageMeta } from '../lib/usePageMeta';
import { FinalCta, steps } from './shared';

const sample = createSampleData();

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="botanical-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
      <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div className="animate-fade-up">
          <p className="eyebrow mb-5">Root-zone monitoring &amp; inspection records</p>
          <h1 className="text-[2.6rem] leading-[1.04] text-forest-900 sm:text-6xl">Know which growing zones need a closer look.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Bring root observations, irrigation readings, and grower notes together. Rootsignal helps your team spot changes over time and prioritise inspections across your operation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/dashboard">
              Explore the Dashboard <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink to="/how-it-works" variant="secondary">
              See How It Works
            </ButtonLink>
          </div>
          <p className="mt-8 font-display text-base italic text-forest-600">See the changes happening below.</p>
        </div>
        <div className="animate-fade-up [animation-delay:120ms]">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const silos = [
    { Icon: Camera, title: 'Root photos', where: 'Phones and shared drives', issue: 'No consistent link to zone, date, or capture method.' },
    { Icon: FileSpreadsheet, title: 'Irrigation readings', where: 'Spreadsheets and climate exports', issue: 'Recorded on a different schedule to root checks.' },
    { Icon: NotebookPen, title: 'Grower notes', where: 'Notebooks and chat threads', issue: 'Context that rarely travels with the evidence.' },
    { Icon: ClipboardList, title: 'Inspection records', where: 'Paper forms and memory', issue: 'Hard to see what was checked, by whom, and when.' },
  ];
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading eyebrow="A · The hidden root-zone problem" title="The root zone changes out of sight — and the evidence is scattered.">
            Canopy issues are easy to notice. Changes below the surface usually aren’t. When root photos, irrigation readings and notes live in separate places, comparing this week with last week takes longer than the inspection itself.
          </SectionHeading>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {silos.map(({ Icon, title, where, issue }) => (
              <li key={title} className="card p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-clay-500" aria-hidden="true" />
                  <p className="text-sm font-semibold text-forest-900">{title}</p>
                </div>
                <p className="mt-1 font-mono text-[11px] text-subtle">{where}</p>
                <p className="mt-2 text-sm text-muted">{issue}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card overflow-hidden p-4 sm:p-6">
          <ChannelCrossSection className="h-auto w-full" />
          <p className="mt-3 text-sm text-muted">In an NFT channel, a change in one plant’s roots may only show up weeks later in the canopy. Rootsignal keeps the image and the readings for that zone side by side.</p>
        </div>
      </div>
    </section>
  );
}

function ClearerPicture() {
  const zone = sample.zones[0];
  const obs = zoneObservations(sample, zone.id);
  const readings = zoneReadings(sample, zone.id);
  const last = readings[readings.length - 1];
  return (
    <section className="border-y border-line bg-paper-2/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="B · A clearer picture of every zone" title="One record per zone: images, measurements, inspections, history.">
          Every observation lands in the right zone with its date, method and author. Measurements sit next to it with their units. Past inspections are one click away.
        </SectionHeading>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-medium text-forest-900">{zone.id} · {zone.crop} ({zone.cultivar})</p>
                <p className="text-xs text-muted">{zone.system} · {zone.areaM2} m²</p>
              </div>
              <SampleBadge />
            </div>
            <p className="mt-5 mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-subtle">
              <History className="h-3.5 w-3.5" aria-hidden="true" /> Root image history
            </p>
            <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {obs.map((o) => (
                <li key={o.id}>
                  <div className="overflow-hidden rounded-md">
                    <RootImage params={o.image} medium={zone.medium} label={`Root observation ${formatShort(o.date)}`} />
                  </div>
                  <p className="tnum mt-1 text-center text-[11px] text-muted">{formatShort(o.date)}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="card p-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-subtle">
              <Ruler className="h-3.5 w-3.5" aria-hidden="true" /> Latest supplied measurements
            </p>
            <dl className="divide-y divide-line">
              {measurementDefs.map((m) => (
                <div key={m.key} className="flex items-baseline justify-between py-2.5">
                  <dt className="text-sm text-muted">
                    {m.label} <span className="font-mono text-[11px] text-subtle">({m.unit})</span>
                  </dt>
                  <dd className="tnum font-mono text-sm font-medium text-ink">{formatMeasurement(last[m.key], m.key)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-subtle">Recorded {formatShort(last.date)} · {last.source}</p>
          </div>
          <div className="card p-5 lg:col-span-3">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-subtle">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" /> Inspection records
            </p>
            <ul className="grid gap-3 md:grid-cols-3">
              {sample.inspections.slice(0, 3).map((i) => (
                <li key={i.id} className="rounded-lg border border-line p-3">
                  <p className="font-mono text-[11px] text-subtle">{i.id} · {i.zoneId}</p>
                  <p className="mt-1 text-sm text-ink">{i.reason}</p>
                  <p className="mt-2 text-xs font-medium capitalize text-forest-600">{i.state.replace('_', ' ')}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="C · How it works" title="Four steps from scattered evidence to a clear inspection list." />
          <Link to="/how-it-works" className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700 hover:text-forest-900">
            Read the full walkthrough <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ n, title, body, Icon }) => (
            <li key={n} className="card relative p-6">
              <span className="font-mono text-xs text-clay-500">{n}</span>
              <Icon className="mt-4 h-6 w-6 text-forest-600" aria-hidden="true" />
              <h3 className="mt-3 text-lg leading-snug text-forest-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ChangeDetection() {
  const zone = sample.zones[0];
  const { current, previous } = latestPair(sample, zone.id);
  const [highlight, setHighlight] = useState(true);
  if (!current || !previous) return null;
  const readings = zoneReadings(sample, zone.id).filter((r) => daysAgo(r.date) <= 14);
  const summary = summariseObservation(current, previous, readings);
  const first = readings[0];
  const last = readings[readings.length - 1];
  return (
    <section className="bg-forest-900 py-20 text-root sm:py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3 !text-sage-300">D · Visual change detection</p>
          <h2 className="text-3xl leading-tight sm:text-4xl">See what changed since the last observation — next to the readings from the same period.</h2>
          <p className="mt-4 text-lg text-root/70">Drag the slider to compare. Outlined regions show where the visible root material or tone differs. Readings are displayed for context, not as an explanation.</p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <ComparisonSlider previous={previous} current={current} medium={zone.medium} highlight={highlight} />
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-root/80">
              <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} className="h-4 w-4 accent-amber-500" />
              Outline regions with visible differences
            </label>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ScanSearch className="h-4 w-4 text-amber-500" aria-hidden="true" /> Observation summary
                </p>
                <span className="font-mono text-[10px] uppercase tracking-wider text-sage-300">Simulated</span>
              </div>
              <p className="mt-3 font-display text-lg leading-snug">{summary.headline}</p>
              <ul className="mt-3 space-y-2 text-sm text-root/75">
                {summary.points.slice(0, 2).map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage-300" /> {p}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-medium text-amber-100">{summary.recommendation}</p>
              <p className="mt-4 border-t border-white/10 pt-3 text-xs text-root/55">{SUMMARY_DISCLAIMER}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold">Linked readings · {zone.id}, last 14 days</p>
              <table className="mt-3 w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wider text-sage-300">
                  <tr>
                    <th className="pb-2 font-medium">Measurement</th>
                    <th className="pb-2 font-medium">{formatShort(first.date)}</th>
                    <th className="pb-2 font-medium">{formatShort(last.date)}</th>
                  </tr>
                </thead>
                <tbody className="tnum font-mono text-[13px]">
                  {measurementDefs.slice(0, 4).map((m) => (
                    <tr key={m.key} className="border-t border-white/10">
                      <td className="py-2 font-sans text-root/70">
                        {m.short} <span className="text-[11px] text-root/45">({m.unit})</span>
                      </td>
                      <td className="py-2">{formatMeasurement(first[m.key], m.key)}</td>
                      <td className="py-2">{formatMeasurement(last[m.key], m.key)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[11px] text-root/50">Sample data. Values shown only where supplied.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OperationalVisibility() {
  const issues = allQualityIssues(sample);
  const zonesWith = (t: string) => new Set(issues.filter((i) => i.type === t).map((i) => i.zoneId)).size;
  const openInsp = sample.inspections.filter((i) => i.state !== 'complete');
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const cards = [
    { Icon: ImageOff, title: 'Missing images', body: 'Zones without a recent root image are surfaced before they become blind spots.', stat: plural(zonesWith('overdue_observation'), 'zone'), note: `no observation in ${sample.settings.observationIntervalDays} days` },
    { Icon: CalendarClock, title: 'Outdated readings', body: 'Readings older than your freshness threshold are marked, so nobody compares against stale numbers.', stat: plural(zonesWith('outdated_reading'), 'zone'), note: `reading > ${sample.settings.freshnessDays} days old` },
    { Icon: AlertTriangle, title: 'Inspection queue', body: 'Flagged observations become inspections with an owner, evidence and a recorded finding.', stat: `${openInsp.length} open`, note: `across ${plural(new Set(openInsp.map((i) => i.zoneId)).size, 'zone')}` },
    { Icon: FolderOpen, title: 'Historical records', body: 'Every image, reading, note and finding stays attached to its zone for later review and audits.', stat: `${sample.observations.length} obs.`, note: `${sample.readings.length} readings · ${sample.inspections.length} inspections` },
  ];
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="E · Operational visibility" title="Know where the gaps are, not just where the changes are.">
          Data quality is part of the picture. Rootsignal tells you when the evidence is incomplete, so a quiet zone isn’t mistaken for a healthy one.
        </SectionHeading>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ Icon, title, body, stat, note }) => (
            <li key={title} className="card flex flex-col p-6">
              <Icon className="h-5 w-5 text-forest-600" aria-hidden="true" />
              <h3 className="mt-4 text-lg text-forest-900">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{body}</p>
              <div className="mt-5 border-t border-line pt-3">
                <p className="tnum font-mono text-xl text-forest-900">{stat}</p>
                <p className="text-xs text-subtle">{note} · sample data</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BuiltFor() {
  const items = [
    { kind: 'hydroponic' as const, title: 'Hydroponic farms', body: 'NFT, DWC and vertical systems where roots sit in solution and changes can spread along a channel.', anchor: 'hydroponic' },
    { kind: 'greenhouse' as const, title: 'Greenhouse operations', body: 'High-wire fruiting crops on rockwool or coco with drip irrigation across many rows and bays.', anchor: 'greenhouse' },
    { kind: 'nursery' as const, title: 'Commercial nurseries', body: 'Propagation and young-plant production with thousands of trays and frequent movement between benches.', anchor: 'nursery' },
  ];
  return (
    <section className="border-t border-line bg-paper-2/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="F · Built for commercial growing" title="Designed around how growing teams actually work." />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((i) => (
            <li key={i.kind} className="card overflow-hidden">
              <UseCaseScene kind={i.kind} className="h-auto w-full" />
              <div className="p-6">
                <h3 className="text-xl text-forest-900">{i.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{i.body}</p>
                <Link to={`/use-cases#${i.anchor}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700 hover:text-forest-900">
                  See the workflow <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-10 flex items-start gap-2 text-sm text-muted">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
          Rootsignal describes visible changes and organises evidence. Decisions about plant health and treatment stay with your growers and advisers.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta('', 'Rootsignal brings root observations, irrigation readings and grower notes together by growing zone so commercial growers can spot changes and prioritise inspections.');
  return (
    <>
      <Hero />
      <Problem />
      <ClearerPicture />
      <HowItWorksSection />
      <ChangeDetection />
      <OperationalVisibility />
      <BuiltFor />
      <FinalCta />
    </>
  );
}
