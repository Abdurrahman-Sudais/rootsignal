import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Info, MessageSquare } from 'lucide-react';
import { EXAMPLE_QUESTIONS, answer, type AssistantAnswer } from './assistant';
import { useDashboard } from './store';
import { buttonClass } from '../components/ui';

/** “Ask about this site” — answers from the demo records and lists the records it used. */
export function AssistantPanel() {
  const { data } = useDashboard();
  const [q, setQ] = useState('');
  const [asked, setAsked] = useState<{ q: string; a: AssistantAnswer } | null>(null);
  const ask = (question: string) => {
    if (!question.trim()) return;
    setAsked({ q: question.trim(), a: answer(question, data) });
    setQ('');
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(q);
  };
  return (
    <section className="card overflow-hidden" aria-labelledby="assistant-title">
      <header className="flex items-center gap-2 border-b border-line bg-forest-900 px-4 py-3 text-root">
        <Bot className="h-4 w-4 text-sage-300" aria-hidden="true" />
        <h2 id="assistant-title" className="text-sm font-semibold">Ask about this site</h2>
        <span className="rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-root/70">Simulated assistant</span>
      </header>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((e) => (
            <button key={e} type="button" onClick={() => ask(e)} className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-forest-900 hover:border-forest-500">{e}</button>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <label htmlFor="assistant-q" className="sr-only">Ask a question about the demo site</label>
          <input id="assistant-q" className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What changed in GN-B1?" maxLength={200} />
          <button type="submit" className={buttonClass('primary', 'shrink-0 px-3')}><MessageSquare className="h-4 w-4" aria-hidden="true" /> Ask</button>
        </form>
        {asked && (
          <div className={`rounded-lg border p-4 ${asked.a.kind === 'refusal' ? 'border-amber-500/40 bg-amber-50' : 'border-line bg-paper'}`} aria-live="polite">
            <p className="text-[11px] text-subtle">“{asked.q}”</p>
            <h3 className="mt-1 font-semibold text-forest-900">{asked.a.title}</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">{asked.a.lines.map((l) => <li key={l}>{l}</li>)}</ul>
            {asked.a.sources.length > 0 && <p className="mt-3 font-mono text-[11px] text-subtle">From {asked.a.sources.length} record{asked.a.sources.length > 1 ? 's' : ''}: {asked.a.sources.join(', ')}</p>}
            {asked.a.links.length > 0 && <div className="mt-3 flex flex-wrap gap-3">{asked.a.links.map((l) => <Link key={l.to} to={l.to} className="inline-flex items-center gap-1 text-xs font-medium text-forest-700 hover:underline">{l.label} <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>)}</div>}
          </div>
        )}
        <p className="flex items-start gap-1.5 text-[11px] text-subtle"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Answers are computed from this demo’s records and list the records used. No language model is called. It never diagnoses disease, recommends treatments or predicts yield.</p>
      </div>
    </section>
  );
}
