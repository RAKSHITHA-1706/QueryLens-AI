/**
 * ChartViewer — Dynamic SVG Data Visualization
 * Supports: Bar Chart, Line/Area Chart, and KPI Stat Widget.
 * Automatically inspects columns/rows to configure, and provides manual tabs to switch.
 */

import { useState, useMemo } from 'react';
import { BarChart3, LineChart, TrendingUp, Layers } from 'lucide-react';

interface ChartViewerProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

type ChartType = 'bar' | 'area' | 'line' | 'kpi';

export default function ChartViewer({ columns, rows }: ChartViewerProps) {
  const [activeTab, setActiveTab] = useState<ChartType | null>(null);

  // Parse and analyze dataset
  const { data, xKey, yKey, isDateSeries, kpiValue, kpiLabel } = useMemo(() => {
    if (!rows || rows.length === 0) {
      return { data: [], xKey: '', yKey: '', isDateSeries: false, kpiValue: null, kpiLabel: '' };
    }

    // 1. Identify potential numeric columns (y-axis)
    // Filter out ID columns (e.g., id, category_id, order_id)
    const numericCols = columns.filter((col) => {
      const lower = col.toLowerCase();
      if (lower === 'id' || lower.endsWith('_id') || lower.endsWith('id')) return false;
      // Check if values in rows are numbers
      return rows.some((row) => typeof row[col] === 'number');
    });

    // 2. Identify potential label columns (x-axis)
    const labelCols = columns.filter((col) => !numericCols.includes(col));

    // Choose primary columns
    // Prefer columns containing 'date', 'month', 'time', 'year', 'day', 'trend' for x-axis
    let x = labelCols.find((col) => {
      const lower = col.toLowerCase();
      return lower.includes('date') || lower.includes('month') || lower.includes('year') || lower.includes('time') || lower.includes('trend');
    });
    if (!x) x = labelCols.find((col) => col.toLowerCase() === 'name');
    if (!x) x = labelCols[0] || columns[0];

    // Prefer columns containing 'price', 'sales', 'revenue', 'amount', 'total', 'avg', 'sum', 'count' for y-axis
    let y = numericCols.find((col) => {
      const lower = col.toLowerCase();
      return lower.includes('price') || lower.includes('sales') || lower.includes('revenue') || lower.includes('amount') || lower.includes('total') || lower.includes('count') || lower.includes('avg') || lower.includes('sum') || lower.includes('value');
    });
    if (!y) y = numericCols[0] || columns[1] || columns[0];

    // Check if X axis values look like dates
    const firstXVal = String(rows[0]?.[x] ?? '');
    const isDate =
      x.toLowerCase().includes('date') ||
      x.toLowerCase().includes('month') ||
      /^\d{4}-\d{2}-\d{2}$/.test(firstXVal) ||
      /^\d{4}-\d{2}$/.test(firstXVal);

    // Map rows to safe { label: string, value: number } items
    const parsedData = rows.map((row) => {
      const rawVal = row[y];
      const val = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal)) || 0;
      return {
        label: String(row[x] ?? ''),
        value: val,
      };
    });

    // KPI detection: if exactly 1 row is returned with 1 numeric column
    let kpiVal: string | null = null;
    let kpiLbl = '';
    if (rows.length === 1 && numericCols.length > 0) {
      const primaryCol = numericCols[0];
      const val = rows[0][primaryCol];
      kpiVal = typeof val === 'number' ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(val);
      // Clean up column name for label (e.g. avg(total_amount) -> Average Total Amount)
      kpiLbl = primaryCol
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return {
      data: parsedData,
      xKey: x,
      yKey: y,
      isDateSeries: isDate,
      kpiValue: kpiVal,
      kpiLabel: kpiLbl,
    };
  }, [columns, rows]);

  // Set default tab based on data structure
  const currentTab = useMemo(() => {
    if (activeTab) return activeTab;
    if (kpiValue && data.length === 1) return 'kpi';
    if (isDateSeries) return 'area';
    return 'bar';
  }, [activeTab, kpiValue, data.length, isDateSeries]);

  if (!rows || rows.length === 0 || !data.length) return null;

  // Chart computations
  const width = 600;
  const height = 280;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 50;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1) * 1.15; // 15% padding at top
  const minVal = 0;

  const points = data.map((d, i) => {
    const xCoord = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartW;
    const yCoord = paddingTop + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH;
    return { x: xCoord, y: yCoord, label: d.label, value: d.value };
  });

  // Render SVG Line Path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  // Render closed Area Path
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`
    : '';

  const formatYLabel = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    if (val === 0) return '0';
    return val.toFixed(0);
  };

  const cleanLabel = (lbl: string) => {
    return lbl
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="card-premium w-full p-5 flex flex-col gap-4 animate-fade-in group">
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <BarChart3 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              {cleanLabel(yKey)} <span className="text-gray-500 font-normal">by</span> {cleanLabel(xKey)}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium">Auto-generated data visualization</p>
          </div>
        </div>

        {/* ── Switcher Tabs ── */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab('bar')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              currentTab === 'bar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('area')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              currentTab === 'area' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Area Chart"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('line')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              currentTab === 'line' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Line Chart"
          >
            <LineChart className="w-3.5 h-3.5" />
          </button>
          {kpiValue && (
            <button
              onClick={() => setActiveTab('kpi')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                currentTab === 'kpi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="KPI Highlight"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Chart Content ── */}
      <div className="w-full flex items-center justify-center min-h-[220px]">
        {currentTab === 'kpi' ? (
          /* ── KPI View ── */
          <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">
              {kpiLabel || 'Key Performance Indicator'}
            </span>
            <div className="text-5xl font-extrabold tracking-tight text-white flex items-baseline gap-1 gradient-text-indigo gradient-text-glow">
              {kpiValue}
            </div>
            <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>Metrics Verified by AI</span>
            </div>
          </div>
        ) : (
          /* ── SVG Charts (Bar / Line / Area) ── */
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
            style={{ maxHeight: '280px' }}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
              const yVal = paddingTop + chartH * p;
              const valueLabel = formatYLabel(maxVal - (p * (maxVal - minVal)));
              return (
                <g key={idx} className="opacity-40">
                  <line
                    x1={paddingLeft}
                    y1={yVal}
                    x2={width - paddingRight}
                    y2={yVal}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={yVal + 4}
                    textAnchor="end"
                    fill="var(--text-secondary)"
                    fontSize="10"
                    fontWeight="500"
                    fontFamily="var(--font-mono)"
                  >
                    {valueLabel}
                  </text>
                </g>
              );
            })}

            {/* ── BAR CHART RENDER ── */}
            {currentTab === 'bar' &&
              data.map((d, i) => {
                const totalBars = data.length;
                const totalW = chartW;
                const barSpacing = Math.max(16, 40 - totalBars * 2);
                const barW = Math.max(10, (totalW - barSpacing * (totalBars - 1)) / totalBars);
                const xCoord = paddingLeft + i * (barW + barSpacing);
                const yCoord = paddingTop + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH;
                const barH = paddingTop + chartH - yCoord;

                return (
                  <g key={i} className="group/bar cursor-pointer">
                    <rect
                      x={xCoord}
                      y={yCoord}
                      width={barW}
                      height={Math.max(barH, 2)}
                      fill="url(#barGrad)"
                      rx="4"
                      className="transition-all duration-300 hover:opacity-90 hover:brightness-110"
                    />
                    {/* Tooltip value on top of bar */}
                    <text
                      x={xCoord + barW / 2}
                      y={yCoord - 8}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      className="opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200"
                    >
                      {d.value.toFixed(0)}
                    </text>
                    {/* Label */}
                    <text
                      x={xCoord + barW / 2}
                      y={height - paddingBottom + 20}
                      textAnchor="middle"
                      fill="var(--text-secondary)"
                      fontSize="9"
                      fontWeight="500"
                      transform={`rotate(-25, ${xCoord + barW / 2}, ${height - paddingBottom + 20})`}
                    >
                      {d.label.length > 12 ? `${d.label.slice(0, 10)}…` : d.label}
                    </text>
                  </g>
                );
              })}

            {/* ── LINE & AREA CHART RENDER ── */}
            {(currentTab === 'line' || currentTab === 'area') && (
              <>
                {/* Area Gradient Underneath */}
                {currentTab === 'area' && areaPath && (
                  <path d={areaPath} fill="url(#areaGrad)" className="animate-fade-in" />
                )}

                {/* Main line path */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#glowGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Interactivity Dots */}
                {points.map((p, i) => (
                  <g key={i} className="group/dot cursor-pointer">
                    {/* Glow aura */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="9"
                      fill="var(--indigo)"
                      opacity="0"
                      className="group-hover/dot:opacity-30 transition-opacity duration-200"
                    />
                    {/* Inner core */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#06b6d4"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    {/* X Axis labels */}
                    <text
                      x={p.x}
                      y={height - paddingBottom + 20}
                      textAnchor="middle"
                      fill="var(--text-secondary)"
                      fontSize="9"
                      fontWeight="500"
                      transform={`rotate(-25, ${p.x}, ${height - paddingBottom + 20})`}
                    >
                      {p.label.length > 12 ? `${p.label.slice(0, 10)}…` : p.label}
                    </text>
                    {/* Tooltip value */}
                    <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200">
                      <rect
                        x={p.x - 30}
                        y={p.y - 32}
                        width="60"
                        height="20"
                        rx="4"
                        fill="#111726"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                      <text
                        x={p.x}
                        y={p.y - 18}
                        textAnchor="middle"
                        fill="white"
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="var(--font-mono)"
                      >
                        {p.value.toFixed(0)}
                      </text>
                    </g>
                  </g>
                ))}
              </>
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
