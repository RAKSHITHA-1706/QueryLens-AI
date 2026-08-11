import { CheckCircle2, Loader2, CircleDashed } from 'lucide-react';

interface StatusTrackerProps {
  statusArray?: string[];
  isLoading: boolean;
}

export default function StatusTracker({ statusArray, isLoading }: StatusTrackerProps) {
  if (!statusArray || statusArray.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 mt-4 rounded-xl bg-white/5 ring-1 ring-white/10">
      {statusArray.map((status, idx) => {
        const isLast = idx === statusArray.length - 1;
        const isActive = isLast && isLoading;
        const isComplete = !isActive || (!isLast && isLoading);

        return (
          <div key={idx} className="flex items-center gap-2">
            {isActive ? (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            ) : isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <CircleDashed className="w-4 h-4 text-white/20" />
            )}
            <span className={`text-sm ${isActive ? 'text-indigo-300 font-medium' : 'text-white/60'}`}>
              {status}
            </span>
            {!isLast && <div className="w-4 h-px bg-white/20 mx-1" />}
          </div>
        );
      })}
    </div>
  );
}
