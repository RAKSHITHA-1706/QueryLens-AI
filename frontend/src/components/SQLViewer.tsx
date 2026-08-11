/**
 * SQLViewer — Premium SQL code block
 * Features: syntax highlighting, copy button, expand/collapse
 */

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Code2 } from 'lucide-react';

interface SQLViewerProps {
  sql: string;
}

/** Very lightweight SQL keyword highlighter — no external deps */
function highlightSQL(sql: string): React.ReactNode[] {
  const KEYWORDS = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|AS|AND|OR|NOT|IN|IS|NULL|ASC|DESC|COUNT|SUM|AVG|MIN|MAX|WITH|CASE|WHEN|THEN|ELSE|END|UNION|ALL|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)\b/gi;
  const STRINGS  = /('([^']|'')*')/g;
  const NUMBERS  = /\b(\d+(\.\d+)?)\b/g;
  const COMMENTS = /(--[^\n]*)/g;

  // Build annotated token list
  type Token = { text: string; type: 'keyword' | 'string' | 'number' | 'comment' | 'plain' };
  const tokens: Token[] = [];

  // Build match map
  const matches: { start: number; end: number; type: Token['type'] }[] = [];
  const collect = (re: RegExp, type: Token['type']) => {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(sql)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, type });
    }
  };
  collect(COMMENTS, 'comment');
  collect(STRINGS, 'string');
  collect(NUMBERS, 'number');
  collect(KEYWORDS, 'keyword');

  // Sort and de-overlap
  matches.sort((a, b) => a.start - b.start);

  let cursor = 0;
  const finalMatches: typeof matches = [];
  for (const m of matches) {
    if (m.start >= cursor) {
      finalMatches.push(m);
      cursor = m.end;
    }
  }

  // Build tokens
  cursor = 0;
  for (const m of finalMatches) {
    if (m.start > cursor) tokens.push({ text: sql.slice(cursor, m.start), type: 'plain' });
    tokens.push({ text: sql.slice(m.start, m.end), type: m.type });
    cursor = m.end;
  }
  if (cursor < sql.length) tokens.push({ text: sql.slice(cursor), type: 'plain' });

  const colorMap: Record<Token['type'], string> = {
    keyword: '#818cf8',  // indigo-400
    string:  '#34d399',  // emerald-400
    number:  '#fb923c',  // orange-400
    comment: '#6b7280',  // gray-500
    plain:   '#e2e8f0',  // slate-200
  };

  return tokens.map((t, i) => (
    <span key={i} style={{ color: colorMap[t.type] }}>{t.text}</span>
  ));
}

export default function SQLViewer({ sql }: SQLViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const lines = sql.trim().split('\n');
  const isLong = lines.length > 10;

  const copy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-premium w-full overflow-hidden" style={{ background: 'var(--surface-0)' }}>
      {/* ── Header bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        </div>

        <div className="flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5" style={{ color: 'var(--indigo)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Generated SQL
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors"
              style={{ color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          )}
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200"
            style={{
              background: copied ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'}`,
              color: copied ? 'var(--emerald)' : 'var(--text-secondary)',
            }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Code area ── */}
      {expanded && (
        <div
          className="overflow-x-auto"
          style={{ maxHeight: isLong ? '320px' : 'none', overflowY: isLong ? 'auto' : 'hidden' }}
        >
          <pre
            className="code-block p-5 text-[13px] leading-7"
            style={{ tabSize: 2 }}
          >
            {highlightSQL(sql.trim())}
          </pre>
        </div>
      )}
    </div>
  );
}
