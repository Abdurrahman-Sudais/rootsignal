import { Eye, Scale, Sprout, Users } from 'lucide-react';
import { RootMark } from '../components/Logo';
import { SectionHeading } from '../components/ui';
import { FOUNDERS, site } from '../config/site';
import { FoundersGrid, RoadmapSection } from './HomeSections';
import { usePageMeta } from '../lib/usePageMeta';
import { FinalCta, PageHero } from './shared';

const principles = [
  { Icon: Eye, title: 'Show the evidence', body: 'Every summary links back to the images and readings it came from. Nothing is hidden behind a score.' },
  { Icon: Scale, title: 'Be honest about uncertainty', body: 'Image appearance is a prompt to look closer, not a diagnosis. We say what the data can and can’t support.' },
  { Icon: Users, title: 'Growers decide', body: 'Rootsignal organises and prioritises. Decisions about crops and treatment stay with the people who know them.' },
  { Icon: Sprout, title: 'Start with what you have', body: 'Phones, spreadsheets and existing routines are enough to begin. Integrations come when they add value.' },
];

export default function About() {
  usePageMeta('About & team', `Rootsignal was founded by ${FOUNDERS.map((f) => `${f.name} (${f.role})`).join(' and ')} to help commercial growers see and record what’s happening in the root zone.`);
  return (
    <>
      <PageHero eyebrow="About Rootsignal" title="We help growers keep track of the part of the crop they can’t see.">
        {site.description}
      </PageHero>
      <section className="py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            <p>
              Root checks are a routine part of commercial growing, but the results rarely stay organised. Photos end up on personal phones, readings in a spreadsheet, and the context in someone’s head. When something looks different, the first question — <em>different from what?</em> — is surprisingly hard to answer.
            </p>
            <p>
              Rootsignal was founded by <strong className="font-semibold text-forest-900">{site.founder}</strong> (Founder/CEO) with <strong className="font-semibold text-forest-900">Yusuf Abdulhamid</strong> (Co-founder/CTO) to make that question easy. The product gives every growing zone a single, comparable record and turns visible changes into a clear, accountable inspection list.
            </p>
            <p>We build carefully. Our assisted summaries describe what looks different; they don’t claim to know why. That restraint is a feature.</p>
          </div>
          <aside className="reveal card h-fit p-7">
            <RootMark className="h-10 w-10" />
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-subtle">Founders</dt>
                {FOUNDERS.map((f) => (
                  <dd key={f.name} className="font-medium text-forest-900">
                    {f.name} <span className="font-normal text-muted">· {f.role}</span>
                  </dd>
                ))}
              </div>
              <div>
                <dt className="text-subtle">Focus</dt>
                <dd className="font-medium text-forest-900">Controlled-environment agriculture, hydroponics, greenhouse operations</dd>
              </div>
              <div>
                <dt className="text-subtle">Contact</dt>
                <dd>
                  <a href={`mailto:${site.email}`} className="font-medium text-forest-700 underline decoration-sage-300 underline-offset-4 hover:text-forest-900">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Web</dt>
                <dd className="font-medium text-forest-900">{site.domain}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
      <section id="team" className="border-t border-line py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Team" title="The founders">
            Two founders, one product and growth lead and one technology lead, building Rootsignal together with the growers who will use it.
          </SectionHeading>
          <div className="mt-10">
            <FoundersGrid />
          </div>
        </div>
      </section>
      <section className="border-t border-line bg-paper-2/60 py-20">
        <div className="container-page grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="reveal">
            <p className="eyebrow mb-3">Mission</p>
            <p className="font-display text-3xl leading-snug text-forest-900">Give every growing team a clear, honest record of what is happening below the surface — so the right zones get looked at first.</p>
          </div>
          <div className="reveal space-y-4 text-muted" style={{ '--d': '120ms' } as React.CSSProperties}>
            <p>Most root-zone problems are found late because the evidence is scattered, not because growers aren’t looking. We fix the record-keeping first, then add careful assistance on top.</p>
            <p>We’re in early access, piloting with a small number of operations. If that sounds like yours, we’d like to hear from you.</p>
          </div>
        </div>
      </section>
      <section className="border-t border-line py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Principles" title="How we build Rootsignal" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ Icon, title, body }) => (
              <li key={title} className="reveal lift spot card p-6">
                <Icon className="h-5 w-5 text-forest-600" aria-hidden="true" />
                <h3 className="mt-4 text-lg text-forest-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <RoadmapSection />
      <FinalCta />
    </>
  );
}
