"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useNodeDetail } from "@/hooks/useNodeDetail";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { TimeAgo } from "@/components/shared/TimeAgo";

export default function NodeDetailPage() {
  const params = useParams();
  const nodeId = params.nodeId as string;
  const { data, error, isLoading, mutate } = useNodeDetail(nodeId);

  if (isLoading) return <LoadingState message="Loading node detail..." />;
  if (error)
    return (
      <ErrorState
        message={`Failed to load node: ${error.message}`}
        onRetry={() => mutate()}
      />
    );
  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-slate-500 hover:text-slate-300">
          &larr; Dashboard
        </Link>
        <h2 className="text-xl font-semibold">{data.display_name}</h2>
        <StatusBadge status={data.health_status} />
      </div>

      {/* Metrics — responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-slate-500">Records</p>
          <p className="text-2xl font-semibold">{data.metrics.record_count}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-2xl font-semibold">{data.metrics.pending_count}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Last Activity</p>
          <p className="text-lg mt-1">
            <TimeAgo date={data.last_activity} />
          </p>
        </div>
      </div>

      {/* Breakdown */}
      {data.metrics.breakdown && (
        <div className="card">
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(data.metrics.breakdown).map(([key, val]) => (
              <div key={key} className="text-center">
                <p className="text-lg font-semibold">{val}</p>
                <p className="text-xs text-slate-500">{key}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent records */}
      <div className="card">
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          Recent Records
        </h3>
        {data.recent_records.length === 0 ? (
          <p className="text-sm text-slate-500">No records yet</p>
        ) : (
          <div className="space-y-2">
            {data.recent_records.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-200 truncate">{rec.title}</p>
                  <p className="text-xs text-slate-500">
                    {rec.record_type} &middot; {rec.id}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <StatusBadge status={rec.status} />
                  <TimeAgo date={rec.emitted_at} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
