/**
 * PipelineStatus — Animated processing pipeline display
 * Shows stages: NL Input → SQL Generation → Validation → Execution → Results
 */

import { Check, Loader2, Circle } from 'lucide-react';

const STAGES = [
  { id: 'input',      label: 'Natural Language' },
  { id: 'generate',   label: 'SQL Generation' },
  { id: 'validate',   label: 'Validation' },
  { id: 'execute',    label: 'Execution' },
  { id: 'results',    label: 'Results' },
];

// Map backend status strings to stage indices
function statusToStageIndex(statusArray: string[]): number {
  const last = (statusArray[statusArray.length - 1] ?? '').toLowerCase();
  if (last.includes('generating'))  return 1;
  if (last.includes('validat'))     return 2;
  if (last.includes('execut'))      return 3;
  if (last.includes('correct'))     return 3;
  if (last.includes('complete'))    return 4;
  return 0;
}

type PipelineState = 'idle' | 'running' | 'done' | 'error';

interface PipelineStatusProps {
  state: PipelineState;
  statusArray: string[];
}

export default function PipelineStatus({ state, statusArray }: PipelineStatusProps) {
  if (state === 'idle') return null;

  const activeStage = state === 'done'
    ? STAGES.length - 1
    : statusToStageIndex(statusArray);

  return (
    <div
      className="card-premium w-full px-5 py-4"
    >
      {/* Stage pills row */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {STAGES.map((stage, i) => {
          const isDone    = i < activeStage || state === 'done';
          const isActive  = i === activeStage && state === 'running';
          const isPending = i > activeStage && state === 'running';

          return (
            <div key={stage.id} className="flex items-center flex-shrink-0">
              {/* Stage node */}
              <div className="flex flex-col items-center gap-1.5">
                {/* Icon */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isDone
                      ? 'rgba(16,185,129,0.15)'
                      : isActive
                        ? 'rgba(99,102,241,0.15)'
                        : 'var(--surface-2)',
                    border: isDone
                      ? '1.5px solid rgba(16,185,129,0.4)'
                      : isActive
                        ? '1.5px solid rgba(99,102,241,0.5)'
                        : '1.5px solid var(--border-subtle)',
                  }}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5" style={{ color: 'var(--emerald)' }} />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin-slow" style={{ color: 'var(--indigo)' }} />
                  ) : (
                    <Circle className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                {/* Label */}
                <span
                  className="text-[10px] font-medium whitespace-nowrap transition-colors duration-300"
                  style={{
                    color: isDone
                      ? 'var(--emerald)'
                      : isActive
                        ? '#a5b4fc'
                        : isPending
                          ? 'var(--text-muted)'
                          : 'var(--text-secondary)',
                  }}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector */}
              {i < STAGES.length - 1 && (
                <div
                  className="h-px w-10 sm:w-16 mx-2 flex-shrink-0 rounded-full transition-all duration-500"
                  style={{
                    background: isDone
                      ? 'linear-gradient(90deg, var(--emerald), rgba(99,102,241,0.4))'
                      : isActive
                        ? 'linear-gradient(90deg, rgba(99,102,241,0.4), var(--border-subtle))'
                        : 'var(--border-subtle)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current step label */}
      {state === 'running' && statusArray.length > 0 && (
        <p
          className="mt-3 text-xs flex items-center gap-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Loader2 className="w-3 h-3 animate-spin-slow flex-shrink-0" style={{ color: 'var(--indigo)' }} />
          {statusArray[statusArray.length - 1]}…
        </p>
      )}
      {state === 'done' && (
        <p
          className="mt-3 text-xs flex items-center gap-1.5"
          style={{ color: 'var(--emerald)' }}
        >
          <Check className="w-3 h-3 flex-shrink-0" />
          Query completed successfully
        </p>
      )}
    </div>
  );
}
