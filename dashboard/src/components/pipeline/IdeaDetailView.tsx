import type { IdeaDetail } from "@/lib/types";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { TimeAgo } from "@/components/shared/TimeAgo";
import { PipelineResultSection } from "./PipelineResultSection";

interface IdeaDetailViewProps {
  idea: IdeaDetail;
}

export function IdeaDetailView({ idea }: IdeaDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header badges */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={idea.stage} />
        <StatusBadge status={idea.status} />
        {idea.overall_score != null && (
          <span className="badge badge-healthy font-mono">
            Score: {idea.overall_score.toFixed(1)}
          </span>
        )}
        {idea.recommendation && (
          <span className="text-xs text-slate-400">
            Rec: {idea.recommendation}
          </span>
        )}
      </div>

      {/* Timestamps */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>Caught: <TimeAgo date={idea.caught_at} /></span>
        {idea.completed_at && (
          <span>Completed: <TimeAgo date={idea.completed_at} /></span>
        )}
      </div>

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {idea.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Raw content */}
      <div className="card">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Content</h3>
        <p className="text-sm text-slate-400 whitespace-pre-line">{idea.raw_content}</p>
        {idea.source_context && (
          <p className="text-xs text-slate-500 mt-2">Source: {idea.source_context}</p>
        )}
      </div>

      {/* Pipeline results (collapsible) */}
      <div className="space-y-2">
        <PipelineResultSection title="Enrichment" data={idea.enrichment_result} defaultOpen />
        <PipelineResultSection title="Evaluation" data={idea.evaluation_result} defaultOpen />
        <PipelineResultSection title="Scaffolding" data={idea.scaffolding_result} />
        <PipelineResultSection title="Build" data={idea.build_result} />
      </div>

      {/* Review */}
      {idea.review_decision && (
        <div className="card">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Review Decision</h3>
          <StatusBadge status={idea.review_decision} />
          {idea.review_notes && (
            <p className="text-sm text-slate-400 mt-2">{idea.review_notes}</p>
          )}
        </div>
      )}

      {/* GitHub link */}
      {idea.github_url && (
        <a
          href={idea.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View on GitHub &rarr;
        </a>
      )}
    </div>
  );
}
