import type { NodeMetrics } from "@/lib/types";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { TimeAgo } from "@/components/shared/TimeAgo";

const NODE_ACCENT: Record<string, string> = {
  ultra_magnus: "border-l-blue-500",
  sky_lynx: "border-l-amber-500",
  academy: "border-l-emerald-500",
};

interface NodeStatusCardProps {
  node: NodeMetrics;
  onClick?: () => void;
}

export function NodeStatusCard({ node, onClick }: NodeStatusCardProps) {
  const accent = NODE_ACCENT[node.node_id] || "border-l-slate-500";

  return (
    <div
      className={`card border-l-4 ${accent} ${
        onClick ? "cursor-pointer hover:bg-surface-overlay/30 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-200">{node.display_name}</h3>
        <StatusBadge status={node.health_status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-slate-500">Records</p>
          <p className="text-lg font-semibold">{node.record_count}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-lg font-semibold">{node.pending_count}</p>
        </div>
      </div>
      {node.last_activity && (
        <p className="text-xs text-slate-500 mt-2">
          Last activity: <TimeAgo date={node.last_activity} />
        </p>
      )}
    </div>
  );
}
