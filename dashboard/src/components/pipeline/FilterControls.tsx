interface FilterControlsProps {
  stages: Record<string, number>;
  selectedStage: string | null;
  selectedStatus: string | null;
  onStageChange: (stage: string | null) => void;
  onStatusChange: (status: string | null) => void;
}

const STATUS_OPTIONS = ["active", "completed", "rejected", "deferred"];

export function FilterControls({
  stages,
  selectedStage,
  selectedStatus,
  onStageChange,
  onStatusChange,
}: FilterControlsProps) {
  const hasFilters = selectedStage || selectedStatus;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={selectedStage || ""}
        onChange={(e) => onStageChange(e.target.value || null)}
        className="bg-surface-raised border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All stages</option>
        {Object.entries(stages).map(([stage, count]) => (
          <option key={stage} value={stage}>
            {stage.replace(/_/g, " ")} ({count})
          </option>
        ))}
      </select>

      <select
        value={selectedStatus || ""}
        onChange={(e) => onStatusChange(e.target.value || null)}
        className="bg-surface-raised border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => {
            onStageChange(null);
            onStatusChange(null);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
