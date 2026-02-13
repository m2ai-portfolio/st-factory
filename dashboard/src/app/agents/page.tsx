"use client";

import { useAgents } from "@/hooks/useAgents";
import { AgentCard } from "@/components/agents/AgentCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

export default function AgentsPage() {
  const { data, error, isLoading, mutate } = useAgents();

  if (isLoading) return <LoadingState message="Loading agents..." />;
  if (error)
    return (
      <ErrorState
        message={`Failed to load agents: ${error.message}`}
        onRetry={() => mutate()}
      />
    );
  if (!data) return null;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Personas ({data.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
