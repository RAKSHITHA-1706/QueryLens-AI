/**
 * StatusBadge — displays backend health status with colour coding.
 */

import type { Status } from '../types';

interface StatusBadgeProps {
  status: Status;
  result: string | null;
  latencyMs: number | null;
}

const config: Record<Status, { label: string; dot: string; ring: string; bg: string }> = {
  idle:    { label: 'Not checked',  dot: 'bg-gray-500',   ring: 'ring-gray-500/30',   bg: 'bg-gray-500/10' },
  loading: { label: 'Checking…',   dot: 'bg-amber-400 animate-pulse',  ring: 'ring-amber-400/30',  bg: 'bg-amber-400/10' },
  success: { label: 'Online',       dot: 'bg-emerald-400', ring: 'ring-emerald-400/30', bg: 'bg-emerald-400/10' },
  error:   { label: 'Unreachable',  dot: 'bg-red-400',     ring: 'ring-red-400/30',     bg: 'bg-red-400/10' },
};

export default function StatusBadge({ status, result, latencyMs }: StatusBadgeProps) {
  const c = config[status];

  return (
    <div
      className={`
        inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full
        ring-1 ${c.ring} ${c.bg}
        transition-all duration-300
      `}
    >
      {/* Dot */}
      <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />

      {/* Label */}
      <span className="text-sm font-medium text-white/90">{c.label}</span>

      {/* Result + latency */}
      {status === 'success' && result && (
        <span className="text-xs font-mono text-emerald-300/80">
          {result}
          {latencyMs !== null && (
            <span className="ml-1.5 text-white/40">{latencyMs}ms</span>
          )}
        </span>
      )}
    </div>
  );
}
