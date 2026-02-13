import { StatusBadge } from "@/components/layout/StatusBadge";

const SOURCE_DOT_COLORS: Record<string, string> = {
  ok: "bg-emerald-400",
  degraded: "bg-amber-400",
  error: "bg-red-400",
};

interface HealthBannerProps {
  loopHealth: string;
  cycleCount: number;
  sources: Record<string, string>;
}

export function HealthBanner({ loopHealth, cycleCount, sources }: HealthBannerProps) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-slate-500">Loop Health</p>
          <StatusBadge status={loopHealth} />
        </div>
        <div>
          <p className="text-xs text-slate-500">Cycles</p>
          <p className="text-lg font-semibold">{cycleCount}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {Object.entries(sources).map(([name, status]) => {
          const isOk = status.startsWith("ok");
          const dotColor = isOk
            ? SOURCE_DOT_COLORS.ok
            : status.includes("error")
            ? SOURCE_DOT_COLORS.error
            : SOURCE_DOT_COLORS.degraded;
          return (
            <div key={name} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dotColor}`} />
              <span className="text-xs text-slate-400">
                {name.replace(/_/g, " ")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
