import type { ActivityEvent } from "@/lib/types";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { TimeAgo } from "@/components/shared/TimeAgo";

const NODE_DOT_COLORS: Record<string, string> = {
  ultra_magnus: "bg-blue-500",
  sky_lynx: "bg-amber-500",
  academy: "bg-emerald-500",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  outcome: "Outcome",
  recommendation: "Recommendation",
  patch: "Patch",
};

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxItems?: number;
  onEventClick?: (event: ActivityEvent) => void;
}

export function ActivityFeed({ events, maxItems, onEventClick }: ActivityFeedProps) {
  const displayed = maxItems ? events.slice(0, maxItems) : events;

  if (displayed.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          Recent Activity
        </h3>
        <p className="text-sm text-slate-500">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-slate-300 mb-3">
        Recent Activity ({displayed.length})
      </h3>
      <div className="space-y-1">
        {displayed.map((event) => {
          const dotColor = NODE_DOT_COLORS[event.node_id] || "bg-slate-500";
          const typeLabel = EVENT_TYPE_LABELS[event.event_type] || event.event_type;

          return (
            <div
              key={`${event.event_type}-${event.id}`}
              className={`flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0 ${
                onEventClick ? "cursor-pointer hover:bg-surface-overlay/30 -mx-2 px-2 rounded" : ""
              }`}
              onClick={onEventClick ? () => onEventClick(event) : undefined}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
              <span className="text-xs text-slate-500 w-24 flex-shrink-0">
                {typeLabel}
              </span>
              <span className="text-sm text-slate-200 flex-1 min-w-0 truncate">
                {event.title}
              </span>
              <StatusBadge status={event.status} />
              <TimeAgo date={event.timestamp} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
