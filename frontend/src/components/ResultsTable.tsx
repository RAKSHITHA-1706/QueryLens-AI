/**
 * ResultsTable — Premium SaaS Data Table Component
 * Features: sticky header, zebra row striping, modern typography, hover animations, empty states
 */

import { Table2, AlertTriangle, Inbox } from 'lucide-react';

interface ResultsTableProps {
  columns?: string[];
  rows?: Record<string, unknown>[];
  truncated?: boolean;
}

function cellDisplay(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return String(val);
}

function isCellNull(val: unknown): boolean {
  return val === null || val === undefined;
}

export default function ResultsTable({ columns, rows, truncated }: ResultsTableProps) {
  if (!columns || !rows) return null;

  const count = rows.length;

  return (
    <div className="card-premium w-full overflow-hidden group">
      {/* ── Table Header Bar ── */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Table2 className="w-4 h-4 text-cyan-400 group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Data Table</h4>
            <p className="text-[10px] text-gray-500 font-medium">Tabular view of raw database output</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {truncated && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Limited</span>
            </div>
          )}
          <span
            className="text-xs px-3 py-1 rounded-full font-bold tracking-wide bg-white/5 text-cyan-300 border border-white/5"
          >
            {count} {count === 1 ? 'record' : 'records'}
          </span>
        </div>
      </div>

      {/* ── Table / Empty State ── */}
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10"
          >
            <Inbox className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Empty Result Set</p>
            <p className="text-xs text-gray-500 mt-1 max-w-[280px] leading-relaxed">
              The query completed successfully but returned 0 rows matching your criteria.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="overflow-x-auto"
          style={{ maxHeight: '420px', overflowY: 'auto' }}
        >
          <table className="w-full border-collapse" style={{ minWidth: '100%' }}>
            <thead
              className="sticky top-0 z-10"
              style={{ background: 'rgba(23, 32, 53, 0.95)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            >
              <tr className="border-b border-white/5">
                {/* Row count index header */}
                <th
                  className="text-right px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-500 select-none w-12"
                >
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="transition-colors duration-150 hover:bg-indigo-500/5 odd:bg-transparent even:bg-white/[0.01]"
                >
                  {/* Row Index */}
                  <td
                    className="px-4 py-3.5 text-[11px] font-mono text-gray-500 select-none text-right border-r border-white/5"
                  >
                    {ri + 1}
                  </td>
                  {columns.map((col) => {
                    const isNum = typeof row[col] === 'number';
                    const isNull = isCellNull(row[col]);
                    return (
                      <td
                        key={col}
                        className={`px-5 py-3.5 text-xs sm:text-sm whitespace-nowrap ${
                          isNum ? 'font-mono text-cyan-300 text-right' : 'text-gray-300'
                        }`}
                        style={{
                          textAlign: isNum ? 'right' : 'left',
                        }}
                      >
                        {isNull ? (
                          <span className="text-gray-600 font-bold italic tracking-wide text-xs">NULL</span>
                        ) : isNum ? (
                          (row[col] as number).toLocaleString(undefined, {
                            minimumFractionDigits: (row[col] as number) % 1 === 0 ? 0 : 2,
                            maximumFractionDigits: 2,
                          })
                        ) : (
                          cellDisplay(row[col])
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Truncation Warning Footer ── */}
      {truncated && (
        <div
          className="px-5 py-3 text-xs flex items-center gap-2 border-t border-amber-500/10 bg-amber-500/5 text-amber-400 font-semibold"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Results truncated by server. Refine query parameters or add a specific LIMIT filter.</span>
        </div>
      )}
    </div>
  );
}
