import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, ClipboardList, Droplets, Images, NotebookPen, Plus } from 'lucide-react';
import { ComparisonSlider } from '../components/ComparisonSlider';
import { LineChart } from '../components/LineChart';
import { RootImage } from '../components/RootImage';
import { Avatar, EmptyState, FieldError, InfoTip, PriorityBadge, buttonClass } from '../components/ui';
import type { Priority } from '../data/types';
import {
  measurementDefs,
  memberName,
  summariseObservation,
  suppliedKeys,
  zoneInspections,
  zoneObservations,
  zoneQualityIssues,
  zoneReadings,
} from '../lib/analysis';
import { DEMO_TODAY, formatDate, formatShort } from '../lib/dates';
import { usePageMeta } from '../lib/usePageMeta';
import NotFound from '../pages/NotFound';
import { PageHeader, QualityChips, ReadingsTable, SummaryCard } from './parts';
import { uid, useDashboard } from './store';
import { useDashboardUI } from './uiContext';

function Section({ title, Icon, children, aside }: { title: string; Icon: typeof Camera; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-sans text-sm font-semibold text-forest-900">
          <Icon className="h-4 w-4 text-forest-600" aria-hidden="true" /> {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function ZoneDetail() {
  const { zoneId } = useParams();
  const { data, dispatch } = useDashboard();
  const ui = useDashboardUI();
  const zone = data.zones.find((z) => z.id === zoneId);
  usePageMeta(zone ? `${zone.id} · ${zone.crop}` : 'Zone not found');
  const observations = zone ? zoneObservations(data, zone.id) : [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');
  const [noteErrors, setNoteErrors] = useState<{ text?: string; author?: string }>({});

  if (!zone) return <NotFound inDashboard />;

  const readings = zoneReadings(data, zone.id);
  const inspections = zoneInspections(data, zone.id);
  const notes = data.notes.filter((n) => n.zoneId === zone.id).sort((a, b) => b.date.localeCompare(a.date));
  const selIdx = selectedId ? observations.findIndex((o) => o.id === selectedId) : observations.length - 1;
  const current = observations[selIdx];
  const previous = selIdx > 0 ? observations[selIdx - 1] : undefined;
  const summary = current ? summariseObservation(current, previous, readings.filter((r) => r.date <= current.date)) : null;
  const keys = suppliedKeys(readings);

  const addNote = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof noteErrors = {};
    if (!noteAuthor) errs.author = 'Choose who is writing this note.';
    if (noteText.trim().length < 5) errs.text = 'Notes need at least 5 characters.';
    setNoteErrors(errs);
    if (Object.keys(errs).length) return;
    dispatch({ type: 'addNote', note: { id: uid('N'), zoneId: zone.id, date: DEMO_TODAY, authorId: noteAuthor, text: noteText.trim() } });
    setNoteText('');
  };

  return (
    <>
      <Link to="/dashboard/zones" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-forest-900">
        <ArrowLeft className="h-3.5 w-3.5" /> All zones
      </Link>
      <PageHeader
        title={`${zone.id} · ${zone.crop}`}
        description={`${zone.cultivar} · ${zone.system} · ${zone.name} · ${zone.areaM2.toLocaleString()} m² · ${zone.plantCount.toLocaleString()} plants · Grower: ${memberName(data, zone.assignedGrowerId)}`}
        actions={
          <>
            <button type="button" className={buttonClass('secondary', 'px-3 py-2')} onClick={() => ui.openObservationForm(zone.id)}>
              <Plus className="h-4 w-4" /> Log observation
            </button>
            {current && (
              <button type="button" className={buttonClass('primary', 'px-3 py-2')} onClick={() => ui.openForObservation(current.id)}>
                <ClipboardList className="h-4 w-4" /> Open inspection
              </button>
            )}
          </>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="zone-prio" className="text-xs font-medium text-muted">
            Priority
          </label>
          <select id="zone-prio" className="field w-auto py-1.5" value={zone.priority} onChange={(e) => dispatch({ type: 'setZonePriority', zoneId: zone.id, priority: e.target.value as Priority })}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <PriorityBadge priority={zone.priority} />
        </div>
        <QualityChips issues={zoneQualityIssues(data, zone)} />
      </div>

      {observations.length === 0 ? (
        <EmptyState icon={<Camera className="h-8 w-8" />} title="No observations yet" action={<button className={buttonClass('primary')} onClick={() => ui.openObservationForm(zone.id)}>Log the first observation</button>}>
          Root observations for this zone will appear here.
        </EmptyState>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0 space-y-5">
            <Section
              title="Previous vs current"
              Icon={Images}
              aside={
                <label className="inline-flex items-center gap-2 text-xs text-muted">
                  <input type="checkbox" className="h-4 w-4 accent-forest-700" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} />
                  Outline visible differences
                </label>
              }
            >
              {current && previous ? (
                <ComparisonSlider key={current.id} previous={previous} current={current} medium={zone.medium} highlight={highlight} />
              ) : current ? (
                <div className="overflow-hidden rounded-xl">
                  <RootImage params={current.image} uploadedUrl={current.uploadedImageUrl} medium={zone.medium} label={`Observation ${formatDate(current.date)}`} showScale />
                </div>
              ) : null}
              {summary && (
                <div className="mt-4">
                  <SummaryCard summary={summary} />
                </div>
              )}
            </Section>

            <Section title="Root image gallery" Icon={Camera} aside={<span className="text-xs text-muted">Select an image to compare it with the one before it</span>}>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {observations.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(o.id)}
                      aria-pressed={o.id === current?.id}
                      className={`block w-full overflow-hidden rounded-lg ring-offset-2 ring-offset-paper ${o.id === current?.id ? 'ring-2 ring-forest-700' : 'hover:ring-2 hover:ring-sage-300'}`}
                    >
                      <RootImage params={o.image} uploadedUrl={o.uploadedImageUrl} medium={zone.medium} label={`Observation ${formatDate(o.date)}`} />
                      <span className="tnum block bg-paper-2 py-1 text-center text-[11px] text-muted">
                        {formatShort(o.date)}
                        {o.image.quality === 'poor' && <span className="ml-1 text-amber-600">· poor</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Section>

            <Section
              title="Irrigation measurements"
              Icon={Droplets}
              aside={<InfoTip content="Readings are shown only when supplied in the sample dataset. No live sensor connection." label="About irrigation measurements" />}
            >
              {keys.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {keys.map((k) => {
                    const m = measurementDefs.find((d) => d.key === k)!;
                    return (
                      <div key={k} className="min-w-0">
                        <p className="mb-1 text-xs font-medium text-ink">
                          {m.label} <span className="font-mono text-subtle">({m.unit})</span>
                        </p>
                        <LineChart points={readings.map((r) => ({ date: r.date, value: r[k] }))} label={m.label} unit={m.unit} digits={m.digits} height={120} />
                      </div>
                    );
                  })}
                </div>
              ) : null}
              <div className="mt-5">
                <ReadingsTable readings={readings} freshnessDays={data.settings.freshnessDays} limit={6} />
              </div>
              {measurementDefs.filter((m) => !keys.includes(m.key)).length > 0 && (
                <p className="mt-3 text-xs text-subtle">
                  Not supplied for this zone: {measurementDefs.filter((m) => !keys.includes(m.key)).map((m) => m.label).join(', ')}.
                </p>
              )}
            </Section>
          </div>

          <div className="min-w-0 space-y-5">
            <Section title="Observation timeline" Icon={Images}>
              <ol className="relative space-y-4 border-l border-line pl-5">
                {[...observations].reverse().map((o) => {
                  const incomplete = !o.capturedById || !o.method || !o.notes;
                  return (
                    <li key={o.id} className="relative">
                      <span className={`absolute -left-[1.6rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-paper ${o.id === current?.id ? 'bg-forest-700' : 'bg-sage-500'}`} />
                      <button type="button" onClick={() => setSelectedId(o.id)} className="text-left">
                        <p className="tnum text-sm font-medium text-forest-900">{formatDate(o.date)}</p>
                      </button>
                      <p className="text-xs text-muted">
                        {o.method ?? <span className="text-amber-600">Method not recorded</span>} · {o.capturedById ? memberName(data, o.capturedById) : <span className="text-amber-600">capturer not recorded</span>}
                      </p>
                      {o.notes ? <p className="mt-1 text-sm text-ink">{o.notes}</p> : <p className="mt-1 text-sm italic text-amber-600">No notes recorded</p>}
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {o.image.quality === 'poor' && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">Poor-quality photo</span>}
                        {incomplete && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">Incomplete record</span>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Section>

            <Section title="Grower notes" Icon={NotebookPen}>
              <form onSubmit={addNote} noValidate className="mb-4 space-y-2">
                <label htmlFor="note-text" className="sr-only">New note</label>
                <textarea
                  id="note-text"
                  className="field min-h-20"
                  placeholder="Add a note for this zone…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  aria-invalid={noteErrors.text ? true : undefined}
                  aria-describedby={noteErrors.text ? 'note-text-err' : undefined}
                />
                <FieldError id="note-text-err" message={noteErrors.text} />
                <div className="flex gap-2">
                  <label htmlFor="note-author" className="sr-only">Author</label>
                  <select
                    id="note-author"
                    className="field flex-1"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    aria-invalid={noteErrors.author ? true : undefined}
                    aria-describedby={noteErrors.author ? 'note-author-err' : undefined}
                  >
                    <option value="">Author…</option>
                    {data.team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className={buttonClass('primary', 'px-3 py-2')}>
                    Add note
                  </button>
                </div>
                <FieldError id="note-author-err" message={noteErrors.author} />
              </form>
              {notes.length ? (
                <ul className="space-y-3">
                  {notes.map((n) => {
                    const author = data.team.find((m) => m.id === n.authorId);
                    return (
                      <li key={n.id} className="flex gap-3">
                        <Avatar initials={author?.initials ?? '?'} />
                        <div>
                          <p className="text-xs text-muted">
                            <span className="font-medium text-ink">{author?.name ?? 'Unknown'}</span> · {formatShort(n.date)}
                          </p>
                          <p className="text-sm text-ink">{n.text}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted">No notes yet.</p>
              )}
            </Section>

            <Section title="Inspection history" Icon={ClipboardList}>
              {inspections.length ? (
                <ul className="divide-y divide-line">
                  {inspections.map((i) => (
                    <li key={i.id}>
                      <button type="button" onClick={() => ui.openInspection(i.id)} className="w-full py-3 text-left hover:bg-paper-2/40">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-subtle">{i.id} · opened {formatShort(i.createdAt)}</span>
                          <span className={`text-xs font-medium ${i.state === 'complete' ? 'text-forest-600' : 'text-amber-600'}`}>
                            {i.state === 'complete' ? `Complete ${i.completedAt ? formatShort(i.completedAt) : ''}` : i.state === 'in_progress' ? 'In progress' : 'Open'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-ink">{i.finding ? i.finding.category : i.reason}</p>
                        <p className="text-xs text-muted">{memberName(data, i.assigneeId)}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No inspections recorded for this zone.</p>
              )}
            </Section>
          </div>
        </div>
      )}
    </>
  );
}
