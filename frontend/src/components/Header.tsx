/**
 * Header — QueryLens AI branded sticky top bar
 * Single clean row: Logo left | Status indicators right
 * No overlapping, no absolute-positioned children inside content area
 */

import { useState, useEffect } from 'react';
import { Database, Cpu } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Header() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const ping = () => {
      checkHealth()
        .then(() => setDbStatus('online'))
        .catch(() => setDbStatus('offline'));
    };
    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, []);

  const dotColor = {
    checking: 'bg-amber-400',
    online:   'bg-emerald-400',
    offline:  'bg-rose-400',
  }[dbStatus];

  const statusLabel = {
    checking: 'Connecting…',
    online:   'SQLite Online',
    offline:  'Database Offline',
  }[dbStatus];

  const statusColor = {
    checking: 'text-amber-300',
    online:   'text-emerald-300',
    offline:  'text-rose-400',
  }[dbStatus];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        background: 'rgba(4, 8, 19, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      {/* ── Centered inner row ── */}
      <div className="page-container flex items-center justify-between h-14">

        {/* LEFT: Logo + brand */}
        <div className="flex items-center gap-2.5">
          {/* Icon — no absolute children inside flow content */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              boxShadow: '0 0 14px rgba(99,102,241,0.35)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="13" stroke="white" strokeWidth="4.5" />
              <line x1="29" y1="29" x2="43" y2="43" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-sm font-extrabold tracking-tight text-white">
              Query<span className="gradient-text-indigo">Lens</span>
              <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 tracking-wider uppercase align-middle">
                AI Console
              </span>
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide mt-0.5 hidden sm:block">
              Enterprise NLP-to-SQL Analytics
            </span>
          </div>
        </div>

        {/* RIGHT: Status indicators */}
        <div className="flex items-center gap-2">
          {/* Engine indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
            style={{
              background: 'rgba(99,102,241,0.07)',
              border: '1px solid rgba(99,102,241,0.15)',
              color: '#a5b4fc',
            }}
          >
            <Cpu className="w-3 h-3" />
            <span>Ollama</span>
          </div>

          {/* DB Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor} ${dbStatus !== 'offline' ? 'animate-pulse-dot' : ''}`} />
            <Database className="w-3 h-3 text-gray-400" />
            <span className={statusColor}>{statusLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
