import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { ActivityEvent } from "@/lib/types";

export function useActivity(limit: number = 50) {
  return useSWR<ActivityEvent[]>(
    `/api/v1/activity?limit=${limit}`,
    apiFetch,
    { refreshInterval: 15000 }
  );
}
