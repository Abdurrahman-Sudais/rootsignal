import { useState, type FormEvent } from 'react';
import { CheckCircle2, PlugZap, RotateCcw } from 'lucide-react';
import { FieldError, InfoTip, Modal, buttonClass } from '../components/ui';
import { defaultSettings } from '../data/greenhouse';
import { measurementDefs } from '../lib/analysis';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHeader } from './parts';
import { useDashboard } from './store';

export default function Settings() {
  usePageMeta('Settings');
  const { data, dispatch } = useDashboard();
  const [form, setForm] = useState({
    organisation: data.settings.organisation,
    site: data.settings.site,
    freshnessDays: String(data.settings.freshnessDays),
    observationIntervalDays: String(data.settings.observationIntervalDays),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (!form.organisation.trim()) er.organisation = 'Organisation name is required.';
    if (!form.site.trim()) er.site = 'Site name is required.';
    const f = Number(form.freshnessDays);
    if (!Number.isInteger(f) || f < 1 || f > 30) er.freshnessDays = 'Enter a whole number of days between 1 and 30.';
    const o = Number(form.observationIntervalDays);
    if (!Number.isInteger(o) || o < 1 || o > 60) er.observationIntervalDays = 'Enter a whole number of days between 1 and 60.';
    setErrors(er);
    if (Object.keys(er).length) return;
    dispatch({ type: 'updateSettings', settings: { organisation: form.organisation.trim(), site: form.site.trim(), freshnessDays: f, observationIntervalDays: o } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const field = (k: keyof typeof form, label: string, extra?: React.ReactNode, type = 'text') => (
    <div>
      <label htmlFor={`s-${k}`} className="label">
        <span className="inline-flex items-center gap-1">
          {label} {extra}
        </span>
      </label>
      <input
        id={`s-${k}`}
        type={type}
        className="field"
        value={form[k]}
        onChange={(e) => {
          setForm((s) => ({ ...s, [k]: e.target.value }));
          setErrors((er) => ({ ...er, [k]: undefined }));
        }}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={errors[k] ? `s-${k}-err` : undefined}
      />
      <FieldError id={`s-${k}-err`} message={errors[k]} />
    </div>
  );

  return (
    <>
      <PageHeader title="Settings" description="Demo settings are stored in this browser only." />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <form noValidate onSubmit={submit} className="card space-y-5 p-5">
          <h2 className="font-sans text-sm font-semibold text-forest-900">Organisation &amp; data-quality thresholds</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('organisation', 'Organisation')}
            {field('site', 'Site name')}
            {field('freshnessDays', 'Reading freshness (days)', <InfoTip content="Readings older than this are flagged as outdated." />, 'number')}
            {field('observationIntervalDays', 'Observation interval (days)', <InfoTip content="Zones without an observation in this many days are flagged as overdue." />, 'number')}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className={buttonClass('primary')}>
              Save settings
            </button>
            {saved && (
              <span role="status" className="inline-flex items-center gap-1 text-sm text-forest-700">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        </form>
        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="font-sans text-sm font-semibold text-forest-900">Measurement units</h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {measurementDefs.map((m) => (
                <li key={m.key} className="flex justify-between py-2">
                  <span>{m.label}</span>
                  <span className="font-mono text-muted">{m.unit}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-sans text-sm font-semibold text-forest-900">
              <PlugZap className="h-4 w-4 text-forest-600" /> Integrations
            </h2>
            <p className="mt-2 text-sm text-muted">Sensor feeds, climate computers and fertigation controllers are not connected in this demo. In production these would be scoped per site.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {['Climate computer export', 'Nutrient dosing controller', 'Water-quality probes'].map((i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                  {i} <span className="text-xs text-subtle">Not connected</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="font-sans text-sm font-semibold text-forest-900">Sample data</h2>
            <p className="mt-2 text-sm text-muted">Restore Greenhouse North to its original sample state. This removes any observations, notes and inspection changes you have made.</p>
            <button type="button" className={buttonClass('secondary', 'mt-3')} onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-4 w-4" /> Reset sample data
            </button>
          </section>
        </div>
      </div>
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset sample data?" size="md">
        <p className="text-sm text-muted">Your changes in this browser will be replaced with the original sample dataset.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={buttonClass('ghost')} onClick={() => setConfirmReset(false)}>
            Cancel
          </button>
          <button
            type="button"
            className={buttonClass('primary')}
            onClick={() => {
              dispatch({ type: 'reset' });
              setConfirmReset(false);
              setForm({
                organisation: defaultSettings.organisation,
                site: defaultSettings.site,
                freshnessDays: String(defaultSettings.freshnessDays),
                observationIntervalDays: String(defaultSettings.observationIntervalDays),
              });
            }}
          >
            Reset
          </button>
        </div>
      </Modal>
    </>
  );
}
