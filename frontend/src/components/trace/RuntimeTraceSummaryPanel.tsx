import React from 'react';
import type { Analysis, TraceMode } from '../../types/analysis';
import Panel from '../common/Panel';
import { formatTraceValue } from '../../utils/formatTraceValue';
import TraceErrorState from './TraceErrorState';

type Props = { analysis: Analysis };

// ── Mode badge ──────────────────────────────────────────────────────────────
const MODE_CONFIG: Record<
  NonNullable<TraceMode>,
  { dot: string; pill: string; label: string }
> = {
  executed: {
    dot:  'bg-emerald-400',
    pill: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    label: 'Executed',
  },
  planned: {
    dot:  'bg-indigo-400',
    pill: 'border-indigo-500/25 bg-indigo-500/10 text-indigo-300',
    label: 'Planned',
  },
  error: {
    dot:  'bg-red-400',
    pill: 'border-red-500/25 bg-red-500/10 text-red-300',
    label: 'Error',
  },
  disabled: {
    dot:  'bg-white/30',
    pill: 'border-white/10 bg-white/[0.04] text-white/40',
    label: 'Disabled',
  },
  unsupported_language: {
    dot:  'bg-amber-400',
    pill: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    label: 'Unsupported',
  },
};

function TraceModeChip({ mode }: { mode: TraceMode }) {
  const cfg = mode ? MODE_CONFIG[mode] : MODE_CONFIG['disabled'];
  return (
    <span className={['inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold', cfg.pill].join(' ')}>
      <span className={['w-1.5 h-1.5 rounded-full', cfg.dot].join(' ')} />
      {cfg.label}
    </span>
  );
}

// ── Metric row ───────────────────────────────────────────────────────────────
function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/40 shrink-0">{label}</span>
      <span className="text-xs text-white/75 font-mono text-right break-all">{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const RuntimeTraceSummaryPanel: React.FC<Props> = ({ analysis }) => {
  const { trace_mode, trace_steps, trace_summary, trace_result, trace_error, trace_plan, trace_metadata } = analysis;

  const stepCount = Array.isArray(trace_steps) ? trace_steps.length : 0;

  return (
    <Panel className="p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30">
          Runtime Trace
        </p>
        <TraceModeChip mode={trace_mode} />
      </div>

      {/* Executed */}
      {trace_mode === 'executed' && (
        <>
          <p className="text-xs text-emerald-300/80">Runtime trace executed successfully.</p>
          <div className="flex flex-col gap-0">
            <MetricRow label="Total steps" value={String(trace_summary?.totalSteps ?? stepCount)} />
            <MetricRow label="Terminated" value={trace_summary?.terminatedReason ?? '—'} />
            {trace_result?.returnedValue !== undefined && (
              <MetricRow label="Returned value" value={formatTraceValue(trace_result.returnedValue)} />
            )}
            {trace_metadata?.entryFunction && (
              <MetricRow label="Entry function" value={trace_metadata.entryFunction} />
            )}
            {trace_metadata?.analyzedAt && (
              <MetricRow label="Analyzed at" value={new Date(trace_metadata.analyzedAt).toLocaleString()} />
            )}
          </div>
        </>
      )}

      {/* Planned */}
      {trace_mode === 'planned' && (
        <>
          {trace_error?.code === 'PYTHON_RUNTIME_TRACE_DISABLED' ? (
            <p className="text-xs text-indigo-300/80">
              Python runtime tracing is currently disabled. Static complexity analysis is available.
            </p>
          ) : trace_error?.message?.includes('Python runtime tracing is not enabled yet') ? (
            <p className="text-xs text-indigo-300/80">
              Python runtime tracing is not enabled yet. Static complexity analysis is available.
            </p>
          ) : (
            <p className="text-xs text-indigo-300/80">
              Runtime execution was not enabled, but CodeMind generated a trace plan.
            </p>
          )}
          {trace_plan && (
            <div className="flex flex-col gap-0">
              <MetricRow label="Planned steps" value={String(trace_plan.steps.length)} />
              {trace_plan.steps.slice(0, 3).map((s) => (
                <MetricRow key={s.id} label={`Step — ${s.type}`} value={s.title} />
              ))}
              {trace_plan.limitations.length > 0 && (
                <MetricRow label="Limitations" value={trace_plan.limitations[0]} />
              )}
            </div>
          )}
          {!trace_plan && (
            <div className="flex flex-col gap-0">
              <MetricRow label="Total steps" value={String(trace_summary?.totalSteps ?? 0)} />
              <MetricRow label="Terminated" value={trace_summary?.terminatedReason ?? 'not_executed'} />
            </div>
          )}
        </>
      )}

      {/* Error */}
      {trace_mode === 'error' && !trace_error?.message.includes('JavaScript only') && (
        <div className="mt-2">
          <TraceErrorState error={trace_error} />
        </div>
      )}

      {/* Unsupported */}
      {(['unsupported_language', 'unsupported', 'not_available'].includes(trace_mode as string) || 
        trace_error?.message.includes('JavaScript only')) && (
        <div className="mt-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
          <p className="text-sm text-indigo-300">
            {trace_error?.code === 'JAVA_RUNTIME_TRACE_UNSUPPORTED' 
              ? 'Java runtime tracing is not available yet. Static complexity analysis is available.'
              : trace_error?.message?.includes('Python runtime tracing is currently disabled')
              ? 'Python runtime tracing is currently disabled. Static complexity analysis is available.'
              : 'Runtime tracing is currently available for JavaScript only. Static complexity analysis is available for this language.'}
          </p>
        </div>
      )}

      {/* No trace */}
      {(trace_mode === null || trace_mode === undefined || trace_mode === 'disabled') && (
        <p className="text-xs text-white/35">
          Runtime trace data is not available for this analysis.
        </p>
      )}
    </Panel>
  );
};

export default RuntimeTraceSummaryPanel;
