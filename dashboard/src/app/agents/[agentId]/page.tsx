"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAgentDetail } from "@/hooks/useAgents";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PersonaDetail } from "@/components/agents/PersonaDetail";

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const { data, error, isLoading, mutate } = useAgentDetail(agentId);

  if (isLoading) return <LoadingState message="Loading persona..." />;
  if (error)
    return (
      <ErrorState
        message={`Failed to load agent: ${error.message}`}
        onRetry={() => mutate()}
      />
    );
  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/agents" className="text-slate-500 hover:text-slate-300">
          &larr; Agents
        </Link>
        <h2 className="text-xl font-semibold">{data.name}</h2>
        <span className="badge badge-healthy">{data.category}</span>
      </div>
      <PersonaDetail agent={data} />
    </div>
  );
}
