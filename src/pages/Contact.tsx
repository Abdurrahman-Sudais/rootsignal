import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, MessageSquare, Users } from 'lucide-react';
import { FieldError, buttonClass } from '../components/ui';
import { plans } from '../config/pricing';
import { FOUNDERS, site } from '../config/site';
import { hubspotConfig, leadPayload } from '../lib/lead';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHero } from './shared';

interface FormState {
  name: string;
  email: string;
  company: string;
  operation: string;
  zones: string;
  plan: string;
  message: string;
  consent: boolean;
  marketing: boolean;
  website: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const operations = ['Hydroponic farm', 'Greenhouse operation', 'Commercial nursery', 'Vertical farm', 'Research / trials', 'Other'];

export function validateContact(f: FormState): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address.';
  if (!f.company.trim()) e.company = 'Please enter your company or farm name.';
  if (!f.operation) e.operation = 'Please choose the type of operation.';
  if (f.zones && (!/^\d+$/.test(f.zones) || Number(f.zones) < 1 || Number(f.zones) > 10000)) e.zones = 'Enter a whole number between 1 and 10,000.';
  if (f.message.trim().length < 20) e.message = 'Please tell us a little more (at least 20 characters).';
  if (!f.consent) e.consent = 'Please confirm we may contact you about this enquiry.';
  return e;
}

export default function Contact() {
  usePageMeta('Contact', `Contact Rootsignal at ${site.email} to discuss root-zone monitoring and inspection records for your operation.`);
  const [params] = useSearchParams();
  const initialPlan = plans.some((p) => p.id === params.get('plan')) ? params.get('plan')! : '';
  const enquiryType = params.get('type') === 'demo' ? 'demo' : 'general';
  const [form, setForm] = useState<FormState>({ name: '', email: '', company: '', operation: '', zones: '', plan: initialPlan, message: '', consent: false, marketing: false, website: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<null | 'hubspot' | 'local'>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const hubspot = hubspotConfig();

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validateContact(form);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    if (form.website) {
      // Honeypot filled in: pretend success, send nothing.
      setSent('local');
      return;
    }
    setSendError('');
    if (hubspot) {
      setSending(true);
      try {
        const res = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${hubspot.portalId}/${hubspot.formGuid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadPayload({ ...form, enquiryType }, { pageUri: location.href.split('#')[0] ?? location.href, pageName: document.title }, hubspot)),
        });
        if (!res.ok) throw new Error(String(res.status));
        setSent('hubspot');
      } catch {
        setSendError(`We couldn’t send your request just now. Please try again, or email ${site.email}.`);
      } finally {
        setSending(false);
      }
      return;
    }
    try {
      const prev = JSON.parse(localStorage.getItem('rootsignal-enquiries') ?? '[]') as unknown[];
      const { website: _ignored, ...rest } = form;
      localStorage.setItem('rootsignal-enquiries', JSON.stringify([...prev, { ...rest, enquiryType, at: new Date().toISOString() }]));
    } catch {
      /* storage unavailable — the mailto below still works */
    }
    setSent('local');
  };

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`${enquiryType === 'demo' ? 'Early access' : 'Rootsignal enquiry'} — ${form.company}`)}&body=${encodeURIComponent(
    `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\nOperation: ${form.operation}\nZones: ${form.zones || '—'}\nPlan: ${form.plan || 'Not sure yet'}\n\n${form.message}`,
  )}`;

  const fieldProps = (k: keyof FormState) => ({
    id: `c-${k}`,
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `c-${k}-err` : undefined,
  });

  return (
    <>
      <PageHero eyebrow={enquiryType === 'demo' ? 'Request early access' : 'Contact'} title={enquiryType === 'demo' ? 'Pilot Rootsignal on one of your sites.' : 'Tell us about your operation.'}>
        Whether you run a single greenhouse or several sites, one of the founders will reply personally to talk through how your team records root checks today.
      </PageHero>
      <section className="py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <aside className="space-y-6">
            <div className="card p-6">
              <Mail className="h-5 w-5 text-forest-600" aria-hidden="true" />
              <h2 className="mt-3 text-lg text-forest-900">Email</h2>
              <a href={`mailto:${site.email}`} className="mt-1 block text-sm font-medium text-forest-700 underline decoration-sage-300 underline-offset-4">
                {site.email}
              </a>
            </div>
            <div className="card p-6">
              <MessageSquare className="h-5 w-5 text-forest-600" aria-hidden="true" />
              <h2 className="mt-3 text-lg text-forest-900">What to include</h2>
              <ul className="mt-2 space-y-1.5 text-sm text-muted">
                <li>— Crops and growing systems</li>
                <li>— Approximate number of zones and sites</li>
                <li>— How you record root checks and readings today</li>
              </ul>
            </div>
            <div className="card p-6">
              <Users className="h-5 w-5 text-forest-600" aria-hidden="true" />
              <h2 className="mt-3 text-lg text-forest-900">Who replies</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {FOUNDERS.map((f) => (
                  <li key={f.name}>
                    <span className="font-medium text-forest-900">{f.name}</span> <span className="text-muted">· {f.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="card relative min-w-0 p-6 sm:p-8">
            {sent ? (
              <div className="py-10 text-center" role="status">
                <CheckCircle2 className="mx-auto h-10 w-10 text-forest-600" aria-hidden="true" />
                <h2 className="mt-4 text-2xl text-forest-900">Thanks, {form.name.split(' ')[0]}.</h2>
                {sent === 'hubspot' ? (
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted">Your request has been sent. One of the founders will reply to {form.email} personally.</p>
                ) : (
                  <>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted">Your request is saved in this browser. To make sure it reaches us, send it as an email — it’s pre-filled with what you entered.</p>
                    <a className={buttonClass('primary', 'mt-6')} href={mailto}>
                      <Mail className="h-4 w-4" aria-hidden="true" /> Email {site.email}
                    </a>
                  </>
                )}
                <div>
                  <button type="button" className={buttonClass('secondary', 'mt-4')} onClick={() => setSent(null)}>
                    Edit request
                  </button>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="c-name">Full name *</label>
                  <input className="field" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} {...fieldProps('name')} />
                  <FieldError id="c-name-err" message={errors.name} />
                </div>
                <div>
                  <label className="label" htmlFor="c-email">Work email *</label>
                  <input className="field" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} {...fieldProps('email')} />
                  <FieldError id="c-email-err" message={errors.email} />
                </div>
                <div>
                  <label className="label" htmlFor="c-company">Company or farm *</label>
                  <input className="field" autoComplete="organization" value={form.company} onChange={(e) => set('company', e.target.value)} {...fieldProps('company')} />
                  <FieldError id="c-company-err" message={errors.company} />
                </div>
                <div>
                  <label className="label" htmlFor="c-operation">Type of operation *</label>
                  <select className="field" value={form.operation} onChange={(e) => set('operation', e.target.value)} {...fieldProps('operation')}>
                    <option value="">Select…</option>
                    {operations.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <FieldError id="c-operation-err" message={errors.operation} />
                </div>
                <div>
                  <label className="label" htmlFor="c-zones">Approximate number of zones</label>
                  <input className="field" inputMode="numeric" value={form.zones} onChange={(e) => set('zones', e.target.value)} {...fieldProps('zones')} />
                  <FieldError id="c-zones-err" message={errors.zones} />
                </div>
                <div>
                  <label className="label" htmlFor="c-plan">Plan of interest</label>
                  <select className="field" value={form.plan} onChange={(e) => set('plan', e.target.value)} {...fieldProps('plan')}>
                    <option value="">Not sure yet</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="c-message">How do you record root checks today? *</label>
                  <textarea className="field min-h-32" value={form.message} onChange={(e) => set('message', e.target.value)} {...fieldProps('message')} />
                  <FieldError id="c-message-err" message={errors.message} />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-start gap-2.5 text-sm text-muted">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 accent-forest-700" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} {...fieldProps('consent')} />
                    I agree that Rootsignal may contact me about this enquiry.
                  </label>
                  <FieldError id="c-consent-err" message={errors.consent} />
                  <label className="mt-3 flex items-start gap-2.5 text-sm text-muted">
                    <input type="checkbox" id="c-marketing" className="mt-0.5 h-4 w-4 accent-forest-700" checked={form.marketing} onChange={(e) => set('marketing', e.target.checked)} />
                    Send me occasional product updates (optional).
                  </label>
                  <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="c-website">Website</label>
                    <input id="c-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  {sendError && (
                    <p className="mb-3 text-sm font-medium text-rust-600" role="alert">
                      {sendError}
                    </p>
                  )}
                  <button type="submit" className={buttonClass('primary')} disabled={sending}>
                    {sending ? 'Sending…' : enquiryType === 'demo' ? 'Request early access' : 'Send enquiry'}
                  </button>
                  <p className="mt-3 text-xs text-subtle">
                    {hubspot ? 'Sent securely to our CRM (HubSpot) so a founder can reply.' : 'Saved in your browser; you’ll then be offered a pre-filled email — nothing is sent until you send it.'} See the <Link to="/privacy" className="underline">privacy notice</Link>.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
