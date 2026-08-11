/**
 * QueryLens AI — Dashboard
 *
 * Layout (all sections share .page-container boundaries):
 *   • Sticky header
 *   • Hero (idle) or Compact bar (active) — centered, max-w-[900px]
 *   • KPI Cards — always visible, 4/2/1 col grid
 *   • Quick-start cards (idle only) — 2×2 / 2 col / 1 col grid
 *   • Pipeline progress (running/done)
 *   • Loading spinner
 *   • Results: 2-col (SQL+Insights | Chart) + full-width Table
 *   • Error state
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Code2,
  Table2,
  Lightbulb,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

import { askQuery } from '../services/api';
import type { QueryResponse } from '../types';

import Header        from '../components/Header';
import QueryInput    from '../components/QueryInput';
import PipelineStatus from '../components/PipelineStatus';
import SQLViewer     from '../components/SQLViewer';
import ResultsTable  from '../components/ResultsTable';
import ErrorAlert    from '../components/ErrorAlert';
import ChartViewer   from '../components/ChartViewer';
import KPICards      from '../components/KPICards';

/* ── Types ── */
type PageState = 'idle' | 'loading' | 'success' | 'error';
interface ErrorState { type: string; message: string; }

const ERROR_MESSAGES: Record<string, string> = {
  configuration_error: 'AI model is offline. Please ensure Ollama is running.',
  validation_error:    'Unsafe query detected. Only SELECT queries are permitted.',
  database_error:      'A database error occurred while executing the query.',
  correction_failed:   'Unable to automatically correct the SQL after maximum retry attempts.',
  generation_error:    'Unable to generate SQL from your question. Please try rephrasing.',
  timeout_error:       'The request timed out. Please try again.',
  llm_error:           'The AI model encountered an error. Please try again.',
  network_error:       'Cannot connect to backend. Please ensure the server is running on port 8000.',
};

function friendlyError(type?: string, fallback?: string): string {
  return (type && ERROR_MESSAGES[type]) ? ERROR_MESSAGES[type] : (fallback ?? 'An unexpected error occurred.');
}

/* ── Insights Panel ── */
function InsightsPanel({ explanation }: { explanation: string }) {
  const metrics = useMemo(() => {
    const raw = explanation.match(/₹?\$?\d+(?:,\d+)*(?:\.\d+)?%?/g) ?? [];
    return Array.from(new Set(raw)).filter(m => m.length > 1).slice(0, 5);
  }, [explanation]);

  return (
    <div className="card-premium p-5 flex flex-col gap-4 h-full">
      {/* Card header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/6">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white leading-tight">AI Insights</h4>
          <p className="text-[10px] text-gray-500">Natural language summary</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-gray-300 flex-1">{explanation}</p>

      {metrics.length > 0 && (
        <div className="flex flex-col gap-2 pt-3 border-t border-white/6">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Key Figures</span>
          <div className="flex flex-wrap gap-2">
            {metrics.map((m, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/10 text-cyan-300 border border-indigo-500/20"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Quick demo queries ── */
const DEMO_QUERIES = [
  { q: 'Show top 5 products by price',  desc: 'Rank items by unit price descending',      icon: <ShoppingBag className="w-4 h-4 text-indigo-400" /> },
  { q: 'Total sales by category',        desc: 'Aggregate order volumes per category',     icon: <BarChart3   className="w-4 h-4 text-cyan-400" /> },
  { q: 'Average order value',            desc: 'Mean cart value across all transactions',  icon: <Sparkles    className="w-4 h-4 text-purple-400" /> },
  { q: 'Revenue trend',                  desc: 'Track revenue growth across order dates',  icon: <TrendingUp  className="w-4 h-4 text-emerald-400" /> },
];

/* ── Animation variants ── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/* ════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ════════════════════════════════════════════════ */
export default function HomePage() {
  const [pageState,  setPageState]  = useState<PageState>('idle');
  const [result,     setResult]     = useState<QueryResponse | null>(null);
  const [error,      setError]      = useState<ErrorState | null>(null);
  const [liveStatus, setLiveStatus] = useState<string[]>([]);
  const [currentQ,   setCurrentQ]   = useState('');

  const handleQuery = useCallback(async (question: string) => {
    setPageState('loading');
    setResult(null);
    setError(null);
    setCurrentQ(question);
    setLiveStatus(['Generating SQL']);

    try {
      const data = await askQuery(question);

      if (!data.success) {
        setPageState('error');
        setError({ type: data.error_type ?? 'unknown_error', message: friendlyError(data.error_type, data.message) });
        setLiveStatus(data.status ?? []);
        return;
      }

      setResult(data);
      setLiveStatus(data.status ?? ['Generating SQL', 'Executing query']);
      setPageState('success');
    } catch (err: unknown) {
      const anyErr = err as Record<string, unknown>;
      if (typeof anyErr?.statusCode === 'number' && anyErr.statusCode < 500 && anyErr.error_type) {
        setPageState('error');
        setError({ type: String(anyErr.error_type), message: friendlyError(String(anyErr.error_type), String(anyErr.message ?? '')) });
        return;
      }
      setPageState('error');
      const isNetErr = err instanceof TypeError && (err as TypeError).message.includes('fetch');
      setError({
        type:    'network_error',
        message: isNetErr ? ERROR_MESSAGES.network_error : String(anyErr?.message ?? 'Unexpected error.'),
      });
      setLiveStatus([]);
    }
  }, []);

  const isLoading    = pageState === 'loading';
  const pipelineState = pageState === 'loading' ? 'running' : pageState === 'success' ? 'done' : 'idle';
  const hasChart     = !!(result?.columns && result?.rows && result.rows.length > 0);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Background ambient glows — fixed behind content, no overflow issues ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-[20%] left-[15%] w-[65vw] h-[65vw] max-w-[700px] max-h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 -right-[8%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 65%)', filter: 'blur(70px)' }} />
      </div>

      {/* ── Sticky Header ── */}
      <Header />

      {/* ════════════════════════
          MAIN CONTENT
          Uses .page-container for all sections so everything shares the same
          horizontal boundaries as the header.
          ════════════════════════ */}
      <main className="relative z-10 flex-1 flex flex-col page-container py-0 pb-20">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━
            HERO / QUERY INPUT
            ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <AnimatePresence mode="wait">
          {pageState === 'idle' ? (
            /* ── Full hero ── */
            <motion.section
              key="hero"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex flex-col items-center text-center pt-12 pb-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-[10px] font-bold tracking-widest uppercase"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
              >
                <Sparkles className="w-3 h-3" />
                Natural Language SQL Engine · Local AI
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.5, ease: EASE }}
                className="font-black tracking-tight text-white text-center w-full max-w-[900px] mx-auto"
                style={{
                  fontSize: 'clamp(2.6rem, 6vw, 5rem)',
                  lineHeight: 1.05,
                  marginBottom: '1.25rem',
                }}
              >
                Ask your database{' '}
                <span className="gradient-text-indigo">anything.</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.45 }}
                className="text-base text-gray-400 max-w-[640px] mx-auto text-center leading-relaxed mb-8"
              >
                Type a plain-English question. QueryLens generates safe SQL, executes it, and
                returns charts, metric cards, and AI insights — all in seconds.
              </motion.p>

              {/* Query input — constrained to 900px to match hero */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.5 }}
                className="w-full max-w-[900px] mx-auto"
              >
                <QueryInput onSubmit={handleQuery} isLoading={isLoading} initialValue={currentQ} />
              </motion.div>
            </motion.section>

          ) : (
            /* ── Compact query bar (active state) ── */
            <motion.section
              key="active-bar"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-5 pb-4"
            >
              <div className="flex items-center justify-between mb-2 max-w-[900px] mx-auto">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Query Console</span>
                <button
                  onClick={() => { setPageState('idle'); setResult(null); setError(null); }}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  New Query
                </button>
              </div>
              <div className="max-w-[900px] mx-auto">
                <QueryInput onSubmit={handleQuery} isLoading={isLoading} initialValue={currentQ} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━
            KPI CARDS — always visible
            ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="mt-6">
          <KPICards />
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━
            QUICK-START CARDS (idle only)
            2×2 desktop / 2 col tablet / 1 col mobile
            ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <AnimatePresence>
          {pageState === 'idle' && (
            <motion.section
              key="demo-cards"
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
              className="mt-8"
            >
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                Quick-start examples
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {DEMO_QUERIES.map((demo) => (
                  <motion.button
                    key={demo.q}
                    variants={fadeUp}
                    whileHover={{ y: -4, boxShadow: '0 8px 28px rgba(99,102,241,0.15)', transition: { duration: 0.18 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuery(demo.q)}
                    className="card-premium p-5 flex items-start gap-4 text-left cursor-pointer group hover:border-indigo-500/30"
                  >
                    {/* Icon box */}
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-200">
                      {demo.icon}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                        {demo.q}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{demo.desc}</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Run analysis <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━
            PIPELINE STATUS
            ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <AnimatePresence>
          {pipelineState !== 'idle' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 overflow-hidden"
            >
              <PipelineStatus state={pipelineState} statusArray={liveStatus} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━
            LOADING STATE
            ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <AnimatePresence>
          {pageState === 'loading' && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="mt-6 card-premium p-10 flex flex-col items-center justify-center gap-5 min-h-[240px]"
            >
              <div className="scanline" />
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/40 animate-spin" style={{ animationDuration: '8s' }} />
                <div className="absolute inset-2 rounded-full border-2 border-t-cyan-400 border-r-transparent border-l-transparent border-b-transparent animate-spin" style={{ animationDuration: '1.4s' }} />
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-white tracking-wide">AI is analyzing your data…</h3>
                <p className="text-xs text-gray-500 mt-1.5 max-w-xs leading-relaxed">
                  Parsing schema, generating optimized SQL, and preparing visualizations.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━
            SUCCESS — RESULTS DASHBOARD
            ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <AnimatePresence>
          {pageState === 'success' && result && (
            <motion.section
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="mt-6 flex flex-col gap-6"
            >
              {/* Active query breadcrumb */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}
              >
                <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="text-xs text-indigo-400 font-semibold flex-shrink-0">Query:</span>
                <p className="text-xs font-medium text-white truncate">{currentQ}</p>
              </div>

              {/* ── Two-column results grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                {/* LEFT: SQL + Insights */}
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-5"
                >
                  {result.sql && (
                    <motion.div variants={fadeUp}>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Generated SQL
                      </p>
                      <SQLViewer sql={result.sql} />
                    </motion.div>
                  )}

                  {result.explanation && (
                    <motion.div variants={fadeUp}>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-purple-400" /> AI Insights
                      </p>
                      <InsightsPanel explanation={result.explanation} />
                    </motion.div>
                  )}
                </motion.div>

                {/* RIGHT: Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12, duration: 0.5, ease: EASE }}
                >
                  {hasChart ? (
                    <>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> Visual Analysis
                      </p>
                      <ChartViewer columns={result.columns!} rows={result.rows!} />
                    </>
                  ) : (
                    <div className="card-premium min-h-[260px] flex items-center justify-center flex-col gap-3 p-8 text-center">
                      <BarChart3 className="w-10 h-10 text-gray-700" />
                      <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                        Charts appear here when the query returns numeric data.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* ── Full-width Data Table ── */}
              {result.columns && result.rows && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
                >
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Table2 className="w-3.5 h-3.5 text-emerald-400" /> Data Table
                  </p>
                  <ResultsTable
                    columns={result.columns}
                    rows={result.rows}
                    truncated={result.truncated}
                  />
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━
            ERROR STATE
            ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <AnimatePresence>
          {pageState === 'error' && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6"
            >
              <ErrorAlert errorType={error.type} message={error.message} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 py-5 text-[10px] text-gray-600 border-t select-none tracking-wide"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <div className="page-container text-center">
          QueryLens AI · FastAPI + React + Vite · Local Ollama · Read-only SQLite
        </div>
      </footer>
    </div>
  );
}
