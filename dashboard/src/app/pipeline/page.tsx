"use client";

import { useState } from "react";
import Link from "next/link";
import { usePipeline, useStages } from "@/hooks/usePipeline";
import { PipelineStatus } from "@/components/agents/PipelineStatus";
import { FilterControls } from "@/components/pipeline/FilterControls";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { TimeAgo } from "@/components/shared/TimeAgo";

export default function PipelinePage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data: ideas, error, isLoading, mutate } = usePipeline(
    selectedStage ?? undefined,
    selectedStatus ?? undefined
  );
  const { data: stages } = useStages();

  if (isLoading) return <LoadingState message="Loading pipeline..." />;
  if (error)
    return (
      <ErrorState
        message={`Failed to load pipeline: ${error.message}`}
        onRetry={() => mutate()}
      />
    );
  if (!ideas) return null;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Pipeline</h2>

      {/* Stage funnel */}
      {stages && (
        <PipelineStatus
          stages={stages}
          onStageClick={(stage) => setSelectedStage(stage === selectedStage ? null : stage)}
        />
      )}

      {/* Filter controls */}
      {stages && (
        <FilterControls
          stages={stages}
          selectedStage={selectedStage}
          selectedStatus={selectedStatus}
          onStageChange={setSelectedStage}
          onStatusChange={setSelectedStatus}
        />
      )}

      {/* Ideas list */}
      <div className="card">
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          Ideas ({ideas.length})
        </h3>
        <div className="space-y-2">
          {ideas.map((idea) => (
            <Link
              key={idea.id}
              href={`/pipeline/${idea.id}`}
              className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0 hover:bg-surface-overlay/30 -mx-2 px-2 rounded transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{idea.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {idea.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {idea.overall_score != null && (
                  <span className="text-sm font-mono text-slate-300">
                    {idea.overall_score.toFixed(0)}
                  </span>
                )}
                <StatusBadge status={idea.stage} />
                <TimeAgo date={idea.caught_at} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
