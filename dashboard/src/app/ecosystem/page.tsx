"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEcosystem } from "@/hooks/useEcosystem";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { MetricCard } from "@/components/shared/MetricCard";

const EcosystemCanvas = dynamic(
  () =>
    import("@/components/ecosystem/EcosystemCanvas").then(
      (m) => m.EcosystemCanvas
    ),
  { ssr: false }
);

export default function EcosystemPage() {
  const { data, error, isLoading, mutate } = useEcosystem();
  const router = useRouter();

  if (isLoading) return <LoadingState message="Loading ecosystem..." />;
  if (error)
    return (
      <ErrorState
        message={`Failed to load ecosystem: ${error.message}`}
        onRetry={() => mutate()}
      />
    );
  if (!data) return null;

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Back link */}
      <div className="px-4 pt-3">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
          &larr; Dashboard
        </Link>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <EcosystemCanvas
          data={data}
          onNodeClick={(nodeId) => router.push(`/nodes/${nodeId}`)}
        />
      </div>

      {/* Bottom metric strip */}
      <div className="p-4 border-t border-slate-700/50 grid grid-cols-3 gap-4">
        {data.nodes.map((node) => (
          <MetricCard
            key={node.node_id}
            label={node.display_name}
            value={node.record_count}
            sub={node.health_status}
          />
        ))}
      </div>
    </div>
  );
}
