/**
 * KPICards — Animated metric cards shown at the top of the dashboard.
 * Values seeded from the demo database.
 * Layout: 4 col desktop / 2 col tablet / 1 col mobile.
 * No absolute-positioned children that overlap sibling cards.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { Package, Users, ShoppingCart, IndianRupee } from 'lucide-react';

interface KPIDef {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  note: string;
  icon: React.ReactNode;
  accent: string;      // Tailwind text color
  iconBg: string;      // Tailwind bg+border combo
  glowRgb: string;     // "r,g,b" for box-shadow glow
}

const KPIS: KPIDef[] = [
  {
    id: 'products',
    label: 'Products',
    value: 10,
    note: 'Across 5 categories',
    icon: <Package className="w-4.5 h-4.5" />,
    accent: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    glowRgb: '99,102,241',
  },
  {
    id: 'customers',
    label: 'Customers',
    value: 7,
    note: 'Active since 2023',
    icon: <Users className="w-4.5 h-4.5" />,
    accent: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    glowRgb: '168,85,247',
  },
  {
    id: 'orders',
    label: 'Orders',
    value: 7,
    note: 'Q1–Q2 2024',
    icon: <ShoppingCart className="w-4.5 h-4.5" />,
    accent: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    glowRgb: '6,182,212',
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: 2704.88,
    prefix: '₹',
    decimals: 2,
    note: 'Total sales volume',
    icon: <IndianRupee className="w-4.5 h-4.5" />,
    accent: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    glowRgb: '16,185,129',
  },
];

/** Animated counter that counts up from 0 to `target` on scroll-into-view. */
function Counter({ target, prefix = '', decimals = 0 }: { target: number; prefix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const DURATION = 1200;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(eased * target);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  const formatted = decimals > 0
    ? display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(display).toLocaleString('en-IN');

  return (
    <span ref={ref}>
      {prefix}{formatted}
    </span>
  );
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

export default function KPICards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
    >
      {KPIS.map((kpi) => (
        <motion.div
          key={kpi.id}
          variants={cardVariants}
          whileHover={{ y: -2, transition: { duration: 0.18 } }}
          className="card-premium p-5 flex flex-col gap-3 cursor-default"
          style={{
            boxShadow: `0 2px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}
        >
          {/* Top row: icon + note — using flex, no absolute positioning */}
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${kpi.iconBg} ${kpi.accent}`}>
              {kpi.icon}
            </div>
            <span className="text-[9px] font-semibold text-gray-500 tracking-wide text-right leading-tight max-w-[100px]">
              {kpi.note}
            </span>
          </div>

          {/* Value + label */}
          <div>
            <p className={`text-2xl font-extrabold tracking-tight ${kpi.accent}`}>
              <Counter target={kpi.value} prefix={kpi.prefix} decimals={kpi.decimals} />
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 font-semibold uppercase tracking-widest">
              {kpi.label}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
