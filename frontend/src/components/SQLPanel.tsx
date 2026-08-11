import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SQLPanelProps {
  sql: string;
}

export default function SQLPanel({ sql }: SQLPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!sql) return null;

  return (
    <div className="w-full rounded-2xl bg-black/40 ring-1 ring-white/10 overflow-hidden backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          <span className="text-sm font-semibold text-white/90 tracking-wide">Generated SQL</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white text-xs font-medium"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy SQL'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-indigo-200">
          <code>{sql}</code>
        </pre>
      </div>
    </div>
  );
}
