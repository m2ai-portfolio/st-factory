"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEcosystem } from "@/hooks/useEcosystem";
import { useHealth } from "@/hooks/useHealth";
import { useActivity } from "@/hooks/useActivity";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { HealthBanner } from "@/components/home/HealthBanner";
import { NodeStatusCard } from "@/components/home/NodeStatusCard";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import type { ActivityEvent } from "@/lib/types";

export default function DashboardPage() {
  const { data: ecosystem, error: ecoError, isLoading: ecoLoading, mutate: ecoMutate } = useEcosystem();
  const { data: health } = useHealth();
  const { data: activity } = useActivity(20);
  const router = useRouter();

  if (ecoLoading) return <LoadingState message="Loading dashboard..." />;
  if (ecoError)
    return (
      <ErrorState
        message={`Failed to load dashboard: ${ecoError.message}`}
        onRetry={() => ecoMutate()}
      />
    );
  if (!ecosystem) return null;

  const handleEventClick = (event: ActivityEvent) => {
    switch (event.event_type) {
      case "outcome":
        // Outcomes map to the UM node or could go to pipeline detail
        if (event.detail.idea_id) {
          router.push(`/pipeline/${event.detail.idea_id}`);
        } else {
          router.push("/nodes/ultra_magnus");
        }
        break;
      case "recommendation":
        router.push("/nodes/sky_lynx");
        break;
      case "patch":
        router.push("/nodes/academy");
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Health Banner */}
      <HealthBanner
        loopHealth={ecosystem.loop_health}
        cycleCount={ecosystem.cycle_count}
        sources={health?.sources ?? {}}
      />

      {/* Node Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ecosystem.nodes.map((node) => (
          <NodeStatusCard
            key={node.node_id}
            node={node}
            onClick={() => router.push(`/nodes/${node.node_id}`)}
          />
        ))}
      </div>

      {/* Activity Feed */}
      {activity && (
        <ActivityFeed
          events={activity}
          maxItems={20}
          onEventClick={handleEventClick}
        />
      )}

      {/* Link to 3D topology */}
      <Link
        href="/ecosystem"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        View 3D Topology &rarr;
      </Link>
    </div>
  );
}
