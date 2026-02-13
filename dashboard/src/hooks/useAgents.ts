import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { AgentSummary, AgentDetail } from "@/lib/types";

export function useAgents() {
  return useSWR<AgentSummary[]>("/api/v1/agents", apiFetch, {
    refreshInterval: 30000,
  });
}

export function useAgentDetail(agentId: string | null) {
  return useSWR<AgentDetail>(
    agentId ? `/api/v1/agents/${agentId}` : null,
    apiFetch,
    { refreshInterval: 30000 }
  );
}
