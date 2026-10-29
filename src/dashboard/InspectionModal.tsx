import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ComparisonSlider } from '../components/ComparisonSlider';
import { RootImage } from '../components/RootImage';
import { Avatar, FieldError, Modal, PriorityBadge, buttonClass } from '../components/ui';
import { findingCategories, type FindingCategory, type Priority } from '../data/types';
import { memberName, summariseObservation, zoneObservations, zoneQualityIssues, zoneReadings } from '../lib/analysis';
import { formatDate, formatShort } from '../lib/dates';
import { QualityChips, ReadingsTable, SummaryCard } from './parts';
import { useDashboard } from './store';

const stepsDef = ['Review evidence', 'Notes & assignment', 'Record finding'] as const;

export function InspectionModal({ inspectionId, onClose }: { inspectionId: string | null; onClose: () => void }) {
  const { data, dispatch } = useDashboard();
  const insp = data.inspections.find((i) => i.id === inspectionId);
  const [step, setStep] = useState(0);
  const [note, setNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');
  const [noteError, setNoteError] = useState<string>();
  const [category, setCategory] = useState<FindingCategory | ''>('');
  const [detail, setDetail] = useState('');
  const [zonePriority, setZonePriority] = useState<Priority>('low');
  const [errors, setErrors] = useState<{ assignee?: string; category?: string; detail?: string }>({});
  const [highlight, setHighlight] = useState(true);

  useEffect(() => {
    if (!insp) return;
    setStep(0);
    setNote('');
    setNoteError(undefined);
    setErrors({});
    setCategory(insp.finding?.category ?? '');
    setDetail(insp.finding?.detail ?? '');
    setZonePriority('low');
    // reset only when a different inspection is opened
  }, [inspectionId]);

  if (!insp) return null;
  const zone = data.zones.find((z) => z.id === insp.zoneId)!;
  const obs = zoneObservations(data, insp.zoneId);
  const idx = obs.findIndex((o) => o.id === insp.observationId);
  const current = obs[idx];
  const previous = idx > 0 ? obs[idx - 1] : undefined;
  const readings = zoneReadings(data, insp.zoneId).filter((r) => !current || r.date <= current.date);
  const summary = current ? summariseObservation(current, previous, readings) : null;
  const complete = insp.state === 'complete';
  const inspectors = data.team.filter((m) => m.canInspect);

  const addNote = () => {
    if (note.trim().length < 3) {
      setNoteError('Write a short note before adding it.');
      return;
    }
    dispatch({ type: 'addInspectionNote', id: insp.id, text: note.trim(), authorId: noteAuthor || undefined });
    setNote('');
    setNoteError(undefined);
  };

  const saveFinding = (): boolean => {
    const e: typeof errors = {};
    if (!insp.assigneeId) e.assignee = 'Assign an inspector before completing.';
    if (!category) e.category = 'Choose a finding.';
    if (detail.trim().length < 10) e.detail = 'Describe what was checked and seen (at least 10 characters).';
    setErrors(e);
    if (e.assignee) setStep(1);
    if (Object.keys(e).length) return false;
    dispatch({ type: 'recordFinding', id: insp.id, category: category as FindingCategory, detail: detail.trim() });
    return true;
  };

  return (
    <Modal open={!!insp} onClose={onClose} size="xl" title={`${insp.id} · ${zone.id} ${zone.crop}`} description={insp.reason}>
      <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-muted">
        <PriorityBadge priority={insp.priority} />
        <span>Opened {formatDate(insp.createdAt)}</span>
        <span>· Inspector: <span className="font-medium text-ink">{memberName(data, insp.assigneeId)}</span></span>
        {complete && (
          <span className="inline-flex items-center gap-1 font-medium text-forest-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed {insp.completedAt && formatShort(insp.completedAt)}
          </span>
        )}
      </div>

      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Inspection steps">
        {stepsDef.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={step === i ? 'step' : undefined}
              className={`w-full rounded-lg border px-2 py-2 text-left text-xs transition-colors sm:px-3 ${step === i ? 'border-forest-700 bg-forest-800 text-paper' : 'border-line text-muted hover:border-sage-500'}`}
            >
              <span className="font-mono">{i + 1}</span> <span className="font-medium">{s}</span>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div>
            {current && previous ? (
              <>
                <ComparisonSlider previous={previous} current={current} medium={zone.medium} highlight={highlight} />
                <label className="mt-1 inline-flex items-center gap-2 text-xs text-muted">
                  <input type="checkbox" className="h-4 w-4 accent-forest-700" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} />
                  Outline visible differences
                </label>
              </>
            ) : current ? (
              <div className="overflow-hidden rounded-xl">
                <RootImage params={current.image} uploadedUrl={current.uploadedImageUrl} medium={zone.medium} label="Flagged observation" showScale />
              </div>
            ) : (
              <p className="text-sm text-muted">The linked observation is no longer available.</p>
            )}
            {current && (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-subtle">Captured</dt>
                  <dd>{formatDate(current.date)} · {current.capturedById ? memberName(data, current.capturedById) : <span className="text-amber-600">not recorded</span>}</dd>
                </div>
                <div>
                  <dt className="text-xs text-subtle">Method</dt>
                  <dd>{current.method ?? <span className="text-amber-600">not recorded</span>}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-subtle">Observation notes</dt>
                  <dd>{current.notes ?? <span className="text-amber-600">No notes recorded</span>}</dd>
                </div>
              </dl>
            )}
          </div>
          <div className="min-w-0 space-y-4">
            {summary && <SummaryCard summary={summary} />}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">Data quality</p>
              <QualityChips issues={zoneQualityIssues(data, zone)} />
            </div>
          </div>
          <div className="min-w-0 lg:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">Supplied irrigation readings up to this observation</p>
            <ReadingsTable readings={readings} freshnessDays={data.settings.freshnessDays} limit={5} />
            <Link to={`/dashboard/zones/${zone.id}`} onClick={onClose} className="mt-3 inline-block text-xs font-semibold text-forest-700 hover:underline">
              Open full zone record →
            </Link>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label htmlFor="insp-assignee" className="label">Assigned inspector</label>
            <select
              id="insp-assignee"
              className="field"
              disabled={complete}
              value={insp.assigneeId ?? ''}
              onChange={(e) => {
                dispatch({ type: 'assignInspection', id: insp.id, assigneeId: e.target.value || undefined });
                setErrors((er) => ({ ...er, assignee: undefined }));
              }}
              aria-invalid={errors.assignee ? true : undefined}
              aria-describedby={errors.assignee ? 'insp-assignee-err' : undefined}
            >
              <option value="">Unassigned</option>
              {inspectors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.role}
                </option>
              ))}
            </select>
            <FieldError id="insp-assignee-err" message={errors.assignee} />
            <p className="mt-2 text-xs text-subtle">Assigning an inspector moves the inspection to “In progress”.</p>

            <div className="mt-6">
              <label htmlFor="insp-note" className="label">Add a note</label>
              <textarea
                id="insp-note"
                className="field min-h-24"
                disabled={complete}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Pulled three plants from channel 1 and 2 for comparison."
                aria-invalid={noteError ? true : undefined}
                aria-describedby={noteError ? 'insp-note-err' : undefined}
              />
              <FieldError id="insp-note-err" message={noteError} />
              <div className="mt-2 flex gap-2">
                <label htmlFor="insp-note-author" className="sr-only">Note author</label>
                <select id="insp-note-author" className="field flex-1" disabled={complete} value={noteAuthor} onChange={(e) => setNoteAuthor(e.target.value)}>
                  <option value="">Author (optional)</option>
                  {data.team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <button type="button" className={buttonClass('secondary', 'px-3 py-2')} onClick={addNote} disabled={complete}>
                  Add note
                </button>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">Inspection notes</p>
            {insp.notes.length ? (
              <ul className="space-y-3">
                {insp.notes.map((n) => {
                  const a = data.team.find((m) => m.id === n.authorId);
                  return (
                    <li key={n.id} className="flex gap-3">
                      <Avatar initials={a?.initials ?? '—'} />
                      <div>
                        <p className="text-xs text-muted">
                          <span className="font-medium text-ink">{a?.name ?? 'Unattributed'}</span> · {formatShort(n.date)}
                        </p>
                        <p className="text-sm">{n.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed border-line p-4 text-sm text-muted">No notes yet. Notes help the next person understand what was checked.</p>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (saveFinding()) dispatch({ type: 'completeInspection', id: insp.id, zonePriority });
            }}
          >
            <fieldset disabled={complete} className="space-y-4">
              <div>
                <label htmlFor="insp-cat" className="label">Finding *</label>
                <select
                  id="insp-cat"
                  className="field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FindingCategory)}
                  aria-invalid={errors.category ? true : undefined}
                  aria-describedby={errors.category ? 'insp-cat-err' : undefined}
                >
                  <option value="">Select a finding…</option>
                  {findingCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <FieldError id="insp-cat-err" message={errors.category} />
              </div>
              <div>
                <label htmlFor="insp-detail" className="label">What was checked and seen *</label>
                <textarea
                  id="insp-detail"
                  className="field min-h-28"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  aria-invalid={errors.detail ? true : undefined}
                  aria-describedby={errors.detail ? 'insp-detail-err' : 'insp-detail-hint'}
                />
                <p id="insp-detail-hint" className="mt-1 text-xs text-subtle">Record observations and actions taken. Diagnosis should come from appropriate testing or an adviser.</p>
                <FieldError id="insp-detail-err" message={errors.detail} />
              </div>
              <div>
                <label htmlFor="insp-prio" className="label">Zone priority after this inspection</label>
                <select id="insp-prio" className="field" value={zonePriority} onChange={(e) => setZonePriority(e.target.value as Priority)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              {errors.assignee && <FieldError id="insp-assign-summary" message={errors.assignee} />}
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" className={buttonClass('secondary')} onClick={saveFinding}>
                  Save finding
                </button>
                <button type="submit" className={buttonClass('primary')}>
                  <CheckCircle2 className="h-4 w-4" /> Mark inspection complete
                </button>
              </div>
            </fieldset>
          </form>
          <div className="rounded-xl bg-paper-2 p-5 text-sm">
            {complete ? (
              <div role="status">
                <p className="flex items-center gap-2 font-semibold text-forest-700">
                  <CheckCircle2 className="h-5 w-5" /> Inspection complete
                </p>
                <p className="mt-3 text-xs text-subtle">Finding</p>
                <p className="font-medium">{insp.finding?.category}</p>
                <p className="mt-2 text-ink/80">{insp.finding?.detail}</p>
                <p className="mt-3 text-xs text-muted">
                  Completed {insp.completedAt && formatDate(insp.completedAt)} by {memberName(data, insp.assigneeId)}. Zone priority is now <strong>{zone.priority}</strong>.
                </p>
              </div>
            ) : (
              <>
                <p className="font-semibold text-forest-900">Before completing</p>
                <ul className="mt-3 space-y-2">
                  {[
                    ['Inspector assigned', !!insp.assigneeId],
                    ['Evidence reviewed', true],
                    ['Finding selected', !!category],
                    ['Details recorded', detail.trim().length >= 10],
                  ].map(([label, ok]) => (
                    <li key={label as string} className={`flex items-center gap-2 ${ok ? 'text-forest-700' : 'text-muted'}`}>
                      <CheckCircle2 className={`h-4 w-4 ${ok ? '' : 'opacity-30'}`} aria-hidden="true" /> {label}
                      <span className="sr-only">{ok ? '(done)' : '(to do)'}</span>
                    </li>
                  ))}
                </ul>
                {insp.finding && <p className="mt-4 text-xs text-subtle">Saved finding: {insp.finding.category}</p>}
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <button type="button" className={buttonClass('ghost', 'px-3')} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step < 2 ? (
          <button type="button" className={buttonClass('secondary', 'px-3')} onClick={() => setStep((s) => s + 1)}>
            Next: {stepsDef[step + 1]} <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" className={buttonClass('ghost', 'px-3')} onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </Modal>
  );
}
