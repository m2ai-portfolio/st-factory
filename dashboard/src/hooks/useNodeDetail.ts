import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { NodeDetail } from "@/lib/types";

export function useNodeDetail(nodeId: string | null) {
  return useSWR<NodeDetail>(
    nodeId ? `/api/v1/nodes/${nodeId}` : null,
    apiFetch,
    { refreshInterval: 30000 }
  );
}
