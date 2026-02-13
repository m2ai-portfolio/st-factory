import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { IdeaSummary, IdeaDetail } from "@/lib/types";

export function usePipeline(stage?: string, status?: string) {
  const params = new URLSearchParams();
  if (stage) params.set("stage", stage);
  if (status) params.set("status", status);
  const query = params.toString();
  const path = `/api/v1/pipeline/ideas${query ? `?${query}` : ""}`;

  return useSWR<IdeaSummary[]>(path, apiFetch, {
    refreshInterval: 30000,
  });
}

export function useIdeaDetail(ideaId: number | null) {
  return useSWR<IdeaDetail>(
    ideaId ? `/api/v1/pipeline/ideas/${ideaId}` : null,
    apiFetch,
    { refreshInterval: 30000 }
  );
}

export function useStages() {
  return useSWR<Record<string, number>>("/api/v1/pipeline/stages", apiFetch, {
    refreshInterval: 30000,
  });
}
