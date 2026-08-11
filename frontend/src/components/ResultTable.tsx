import { Table } from 'lucide-react';

interface ResultTableProps {
  columns?: string[];
  rows?: Record<string, any>[];
}

export default function ResultTable({ columns, rows }: ResultTableProps) {
  if (!columns || !rows) return null;

  return (
    <div className="w-full rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden backdrop-blur-sm shadow-xl mt-4">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
        <Table className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold text-white/90 tracking-wide">Query Results</span>
        <span className="ml-auto text-xs text-white/40">{rows.length} rows</span>
      </div>
      
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">
            No rows found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 text-xs font-semibold tracking-wider text-white/70 uppercase border-b border-white/10 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-white/5 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 text-sm text-white/80 whitespace-nowrap">
                      {row[col] !== null ? String(row[col]) : <span className="text-white/30 italic">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
