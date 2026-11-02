import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Check, Clock, Compass, Mail, Rocket, ShieldCheck, Sparkles, X } from 'lucide-react';
import { ButtonLink, SectionHeading } from '../components/ui';
import { FOUNDERS, site, type Person } from '../config/site';
import { formatPrice, plans } from '../config/pricing';
import { PIPELINE, SAFEGUARDS } from './Trust';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export function AiSection() {
  return (
    <section id="ai" className="py-20 sm:py-24">
      <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="min-w-0">
          <SectionHeading eyebrow="AI, used carefully" title="Answers from your own zone records, not guesses.">
            Rootsignal’s assistant explains what changed and which zones need a look. The comparison is deterministic; the wording only makes it easier to read.
          </SectionHeading>
          <ul className="mt-8 space-y-3">
            {(
              [
                [true, 'Summarise a zone: latest observation, readings and open inspections'],
                [true, 'Answer “which zones need inspection?” and “where is data missing?”'],
                [true, 'Describe what looks different between two root images'],
                [true, 'List the records it used, so every answer can be checked'],
                [false, 'Diagnose disease or name a pathogen'],
                [false, 'Prescribe treatment, doses or predict yield'],
              ] as const
            ).map(([ok, t], i) => (
              <li key={t} className="reveal lift card flex gap-3 p-4 text-sm text-ink" style={delay(i * 60)}>
                {ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-label="Does" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-rust-500" aria-label="Never does" />}
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal relative min-w-0" style={delay(120)}>
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-sage-300/40 blur-2xl" aria-hidden="true" />
          <div className="card relative p-6">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-forest-900">
              <Bot className="h-4 w-4 text-forest-600" aria-hidden="true" /> Ask about this site
              <span className="rounded-full border border-amber-500/40 bg-amber-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-600">Sample data</span>
            </div>
            <p className="ml-auto mt-5 w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-forest-800 px-3 py-2 text-sm text-paper">Which zones need inspection?</p>
            <div className="mt-3 max-w-[92%] rounded-2xl rounded-bl-sm border border-line bg-paper p-3 text-sm text-ink">
              <p>GN-A1 is flagged: its latest root image shows a visible change since the previous one, and the inspection is not yet assigned. Two other zones have open inspections in progress.</p>
              <p className="mt-3 font-mono text-[11px] text-subtle">From the inspection queue and the latest observations</p>
            </div>
            <p className="ml-auto mt-4 w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-forest-800 px-3 py-2 text-sm text-paper">Does GN-A1 have root rot?</p>
            <div className="mt-3 max-w-[92%] rounded-2xl rounded-bl-sm border border-line bg-paper p-3 text-sm text-muted">I can’t diagnose disease. I can show what looks different in GN-A1 and the readings from the same period, so your grower can inspect it.</div>
            <ButtonLink to="/dashboard" className="mt-6 py-2 text-xs">
              Try the assistant in the demo <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SafeguardsSection() {
  return (
    <section className="border-t border-line bg-paper-2/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Safeguards" title="The software flags. Your growers decide." />
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAFEGUARDS.map(([t, b], i) => (
            <div key={t} className="reveal lift spot card p-6" style={delay((i % 3) * 90)}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100 text-forest-700">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg text-forest-900">{t}</h3>
              <p className="mt-2 text-sm text-muted">{b}</p>
            </div>
          ))}
        </div>
        <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-900">
          Security and safeguards in detail <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function TechnologySection() {
  return (
    <section id="technology" className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Technology" title="How we use Amazon Web Services">
          A proposed serverless architecture: keep every image and reading in its zone, compare deterministically, and use Amazon Bedrock only to describe.
        </SectionHeading>
        <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {PIPELINE.map((p, i) => (
            <li key={p.step} className="reveal lift spot card min-w-0 p-5" style={delay(i * 90)}>
              <span className="font-mono text-xs text-clay-500">{p.step}</span>
              <h3 className="mt-3 text-2xl text-forest-900">{p.title}</h3>
              <p className="mt-1 font-mono text-[11px] text-forest-600">{p.services}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-subtle">
          These services are proposed, not deployed. The demo runs in your browser on sample data.{' '}
          <Link to="/technology" className="font-medium text-forest-700 underline">
            The full architecture
          </Link>
        </p>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-line bg-paper-2/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Pricing" title="Plans that grow with your operation." center />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {plans.map((p, i) => (
            <div key={p.id} className={`reveal lift spot relative flex flex-col rounded-2xl border p-7 ${p.highlighted ? 'border-forest-600 bg-gradient-to-b from-sage-100 to-[#fffdf8]' : 'border-line bg-[#fffdf8]'}`} style={delay(i * 100)}>
              {p.highlighted && <span className="absolute -top-3 left-7 rounded-full bg-forest-800 px-2.5 py-0.5 text-xs font-semibold text-paper">Most popular</span>}
              <h3 className="text-2xl text-forest-900">{p.name}</h3>
              <p className="mt-1 text-sm text-muted">{p.summary}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-5xl text-forest-900">{formatPrice(p, 'monthly')}</span>
                {p.monthlyPrice !== null && <span className="text-subtle">/month</span>}
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
              <ButtonLink to={p.cta.to} variant={p.highlighted ? 'primary' : 'secondary'} className="mt-7 w-full">
                {p.cta.label}
              </ButtonLink>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-subtle">
          Illustrative prices in USD, excluding taxes. Early-access growers are onboarded directly by the founders.{' '}
          <Link to="/pricing" className="font-medium text-forest-700 underline">
            Compare plans
          </Link>
        </p>
      </div>
    </section>
  );
}

export const ROADMAP = [
  { icon: Sparkles, stage: 'Now', title: 'Live demo & early access', items: ['Interactive dashboard on a sample greenhouse', 'Image comparison, inspection queue, data-quality checks', 'Roles, audit log and grounded assistant', 'Early-access requests open'], current: true },
  { icon: Compass, stage: 'Next', title: 'Pilot on one site', items: ['Upload your own root images and reading exports', 'Mobile capture for growers on the floor', 'Inspection reminders by email'] },
  { icon: Rocket, stage: 'Then', title: 'General availability', items: ['Multiple sites with roll-ups', 'Single sign-on with roles enforced on the server', 'Change summaries written with Amazon Bedrock', 'Scheduled reports for growers and managers'] },
  { icon: Clock, stage: 'Later', title: 'Exploring with pilot growers', items: ['Read-only climate-computer and sensor feeds', 'Fixed-camera time-lapse capture', 'Trial and variety comparisons'] },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Roadmap" title="Where Rootsignal is going">
          Built with early-access growers. The order below is our plan and may change based on what pilots teach us.
        </SectionHeading>
        <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {ROADMAP.map((r, i) => (
            <li key={r.stage} className={`reveal lift rounded-2xl border p-6 ${r.current ? 'border-forest-600 bg-sage-100/70' : 'border-line bg-[#fffdf8]'}`} style={delay(i * 100)}>
              <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${r.current ? 'bg-forest-800 text-paper' : 'border border-line text-muted'}`}>
                  <r.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider ${r.current ? 'text-forest-700' : 'text-subtle'}`}>
                  {r.current && <span className="live-dot" aria-hidden="true" />}
                  {r.stage}
                </span>
              </div>
              <h3 className="mt-4 text-2xl text-forest-900">{r.title}</h3>
              <ul className="mt-3 space-y-2">
                {r.items.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-muted">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${r.current ? 'text-forest-600' : 'text-sage-500'}`} aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PersonCard({ person, delayMs = 0 }: { person: Person; delayMs?: number }) {
  return (
    <article className="reveal lift spot card relative overflow-hidden bg-gradient-to-br from-[#fffdf8] to-sage-100/60 p-6 sm:p-8" style={delay(delayMs)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center" aria-hidden="true">
          <div className="spin-slow absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#2d6446,#a8754a,#c2d1bd,#2d6446)]" style={{ animationDelay: `-${delayMs / 10}s` }} />
          <div className="absolute inset-[3px] grid place-items-center rounded-full bg-paper font-display text-3xl text-forest-800">{person.initials}</div>
        </div>
        <div className="min-w-0">
          <p className="eyebrow">{person.role}</p>
          <h3 className="mt-1 text-3xl text-forest-900">{person.name}</h3>
          <p className="mt-3 max-w-xl text-muted">{person.bio}</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus areas">
            {person.focus.map((f) => (
              <li key={f} className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs text-forest-800">
                {f}
              </li>
            ))}
          </ul>
          {person.email && (
            <a href={`mailto:${person.email}`} className="mt-4 inline-flex items-center gap-1.5 break-all text-sm font-medium text-forest-700 hover:underline">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {person.email}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function FoundersGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {FOUNDERS.map((p, i) => (
        <PersonCard key={p.name} person={p} delayMs={i * 120} />
      ))}
    </div>
  );
}

export function TeamSection() {
  return (
    <section id="team" className="border-t border-line bg-paper-2/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Team" title="The people building Rootsignal">
          {`Founded by ${FOUNDERS.map((f) => f.name).join(' and ')}, and built together with the growers who will use it.`}
        </SectionHeading>
        <div className="mt-12">
          <FoundersGrid />
        </div>
        <div className="reveal card mt-5 grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <h3 className="text-2xl text-forest-900">Building with growing teams</h3>
            <p className="mt-2 text-sm text-muted">Rootsignal is shaped by conversations with head growers, inspection leads and irrigation technicians. Early-access growers get a direct line to the founders and a say in what we build next.</p>
            <Link to="/about" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-900">
              Our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div>
            <p className="eyebrow">We’d like to hear from</p>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {['Hydroponic and greenhouse operations ready to pilot', 'Head growers and crop-protection leads', 'Advisers who know controlled-environment agriculture'].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export const FAQS: [string, string][] = [
  ['Does Rootsignal diagnose root disease?', 'No. It describes visible differences between root images and shows the readings recorded over the same period. Identifying a cause and choosing a treatment stay with your growers and advisers.'],
  ['What problem does it actually solve?', 'Root photos live on phones, readings in spreadsheets, notes in notebooks and inspections on paper. Rootsignal puts them in one record per growing zone, highlights what changed since last time, and turns that into an accountable inspection list.'],
  ['Do we need new sensors or cameras?', 'No. Phones and the readings you already record are enough to start. Sensor and climate-computer feeds are on the roadmap and scoped per pilot.'],
  ['Which crops and systems does it suit?', 'NFT, DWC, vertical farms, high-wire crops on rockwool or coco, and propagation benches — anywhere a team checks roots and records irrigation readings.'],
  ['Who can change what?', 'Head growers, inspection leads, growers and irrigation technicians each get only the actions they need, and every change is written to an audit log. Try “Demo as” in the dashboard.'],
  ['What does the AI do?', 'It summarises what changed, answers questions from your zone records and points out missing or stale data — always listing the records it used. It never diagnoses, prescribes or predicts yield.'],
  ['Is our data safe?', 'In the proposed design, images and records are encrypted, visible only to your team, and never used to train models for other growers.'],
  ['How much does it cost?', 'The Grower plan starts at $49/month; Farm and Enterprise plans are on the pricing page. Prices are illustrative and exclude taxes.'],
  ['Is it available today?', 'Rootsignal is in early access. The demo dashboard runs in your browser on a fictional greenhouse; a pilot runs on one of your sites. Request early access and one of the founders will reply personally.'],
];

export function FaqSection() {
  return (
    <section id="faq" className="py-20 sm:py-24">
      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <SectionHeading eyebrow="FAQ" title="Questions growers ask" />
          <a href={`mailto:${site.email}`} className="reveal mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:underline">
            <Mail className="h-4 w-4" aria-hidden="true" /> Email the founders
          </a>
        </div>
        <div className="reveal card divide-y divide-line">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-forest-900">
                {q}
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-forest-700 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EarlyAccessSection() {
  return (
    <section id="early-access" className="border-t border-line bg-paper-2/60 py-20 sm:py-24">
      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
        <SectionHeading eyebrow="Early access" title="Bring Rootsignal to your next crop cycle.">
          Early-access growers get guided setup on one site — using your own root photos and reading exports if you like — and a direct say in what we build next.
        </SectionHeading>
        <div className="reveal card p-6">
          <p className="eyebrow">What happens next</p>
          <ol className="mt-4 space-y-3 text-sm text-muted">
            <li>1. A founder replies to arrange a short call around your schedule.</li>
            <li>2. We walk through a few of your own zones and readings.</li>
            <li>3. If it’s a fit, we set up a pilot on one site.</li>
          </ol>
          <ButtonLink to="/contact?type=demo" className="mt-6 w-full">
            Request early access <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <p className="mt-3 text-xs text-subtle">No commitment — a request is not a subscription.</p>
        </div>
      </div>
    </section>
  );
}
