/**
 * ErrorAlert — Premium Glassmorphism Error Display Card
 * Handles: validation error, database error, auto-correction failure, configuration errors, and network issues
 */

import { AlertTriangle, ServerCrash, ShieldX, RefreshCcw, Zap } from 'lucide-react';

interface ErrorAlertProps {
  errorType: string;
  message: string;
}

const ERROR_META: Record<string, { title: string; icon: React.ReactNode; colorClass: string; accentHex: string }> = {
  validation_error: {
    title: 'Unsafe Query Blocked',
    icon: <ShieldX className="w-5 h-5" />,
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    accentHex: '#fbbf24',
  },
  database_error: {
    title: 'Database Execution Failed',
    icon: <AlertTriangle className="w-5 h-5" />,
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    accentHex: '#f43f5e',
  },
  correction_failed: {
    title: 'Query Correction Exhausted',
    icon: <RefreshCcw className="w-5 h-5" />,
    colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
    accentHex: '#f97316',
  },
  generation_error: {
    title: 'SQL Synthesis Failed',
    icon: <Zap className="w-5 h-5" />,
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    accentHex: '#a855f7',
  },
  configuration_error: {
    title: 'Local LLM Model Offline',
    icon: <ServerCrash className="w-5 h-5" />,
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    accentHex: '#f43f5e',
  },
  timeout_error: {
    title: 'Response Timeout',
    icon: <RefreshCcw className="w-5 h-5" />,
    colorClass: 'text-gray-400 bg-white/5 border-white/10',
    accentHex: '#9ca3af',
  },
  network_error: {
    title: 'Backend API Service Offline',
    icon: <ServerCrash className="w-5 h-5" />,
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    accentHex: '#f43f5e',
  },
};

const FALLBACK = {
  title: 'Operational Failure',
  icon: <AlertTriangle className="w-5 h-5" />,
  colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
  accentHex: '#f43f5e',
};

export default function ErrorAlert({ errorType, message }: ErrorAlertProps) {
  const meta = ERROR_META[errorType] ?? FALLBACK;

  return (
    <div
      className="card-premium w-full p-5 flex gap-4 items-start animate-fade-in"
      style={{
        background: `linear-gradient(135deg, rgba(${hexToRgb(meta.accentHex)}, 0.05) 0%, rgba(10,14,26,0.6) 100%)`,
        borderColor: `rgba(${hexToRgb(meta.accentHex)}, 0.2)`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(${hexToRgb(meta.accentHex)}, 0.03)`,
      }}
    >
      {/* Dynamic Colored Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${meta.colorClass}`}
      >
        {meta.icon}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold tracking-wide text-white uppercase mb-1">
          {meta.title}
        </h4>
        <p className="text-sm leading-relaxed text-gray-300">
          {message}
        </p>

        {/* Helpful action hints based on error class */}
        {errorType === 'validation_error' && (
          <div className="mt-3.5 p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-gray-500 leading-relaxed">
            <strong className="text-amber-400/90 font-bold block mb-0.5">Security Policy:</strong>
            Write/modification statements (e.g. <code className="font-mono text-gray-400">DROP</code>, <code className="font-mono text-gray-400">DELETE</code>, <code className="font-mono text-gray-400">UPDATE</code>) are strictly prohibited on this SQLite database. Please formulate a standard reading request.
          </div>
        )}
        {errorType === 'network_error' && (
          <div className="mt-3.5 p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-gray-500 leading-relaxed">
            <strong className="text-rose-400/90 font-bold block mb-0.5">Troubleshooting:</strong>
            Verify the FastAPI server is running. Try opening a terminal and starting it:
            <pre className="font-mono text-cyan-400 mt-1 bg-black/40 px-2 py-1.5 rounded border border-white/5 text-[10px] select-all">
              uvicorn app.main:app --reload --port 8000
            </pre>
          </div>
        )}
        {errorType === 'configuration_error' && (
          <div className="mt-3.5 p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-gray-500 leading-relaxed">
            <strong className="text-rose-400/90 font-bold block mb-0.5">Troubleshooting:</strong>
            The AI model cannot be contacted. Check if Ollama is running locally:
            <pre className="font-mono text-cyan-400 mt-1 bg-black/40 px-2 py-1.5 rounded border border-white/5 text-[10px] select-all">
              ollama run qwen2.5:1.5b
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/** Convert #rrggbb to "r,g,b" string */
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
