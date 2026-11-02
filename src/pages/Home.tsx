import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Camera,
  Check,
  CheckCircle2,
  ExternalLink,
  ClipboardList,
  FileSpreadsheet,
  FolderOpen,
  History,
  Minus,
  ImageOff,
  NotebookPen,
  Ruler,
  ScanSearch,
  X,
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
import { useCountUp, useCycle } from '../lib/motion';
import { AiSection, EarlyAccessSection, FaqSection, PricingSection, RoadmapSection, SafeguardsSection, TeamSection, TechnologySection } from './HomeSections';

const sample = createSampleData();

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/** Published figures used in the problem section. Each one links to its source. */
export const PROBLEM_STATS = [
  { value: 497, decimals: 0, prefix: '', suffix: 'K ha', label: 'of permanent greenhouse vegetable production worldwide — and every hectare has a root zone nobody can see from the aisle.', source: 'Cuesta Roble global greenhouse statistics (2019), via Produce Grower', url: 'https://www.producegrower.com/article/cuesta-roble-2019-global-greenhouse-statistics/' },
  { value: 703, decimals: 0, prefix: '$', suffix: 'M', label: 'in US sales of food crops grown under protection in 2019 — tomatoes, cucumbers, lettuce and herbs from greenhouses and indoor farms.', source: 'USDA NASS, 2019 Census of Horticultural Specialties', url: 'https://www.nass.usda.gov/Publications/Highlights/2020/census-horticulture.pdf' },
  { value: 54, decimals: 0, prefix: 'up to ', suffix: '%', label: 'yield reduction measured in hydroponic lettuce from a root-zone problem that showed no visible root or foliar symptoms.', source: 'Stanghellini & Kronland, Plant Disease 70 (1986)', url: 'https://www.apsnet.org/publications/plantdisease/backissues/Documents/1986Abstracts/PD_70_1053.htm' },
];

const OUTCOME_WORDS = ['blind spots.', 'lost photos.', 'stale readings.', 'guesswork.'] as const;
const BUILT_FOR = ['Head growers', 'Crop-protection leads', 'Irrigation technicians', 'Hydroponic farms', 'NFT & DWC', 'Vertical farms', 'High-wire tomatoes', 'Cucumbers', 'Leafy greens', 'Herbs', 'Propagation', 'Commercial nurseries', 'Research trials'];

function FloatCard({ className, icon, title, body, style }: { className: string; icon: ReactNode; title: string; body: string; style?: CSSProperties }) {
  return (
    <div className={`absolute z-10 max-w-[17rem] items-start gap-3 rounded-xl border border-line bg-[#fffdf8]/95 p-3 shadow-xl shadow-forest-900/15 backdrop-blur ${className}`} style={style} aria-hidden="true">
      <span className="mt-0.5">{icon}</span>
      <span>
        <span className="block text-xs font-semibold text-forest-900">{title}</span>
        <span className="mt-0.5 block text-xs text-muted">{body}</span>
      </span>
    </div>
  );
}

function Hero() {
  const word = useCycle(OUTCOME_WORDS, 2400);
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="botanical-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
      <div className="hero-glow pointer-events-none absolute -right-32 top-10 h-[26rem] w-[26rem] rounded-full bg-sage-300/50 blur-3xl" aria-hidden="true" />
      <div className="hero-glow pointer-events-none absolute -left-40 bottom-0 h-[20rem] w-[20rem] rounded-full bg-amber-100/80 blur-3xl [animation-delay:-4s]" aria-hidden="true" />
      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
        <div className="min-w-0">
          <Link to="/contact?type=demo" className="animate-fade-up group mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-[#fffdf8]/80 px-3 py-1.5 text-xs text-forest-900 backdrop-blur hover:border-forest-600/50">
            <span className="live-dot" aria-hidden="true" /> Early access open · pilots on one site <ArrowRight className="h-3.5 w-3.5 text-forest-600 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <h1 className="animate-fade-up text-[2.6rem] leading-[1.04] text-forest-900 [animation-delay:60ms] sm:text-6xl">
            See what’s changing in the root zone — not <span className="sr-only">blind spots, lost photos, stale readings or guesswork.</span>
            <span aria-hidden="true" className="block min-h-[1.1em]">
              <em key={word} className="word-in">
                <span className="text-shimmer">{word}</span>
              </em>
            </span>
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted [animation-delay:120ms]">
            Bring root observations, irrigation readings, and grower notes together. Rootsignal helps your team spot changes over time and prioritise inspections across your operation.
          </p>
          <div className="animate-fade-up mt-8 flex flex-col gap-3 [animation-delay:180ms] sm:flex-row">
            <ButtonLink to="/contact?type=demo">
              Request early access <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink to="/dashboard" variant="secondary">
              Explore the live demo
            </ButtonLink>
          </div>
          <ul className="animate-fade-up mt-8 grid max-w-lg gap-x-6 gap-y-2 text-sm text-ink [animation-delay:240ms] sm:grid-cols-2">
            {['One record per growing zone', 'Images compared over time', 'Data gaps flagged', 'Growers decide every action'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-forest-600" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="animate-fade-up relative min-w-0 [animation-delay:200ms]">
          <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-sage-300/30 blur-2xl" aria-hidden="true" />
          <div className="relative">
            <DashboardPreview />
          </div>
          <FloatCard className="float -left-6 -top-8 hidden lg:flex" icon={<AlertTriangle className="h-4 w-4 text-rust-500" />} title="GN-A1 · Lettuce — visible change" body="Latest root image differs from the last one — queued for inspection" />
          <FloatCard className="float-slow -bottom-20 -right-4 hidden lg:flex" icon={<ScanSearch className="h-4 w-4 text-forest-600" />} title="Readings from the same period" body="pH, EC and solution temperature shown alongside — context, not a diagnosis" style={{ animationDelay: '-2s' }} />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, decimals, prefix, suffix, label, source, url, delayMs }: (typeof PROBLEM_STATS)[number] & { delayMs: number }) {
  const [ref, n] = useCountUp<HTMLDivElement>(value);
  return (
    <figure className="reveal lift spot card p-6" style={delay(delayMs)}>
      <div ref={ref} className="tnum font-display text-5xl tracking-tight text-forest-900 sm:text-6xl">
        {prefix && <span className="text-2xl text-muted sm:text-3xl">{prefix}</span>}
        {n.toFixed(decimals)}
        <span className="text-clay-500">{suffix}</span>
      </div>
      <figcaption>
        <p className="mt-3 text-sm leading-relaxed text-muted">{label}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-start gap-1 text-xs text-subtle hover:text-forest-700">
          Source: {source} <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}

function Marquee() {
  const row = [...BUILT_FOR, ...BUILT_FOR];
  return (
    <section aria-label="Built for" className="marquee overflow-hidden border-b border-line bg-paper-2/60 py-6">
      <p className="eyebrow mb-4 text-center">Built for the people who check the roots</p>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="marquee-track flex w-max gap-10">
          {row.map((t, i) => (
            <li key={i} aria-hidden={i >= BUILT_FOR.length} className="flex items-center gap-10 whitespace-nowrap font-display text-2xl italic text-forest-700/70">
              {t}
              <span className="h-1 w-1 rounded-full bg-clay-500/60" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SolutionSection() {
  const today = ['Root photos sit on personal phones with no zone or date attached.', 'Readings live in a spreadsheet on a different schedule to root checks.', '“Different from what?” takes longer to answer than the inspection.', 'A zone nobody photographed looks the same as a healthy one.', 'Inspections are on paper — who checked what, and when, is a guess.'];
  const withRs = ['Every image lands in its zone with date, method and author.', 'Readings sit next to observations from the same period, with units.', 'Each new image is compared with the last; differences are outlined.', 'Missing images and stale readings are flagged automatically.', 'Flagged zones become inspections with an owner, a finding and an audit trail.'];
  return (
    <section id="solution" className="border-y border-line bg-paper-2/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="What we solve" title="From scattered evidence to one record per zone your team trusts." />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="reveal card p-6 sm:p-8">
            <p className="eyebrow flex items-center gap-2 !text-subtle">
              <X className="h-3.5 w-3.5 text-rust-500" aria-hidden="true" /> Today
            </p>
            <ul className="mt-5 space-y-4">
              {today.map((t) => (
                <li key={t} className="flex gap-3 text-muted">
                  <Minus className="mt-1 h-4 w-4 shrink-0 text-subtle" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal spot rounded-[0.875rem] border border-forest-600/40 bg-gradient-to-br from-forest-800 to-forest-950 p-6 text-root sm:p-8" style={delay(120)}>
            <p className="eyebrow flex items-center gap-2 !text-sage-300">
              <Check className="h-3.5 w-3.5" aria-hidden="true" /> With Rootsignal
            </p>
            <ul className="mt-5 space-y-4">
              {withRs.map((t) => (
                <li key={t} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-300" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

type Cell = { v: 'yes' | 'no' | 'part'; t: string };
const COMPARE: { row: string; cols: [Cell, Cell, Cell, Cell] }[] = [
  { row: 'Root images filed by zone and date', cols: [{ v: 'no', t: 'Camera roll' }, { v: 'part', t: 'Folders, if kept up' }, { v: 'no', t: 'Not its job' }, { v: 'yes', t: 'Every image in its zone' }] },
  { row: 'Images compared over time', cols: [{ v: 'no', t: 'Scroll and squint' }, { v: 'no', t: 'Manual' }, { v: 'no', t: '—' }, { v: 'yes', t: 'Side by side, differences outlined' }] },
  { row: 'Readings next to observations', cols: [{ v: 'no', t: 'Separate' }, { v: 'part', t: 'Another tab' }, { v: 'part', t: 'Readings only' }, { v: 'yes', t: 'Same zone, same period' }] },
  { row: 'Missing and stale data flagged', cols: [{ v: 'no', t: '—' }, { v: 'no', t: '—' }, { v: 'part', t: 'Sensor alarms' }, { v: 'yes', t: 'Per zone, per threshold' }] },
  { row: 'Inspections with owner and finding', cols: [{ v: 'no', t: 'Chat messages' }, { v: 'part', t: 'Paper forms' }, { v: 'no', t: 'Out of scope' }, { v: 'yes', t: 'Queue with audit log' }] },
  { row: 'Controls irrigation or climate', cols: [{ v: 'no', t: '—' }, { v: 'no', t: '—' }, { v: 'yes', t: 'That’s its job' }, { v: 'no', t: 'By design — records, never controls' }] },
];

function CompareSection() {
  const heads = ['Phones & chat', 'Spreadsheets & paper', 'Climate computer', 'Rootsignal'];
  const Icon = ({ v }: { v: Cell['v'] }) =>
    v === 'yes' ? <Check className="h-4 w-4 shrink-0 text-forest-600" aria-label="Yes" /> : v === 'no' ? <X className="h-4 w-4 shrink-0 text-rust-500" aria-label="No" /> : <Minus className="h-4 w-4 shrink-0 text-amber-600" aria-label="Partly" />;
  return (
    <section id="compare" className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Why Rootsignal" title="How it compares with the way root checks are recorded today">
          Rootsignal sits alongside your climate computer and fertigation system — it keeps the evidence organised so inspections go to the right zones.
        </SectionHeading>
        <div className="reveal card mt-12 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-2/70">
                <th className="p-4 font-normal">
                  <span className="sr-only">Capability</span>
                </th>
                {heads.map((h, i) => (
                  <th key={h} className={`p-4 font-semibold ${i === 3 ? 'bg-sage-100 text-forest-900' : 'text-muted'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.row} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 font-medium text-forest-900">
                    {r.row}
                  </th>
                  {r.cols.map((c, i) => (
                    <td key={i} className={`p-4 align-top ${i === 3 ? 'bg-sage-100/50' : ''}`}>
                      <span className={`flex gap-2 ${i === 3 ? 'text-ink' : 'text-muted'}`}>
                        <Icon v={c.v} /> {c.t}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
    <section id="problem" className="py-20 sm:py-24">
      <div className="container-page mb-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PROBLEM_STATS.map((st, i) => (
            <Stat key={st.label} {...st} delayMs={i * 120} />
          ))}
        </div>
        <p className="mt-4 text-xs text-subtle">Published figures from third-party sources, linked above. They describe the scale of protected cropping and the cost of unseen root-zone change — not Rootsignal results. Rootsignal does not diagnose disease.</p>
      </div>
      <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading eyebrow="A · The hidden root-zone problem" title="The root zone changes out of sight — and the evidence is scattered.">
            Canopy issues are easy to notice. Changes below the surface usually aren’t. When root photos, irrigation readings and notes live in separate places, comparing this week with last week takes longer than the inspection itself.
          </SectionHeading>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {silos.map(({ Icon, title, where, issue }) => (
              <li key={title} className="reveal lift card p-4">
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
        <div className="reveal card overflow-hidden p-4 sm:p-6">
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
            <li key={n} className="reveal lift spot card relative p-6">
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
            <li key={title} className="reveal lift spot card flex flex-col p-6">
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
    <section id="who" className="border-t border-line bg-paper-2/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="F · Built for commercial growing" title="Designed around how growing teams actually work." />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((i) => (
            <li key={i.kind} className="reveal lift card overflow-hidden">
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
      <Marquee />
      <Problem />
      <SolutionSection />
      <ClearerPicture />
      <HowItWorksSection />
      <ChangeDetection />
      <OperationalVisibility />
      <BuiltFor />
      <CompareSection />
      <AiSection />
      <SafeguardsSection />
      <TechnologySection />
      <PricingSection />
      <RoadmapSection />
      <TeamSection />
      <FaqSection />
      <EarlyAccessSection />
      <FinalCta />
    </>
  );
}
