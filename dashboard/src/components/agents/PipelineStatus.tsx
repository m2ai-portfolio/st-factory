interface PipelineStatusProps {
  stages: Record<string, number>;
  onStageClick?: (stage: string) => void;
}

const STAGE_ORDER = [
  "captured",
  "enriched",
  "evaluated",
  "awaiting_review",
  "approved",
  "scaffolded",
  "building",
  "built",
  "published",
  "rejected",
  "deferred",
];

const STAGE_COLORS: Record<string, string> = {
  captured: "bg-slate-600",
  enriched: "bg-blue-600",
  evaluated: "bg-indigo-600",
  awaiting_review: "bg-amber-600",
  approved: "bg-emerald-600",
  scaffolded: "bg-teal-600",
  building: "bg-cyan-600",
  built: "bg-sky-600",
  published: "bg-green-600",
  rejected: "bg-red-600",
  deferred: "bg-orange-600",
};

export function PipelineStatus({ stages, onStageClick }: PipelineStatusProps) {
  const total = Object.values(stages).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-slate-300 mb-3">
        Stage Funnel
      </h3>
      <div className="space-y-2">
        {STAGE_ORDER.filter((s) => (stages[s] || 0) > 0).map((stage) => {
          const count = stages[stage] || 0;
          const pct = Math.max((count / total) * 100, 4);
          const color = STAGE_COLORS[stage] || "bg-slate-600";
          return (
            <div
              key={stage}
              className={`flex items-center gap-3 ${
                onStageClick ? "cursor-pointer hover:bg-surface-overlay/30 -mx-2 px-2 py-0.5 rounded transition-colors" : ""
              }`}
              onClick={onStageClick ? () => onStageClick(stage) : undefined}
            >
              <span className="text-xs text-slate-500 w-28 text-right">
                {stage.replace(/_/g, " ")}
              </span>
              <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden">
                <div
                  className={`h-full ${color} rounded transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
