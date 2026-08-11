import { Lightbulb } from 'lucide-react';

interface ExplanationPanelProps {
  explanation?: string;
}

export default function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  if (!explanation) return null;

  return (
    <div className="w-full rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 backdrop-blur-sm shadow-xl mt-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90 mb-1">Explanation</h3>
          <p className="text-sm text-white/70 leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
