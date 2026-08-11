/**
 * QueryInput — Premium AI search console
 * Clean glass panel. No floating icons inside textarea.
 * Sparkles icon sits in header row above input, not overlapping text.
 */

import { useState, useRef, type KeyboardEvent } from 'react';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';

interface QueryInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const EXAMPLES = [
  'Show top 5 products by price',
  'Total sales by category',
  'Average order value',
  'Revenue trend',
];

export default function QueryInput({ onSubmit, isLoading, initialValue = '' }: QueryInputProps) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = value.trim().length > 0 && !isLoading;

  const submit = () => {
    if (canSubmit) onSubmit(value.trim());
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const pickExample = (ex: string) => {
    setValue(ex);
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ── Main input card ── */}
      <div
        className="w-full rounded-2xl border transition-all duration-250"
        style={{
          background: isFocused ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
          borderColor: isFocused ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.1)',
          boxShadow: isFocused
            ? '0 0 0 3px rgba(99,102,241,0.12), 0 8px 32px rgba(0,0,0,0.35)'
            : '0 4px 24px rgba(0,0,0,0.25)',
        }}
      >
        {/* ── Input header bar ── */}
        <div
          className="flex items-center justify-between px-4 pt-3 pb-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-400">
            <Sparkles className={`w-3.5 h-3.5 ${isFocused ? 'animate-float' : ''}`} />
            <span>QueryLens AI</span>
          </div>
          <span className="text-[10px] text-gray-600 hidden sm:block">
            Press <kbd className="px-1 py-0.5 rounded text-[9px] bg-white/5 border border-white/10 text-gray-400">Enter</kbd> to run
          </span>
        </div>

        {/* ── Textarea ── */}
        <textarea
          ref={textareaRef}
          id="query-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={isLoading}
          rows={3}
          placeholder="Ask a question about your database in plain English…"
          className="w-full bg-transparent resize-none outline-none px-4 pt-3 pb-2 text-sm leading-relaxed disabled:opacity-50 placeholder:text-gray-600 text-white"
          style={{ fontFamily: 'var(--font-sans)', minHeight: '84px' }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* ── Footer bar: Run button ── */}
        <div
          className="flex items-center justify-end px-3 pb-3 pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canSubmit
                ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                : 'rgba(255,255,255,0.05)',
              color: 'white',
              boxShadow: canSubmit ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
            {isLoading ? 'Analyzing…' : 'Run Query'}
          </button>
        </div>
      </div>

      {/* ── Quick Example Pills ── */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider select-none">
          Examples:
        </span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => pickExample(ex)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-150 border bg-white/[0.02] border-white/8 text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
