import { useState } from 'react';
import { Check } from 'lucide-react';
import { ButtonLink } from '../components/ui';
import { formatLimit, formatPrice, limitLabels, plans, type PlanLimits } from '../config/pricing';
import { usePageMeta } from '../lib/usePageMeta';
import { FinalCta, PageHero } from './shared';

const faqs = [
  { q: 'Do I need sensors to use Rootsignal?', a: 'No. Most teams start with root images and manual or CSV-imported readings. Sensor and climate-computer integrations are scoped per project on the Enterprise plan.' },
  { q: 'Does Rootsignal diagnose plant diseases?', a: 'No. Rootsignal describes visible differences between observations and organises the evidence. Diagnosis and treatment decisions stay with your growers, advisers and laboratory testing.' },
  { q: 'What counts as a growing zone?', a: 'Whatever unit you inspect and manage together: a channel block, raft pond, row group, bench or compartment.' },
  { q: 'Are these prices final?', a: 'Prices shown are illustrative. Contact us for a quote that reflects your number of sites and zones.' },
];

export default function Pricing() {
  usePageMeta('Pricing', 'Illustrative Rootsignal plans: Grower at $49/month, Farm at $149/month, and Enterprise with custom pricing for multi-site operations.');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const limitKeys = Object.keys(limitLabels) as (keyof PlanLimits)[];
  return (
    <>
      <PageHero eyebrow="Pricing" title="Plans that scale with your zones.">
        Illustrative pricing for planning purposes. All plans include the core zone record, image history and data-quality indicators.
      </PageHero>
      <section className="py-16">
        <div className="container-page">
          <div className="flex justify-center">
            <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-lg border border-line bg-paper-2 p-1">
              {(['monthly', 'annual'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={billing === b}
                  onClick={() => setBilling(b)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize ${billing === b ? 'bg-forest-800 text-paper' : 'text-muted hover:text-ink'}`}
                >
                  {b}
                  {b === 'annual' && <span className="ml-1.5 text-xs opacity-80">save 15%</span>}
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <li key={p.id} className={`card relative flex flex-col p-7 ${p.highlighted ? 'border-forest-700 ring-1 ring-forest-700' : ''}`}>
                {p.highlighted && <span className="absolute -top-3 left-7 rounded-full bg-forest-800 px-3 py-1 text-xs font-medium text-paper">Most teams</span>}
                <h2 className="text-2xl text-forest-900">{p.name}</h2>
                <p className="mt-2 min-h-[3rem] text-sm text-muted">{p.summary}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="tnum font-display text-5xl text-forest-900">{formatPrice(p, billing)}</span>
                  {p.monthlyPrice !== null && <span className="text-sm text-muted">/month</span>}
                </p>
                <p className="mt-1 h-4 text-xs text-subtle">{p.monthlyPrice !== null && billing === 'annual' ? 'billed annually' : p.monthlyPrice === null ? 'tailored to your sites' : 'billed monthly'}</p>
                <ButtonLink to={p.cta.to} variant={p.highlighted ? 'primary' : 'secondary'} className="mt-6">
                  {p.cta.label}
                </ButtonLink>
                <ul className="mt-7 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" /> {f}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <div className="mt-16 overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <caption className="mb-4 text-left font-display text-2xl text-forest-900">Plan limits</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="py-3 pr-4 font-medium text-muted">Limit</th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className="py-3 pr-4 font-semibold text-forest-900">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {limitKeys.map((k) => (
                  <tr key={k} className="border-b border-line/70">
                    <th scope="row" className="py-3 pr-4 font-normal text-muted">{limitLabels[k].label}</th>
                    {plans.map((p) => (
                      <td key={p.id} className="tnum py-3 pr-4 font-mono text-ink">
                        {formatLimit(p.limits[k], limitLabels[k].unit)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mx-auto mt-20 max-w-3xl">
            <h2 className="text-center text-3xl text-forest-900">Questions</h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {faqs.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-forest-900">
                    {f.q}
                    <span className="text-xl text-subtle transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
