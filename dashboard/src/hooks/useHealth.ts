import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

export function useHealth() {
  return useSWR<HealthResponse>("/api/v1/health", apiFetch, {
    refreshInterval: 30000,
  });
}
