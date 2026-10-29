import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, ImagePlus } from 'lucide-react';
import { FieldError, Modal, buttonClass } from '../components/ui';
import type { PhotoQuality } from '../data/types';
import { latestPair } from '../lib/analysis';
import { DEMO_TODAY, addDays } from '../lib/dates';
import { uid, useDashboard } from './store';

interface FormState {
  zoneId: string;
  date: string;
  capturedById: string;
  method: string;
  quality: PhotoQuality;
  notes: string;
  ph: string;
  ec: string;
  temp: string;
  volume: string;
}

type Errors = Partial<Record<keyof FormState | 'file', string>>;

const ranges = {
  ph: { min: 3, max: 9, label: 'pH' },
  ec: { min: 0, max: 10, label: 'EC (mS/cm)' },
  temp: { min: 5, max: 40, label: 'Temperature (°C)' },
  volume: { min: 0, max: 100000, label: 'Volume (L/day)' },
} as const;

export function validateObservation(f: FormState): Errors {
  const e: Errors = {};
  if (!f.zoneId) e.zoneId = 'Choose a growing zone.';
  if (!f.date) e.date = 'Enter the observation date.';
  else if (f.date > DEMO_TODAY) e.date = 'Observation date cannot be in the future.';
  else if (f.date < addDays(DEMO_TODAY, -365)) e.date = 'Date must be within the last year.';
  if (!f.capturedById) e.capturedById = 'Select who captured the observation.';
  if (f.method.trim().length < 3) e.method = 'Describe the capture method (e.g. “Channel lift, plant 40”).';
  (Object.keys(ranges) as (keyof typeof ranges)[]).forEach((k) => {
    const v = f[k].trim();
    if (!v) return;
    const n = Number(v);
    if (Number.isNaN(n) || n < ranges[k].min || n > ranges[k].max) e[k] = `${ranges[k].label} must be between ${ranges[k].min} and ${ranges[k].max}.`;
  });
  return e;
}

export function ObservationModal({ open, zoneId, onClose }: { open: boolean; zoneId?: string; onClose: () => void }) {
  const { data, dispatch } = useDashboard();
  const blank = (): FormState => ({ zoneId: zoneId ?? '', date: DEMO_TODAY, capturedById: '', method: '', quality: 'good', notes: '', ph: '', ec: '', temp: '', volume: '' });
  const [form, setForm] = useState<FormState>(blank);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(blank());
      setFile(null);
      setErrors({});
      setDone(null);
    }
  }, [open, zoneId]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validateObservation(form);
    if (file && !file.type.startsWith('image/')) e.file = 'Please choose an image file.';
    else if (file && file.size > 15 * 1024 * 1024) e.file = 'Image must be smaller than 15 MB.';
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`o-${first}`)?.focus();
      return;
    }
    const zone = data.zones.find((z) => z.id === form.zoneId)!;
    const prev = latestPair(data, zone.id).current;
    // Sample image parameters are derived from the previous observation so the
    // simulated comparison stays meaningful; uploaded photos are displayed as-is.
    const image = {
      seed: zone.seed,
      density: prev ? Math.max(0.3, Math.min(1, prev.image.density + (Math.random() - 0.5) * 0.04)) : 0.85,
      browning: prev ? Math.max(0, Math.min(1, prev.image.browning + (Math.random() - 0.5) * 0.04)) : 0.08,
      quality: form.quality,
    };
    const id = uid(`${zone.id}-OB`);
    const num = (s: string) => (s.trim() ? Number(s) : undefined);
    const hasReading = [form.ph, form.ec, form.temp, form.volume].some((s) => s.trim());
    dispatch({
      type: 'addObservation',
      observation: {
        id,
        zoneId: zone.id,
        date: form.date,
        capturedById: form.capturedById,
        method: form.method.trim(),
        notes: form.notes.trim() || undefined,
        image,
        uploadedImageUrl: file ? URL.createObjectURL(file) : undefined,
      },
      reading: hasReading
        ? { id: uid(`${zone.id}-RD`), zoneId: zone.id, date: form.date, ph: num(form.ph), ecMsCm: num(form.ec), waterTempC: num(form.temp), volumeLPerDay: num(form.volume), source: 'Manual entry' }
        : undefined,
    });
    setDone(zone.id);
  };

  const fp = (k: keyof Errors) => ({
    id: `o-${k}`,
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `o-${k}-err` : undefined,
  });

  return (
    <Modal open={open} onClose={onClose} title="Log root observation" description="Record a root image and any measurements taken at the same time." size="lg">
      {done ? (
        <div className="py-8 text-center" role="status">
          <CheckCircle2 className="mx-auto h-10 w-10 text-forest-600" aria-hidden="true" />
          <p className="mt-3 font-display text-xl text-forest-900">Observation added to {done}</p>
          <p className="mt-1 text-sm text-muted">It now appears in the zone’s gallery and timeline. Stored in this browser only.</p>
          <div className="mt-6 flex justify-center gap-2">
            <button type="button" className={buttonClass('secondary')} onClick={() => { setForm(blank()); setFile(null); setDone(null); }}>
              Log another
            </button>
            <button type="button" className={buttonClass('primary')} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="o-zoneId">Growing zone *</label>
            <select className="field" value={form.zoneId} onChange={(e) => set('zoneId', e.target.value)} {...fp('zoneId')}>
              <option value="">Select zone…</option>
              {data.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.id} · {z.crop}
                </option>
              ))}
            </select>
            <FieldError id="o-zoneId-err" message={errors.zoneId} />
          </div>
          <div>
            <label className="label" htmlFor="o-date">Observation date *</label>
            <input type="date" className="field" max={DEMO_TODAY} value={form.date} onChange={(e) => set('date', e.target.value)} {...fp('date')} />
            <FieldError id="o-date-err" message={errors.date} />
          </div>
          <div>
            <label className="label" htmlFor="o-capturedById">Captured by *</label>
            <select className="field" value={form.capturedById} onChange={(e) => set('capturedById', e.target.value)} {...fp('capturedById')}>
              <option value="">Select team member…</option>
              {data.team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <FieldError id="o-capturedById-err" message={errors.capturedById} />
          </div>
          <div>
            <label className="label" htmlFor="o-method">Capture method *</label>
            <input className="field" placeholder="e.g. Channel lift, plant 40" value={form.method} onChange={(e) => set('method', e.target.value)} {...fp('method')} />
            <FieldError id="o-method-err" message={errors.method} />
          </div>
          <div className="sm:col-span-2">
            <span className="label">Root image</span>
            <label htmlFor="o-file" className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line bg-[#fffdf8] px-4 py-3 text-sm text-muted hover:border-sage-500 focus-within:outline focus-within:outline-2 focus-within:outline-forest-600">
              <ImagePlus className="h-5 w-5 text-forest-600" aria-hidden="true" />
              <span className="flex-1">{file ? file.name : 'Choose a photo (optional). Without one, a sample image is generated.'}</span>
              <input
                id="o-file"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setErrors((er) => ({ ...er, file: undefined }));
                }}
                aria-invalid={errors.file ? true : undefined}
                aria-describedby={errors.file ? 'o-file-err' : undefined}
              />
            </label>
            <FieldError id="o-file-err" message={errors.file} />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="label">Photo quality</legend>
            <div className="flex gap-4 text-sm">
              {(['good', 'poor'] as const).map((q) => (
                <label key={q} className="inline-flex items-center gap-2">
                  <input type="radio" name="quality" className="h-4 w-4 accent-forest-700" checked={form.quality === q} onChange={() => set('quality', q)} />
                  {q === 'good' ? 'Clear and in focus' : 'Hazy, dark or blurred'}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="o-notes">Notes</label>
            <textarea className="field min-h-20" value={form.notes} onChange={(e) => set('notes', e.target.value)} {...fp('notes')} />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="label">Measurements taken at the same time (optional)</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ['ph', 'pH', 'pH'],
                  ['ec', 'EC', 'mS/cm'],
                  ['temp', 'Solution temp.', '°C'],
                  ['volume', 'Volume', 'L/day'],
                ] as const
              ).map(([k, label, unit]) => (
                <div key={k}>
                  <label htmlFor={`o-${k}`} className="mb-1 block text-xs text-muted">
                    {label} <span className="font-mono">({unit})</span>
                  </label>
                  <input inputMode="decimal" className="field" value={form[k]} onChange={(e) => set(k, e.target.value)} {...fp(k)} />
                  <FieldError id={`o-${k}-err`} message={errors[k]} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-subtle">Leave blank anything you didn’t measure — blank values are shown as “not supplied”, never estimated.</p>
          </fieldset>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className={buttonClass('ghost')} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={buttonClass('primary')}>
              Save observation
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
