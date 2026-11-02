import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Info } from 'lucide-react';
import { SectionHeading } from '../components/ui';
import { site } from '../config/site';
import { usePageMeta } from '../lib/usePageMeta';
import { FinalCta, PageHero } from './shared';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export const PIPELINE = [
  { step: '01', title: 'Capture', services: 'Amazon S3 · AWS Lambda', body: 'Root images from phones and fixed cameras upload straight into the right growing zone, with capture date, method and author attached.' },
  { step: '02', title: 'Record', services: 'Amazon Aurora PostgreSQL · AWS IoT Core', body: 'Irrigation and climate readings — pH, EC, solution temperature, volume — arrive by import or sensor feed and are stored with their units and source.' },
  { step: '03', title: 'Compare', services: 'AWS Lambda · AWS Step Functions', body: 'Each new image is aligned with the previous one for that zone; a deterministic comparison measures visible differences and checks every reading for freshness.' },
  { step: '04', title: 'Summarise', services: 'Amazon Bedrock', body: 'A model may write a plain-language note of what looks different and which readings sit alongside it. It describes; it never diagnoses or prescribes.' },
  { step: '05', title: 'Inspect & report', services: 'Amazon Cognito · Amazon SES', body: 'Flagged zones are queued for inspection, assigned to a grower and closed with a recorded finding; reports and audit history export at any time.' },
];

const SERVICES: [string, string][] = [
  ['Amazon S3', 'Stores root images and exported reports with encryption, versioning and lifecycle rules.'],
  ['AWS IoT Core', 'Optional intake of irrigation and climate-computer readings from existing sensors.'],
  ['Amazon Aurora PostgreSQL', 'Sites, zones, observations, readings, inspections, team roles and the append-only audit log.'],
  ['AWS Lambda & Step Functions', 'Image alignment, change measurement, data-quality checks and inspection routing.'],
  ['Amazon Bedrock', 'Plain-language summaries of what changed between observations — always with the records used.'],
  ['Amazon Cognito', 'Sign-in, single sign-on and role groups for head growers, leads, growers and technicians.'],
  ['Amazon SES', 'Inspection assignments and overdue-observation reminders by email.'],
  ['Amazon CloudWatch', 'Monitoring and alarms for uploads, comparisons and sensor feeds.'],
  ['AWS KMS', 'Grower-specific encryption keys for images and records.'],
];

export const SAFEGUARDS: [string, string][] = [
  ['Growers decide', 'A flagged zone is a reason to look closer, never an instruction. Priorities and findings are set by people.'],
  ['No diagnosis, no prescriptions', 'Rootsignal describes visible differences. It does not identify disease, predict yield or recommend treatment.'],
  ['Gaps shown, not hidden', 'Missing images and stale readings are flagged, so a quiet zone is never mistaken for a healthy one.'],
  ['Every summary is traceable', 'Assisted notes list the observations and readings they were written from, so anyone can check them.'],
  ['Roles, enforced', 'Head growers, inspection leads, growers and technicians each get only the actions they need. The demo checks every action; production enforces it on the server.'],
  ['Everything audited', 'Observations, assignments, findings, priority changes and settings are written to an append-only audit log the head grower can export.'],
];

const SECURITY: [string, string][] = [
  ['Encryption', 'TLS 1.2+ in transit; AWS KMS encryption at rest for databases and image storage.'],
  ['Operation isolation', 'Every record carries an operation identifier filtered on every query; data never crosses growers.'],
  ['Single sign-on', 'Sign in with your identity provider through Amazon Cognito, with multi-factor authentication for head growers.'],
  ['Least privilege', 'Each service gets only the permissions it needs; no human uses root credentials.'],
  ['Your data stays yours', 'Images and records are never sold or shared, and never used to train models for other growers.'],
  ['Data portability', 'Zone records, images and inspection history export at any time.'],
];

export function Technology() {
  usePageMeta('Technology', 'How Rootsignal proposes to use AWS: image capture by zone, sensor readings, deterministic change comparison and Amazon Bedrock summaries that describe, never diagnose.');
  return (
    <>
      <PageHero eyebrow="Technology" title="How we use Amazon Web Services">
        A proposed architecture for moving from this browser demo to a production service: keep every image and reading in its zone, compare deterministically, and use AI only to describe — never to decide.
      </PageHero>
      <section className="py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Pipeline" title="From a root photo to a closed inspection." />
          <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {PIPELINE.map((p, i) => (
              <li key={p.step} className="reveal lift spot card min-w-0 p-5" style={delay(i * 80)}>
                <span className="font-mono text-xs text-clay-500">{p.step}</span>
                <h3 className="mt-3 text-2xl text-forest-900">{p.title}</h3>
                <p className="mt-1 font-mono text-[11px] text-forest-600">{p.services}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
              </li>
            ))}
          </ol>
          <div className="reveal mt-8 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-100/60 p-4 text-sm text-ink">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <p>
              <strong>Proposed, not deployed.</strong> None of these services are connected to this website or the demo dashboard, which run entirely in your browser on sample data.
            </p>
          </div>
        </div>
      </section>
      <section className="border-t border-line bg-paper-2/60 py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Services" title="What each service does." />
          <dl className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(([n, b], i) => (
              <div key={n} className="reveal card p-5" style={delay((i % 3) * 80)}>
                <dt className="font-semibold text-forest-900">{n}</dt>
                <dd className="mt-2 text-sm text-muted">{b}</dd>
              </div>
            ))}
          </dl>
          <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-900">
            Security and safeguards <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

export function Security() {
  usePageMeta('Security & safeguards', 'How Rootsignal keeps growers in charge: no diagnosis or prescriptions, data gaps shown, traceable summaries, role-based access and an audit log.');
  return (
    <>
      <PageHero eyebrow="Security & safeguards" title="The software flags. Your growers decide.">
        The demo already enforces the safeguards below. The security controls describe the proposed production design.
      </PageHero>
      <section className="py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Product safeguards" title="Built into the demo you can try today." />
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SAFEGUARDS.map(([t, b], i) => (
              <div key={t} className="reveal lift spot card p-6" style={delay((i % 3) * 80)}>
                <Check className="h-5 w-5 text-forest-600" aria-hidden="true" />
                <h3 className="mt-3 text-lg text-forest-900">{t}</h3>
                <p className="mt-2 text-sm text-muted">{b}</p>
              </div>
            ))}
          </div>
          <Link to="/dashboard/audit" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-900">
            See roles and the audit log in the demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <section className="border-t border-line bg-paper-2/60 py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Proposed security design" title="Controls for the production service." />
          <dl className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SECURITY.map(([t, b], i) => (
              <div key={t} className="reveal card p-5" style={delay((i % 3) * 80)}>
                <dt className="font-semibold text-forest-900">{t}</dt>
                <dd className="mt-2 text-sm text-muted">{b}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-3xl text-sm text-subtle">These controls are part of the proposed architecture and are not yet independently audited or certified.</p>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

const PRIVACY: [string, string][] = [
  ['What this website is', 'This website describes Rootsignal and includes an interactive demo dashboard that runs entirely in your browser on sample data from a fictional greenhouse. No sensors, climate computers or customer systems are connected.'],
  ['Demo data in your browser', 'Observations, inspections, settings, the chosen demo user and the demo audit log are saved in your browser’s local storage under the keys rootsignal-demo-v1 and rootsignal-access-v1. That data never leaves your device. “Reset demo data”, or clearing site data, removes it.'],
  ['Early-access requests', `Until a form service is configured, the contact form saves your message in your browser (key rootsignal-enquiries) and offers a pre-filled email to ${site.email}; nothing is sent until you send that email. If the operator connects the form to a customer-relationship service (proposed: HubSpot), submitting it sends the fields you enter, your consent choices and the page address to that service so Rootsignal can reply. Product updates are sent only if you tick the optional box. This notice must be updated with the confirmed service and retention before that is switched on.`],
  ['Analytics and cookies', 'This website includes no analytics or advertising trackers and sets no cookies. A hosting provider may process routine request data to serve and protect the site.'],
  ['Your requests', `Contact ${site.email} with questions about information you have sent to Rootsignal, or to ask for it to be corrected or deleted.`],
];

const TERMS: [string, string][] = [
  ['Demonstration only', 'The dashboard is a demonstration on sample data. It is not a production system and must not be used to manage a real crop.'],
  ['Not agronomic advice', 'Rootsignal describes visible changes and organises records. It does not diagnose plant disease, predict yield or recommend treatment. Decisions stay with your growers and advisers.'],
  ['Pricing and availability', 'Prices shown are illustrative and exclude taxes. Early-access requests do not create a subscription or any commitment.'],
  ['Use of the site', 'Use the site and demo lawfully. Do not upload personal information to the demo or the contact form beyond what is needed to reply.'],
  ['Changes', 'These terms are a review draft. Operator details, governing law and production service terms will be set out separately before launch.'],
];

export function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy';
  usePageMeta(privacy ? 'Privacy notice' : 'Terms of use', privacy ? 'How the Rootsignal website and demo dashboard handle information.' : 'Terms for using the Rootsignal website and demonstration dashboard.');
  return (
    <>
      <PageHero eyebrow="Review draft · operator details to be confirmed" title={privacy ? 'Privacy notice' : 'Terms of use'}>
        {privacy ? 'How this website and its demo dashboard handle information.' : 'Terms for using this website and its demonstration dashboard.'}
      </PageHero>
      <section className="py-20">
        <div className="container-page max-w-3xl space-y-8">
          {(privacy ? PRIVACY : TERMS).map(([t, b]) => (
            <div key={t} className="reveal">
              <h2 className="text-2xl text-forest-900">{t}</h2>
              <p className="mt-2 leading-relaxed text-muted">{b}</p>
            </div>
          ))}
          <p className="text-sm text-subtle">
            Contact: <a href={`mailto:${site.email}`} className="font-medium text-forest-700 underline">{site.email}</a>
          </p>
        </div>
      </section>
    </>
  );
}

export const TechnologyPage = Technology;
export const SecurityPage = Security;
export const PrivacyPage = () => <Legal kind="privacy" />;
export const TermsPage = () => <Legal kind="terms" />;
