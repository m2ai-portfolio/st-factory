"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useIdeaDetail } from "@/hooks/usePipeline";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { IdeaDetailView } from "@/components/pipeline/IdeaDetailView";

export default function IdeaDetailPage() {
  const params = useParams();
  const ideaId = params.ideaId ? Number(params.ideaId) : null;
  const { data, error, isLoading, mutate } = useIdeaDetail(ideaId);

  if (isLoading) return <LoadingState message="Loading idea..." />;
  if (error)
    return (
      <ErrorState
        message={`Failed to load idea: ${error.message}`}
        onRetry={() => mutate()}
      />
    );
  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pipeline" className="text-slate-500 hover:text-slate-300">
          &larr; Pipeline
        </Link>
        <h2 className="text-xl font-semibold">{data.title}</h2>
      </div>
      <IdeaDetailView idea={data} />
    </div>
  );
}
