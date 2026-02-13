"use client";

import { OrbitControls } from "@react-three/drei";
import { SystemNode } from "./SystemNode";
import { FlowEdge } from "./FlowEdge";
import { NodeLabel } from "./NodeLabel";
import type { EcosystemSnapshot } from "@/lib/types";
import { NODE_COLORS, type NodeId } from "@/lib/colors";
import { calculateTier } from "@/lib/growth";
import { calculateEdgeState } from "@/lib/growth";

// Triangle layout positions
const NODE_POSITIONS: Record<string, [number, number, number]> = {
  ultra_magnus: [0, 2, 0],
  sky_lynx: [-2.5, -1.2, 0],
  academy: [2.5, -1.2, 0],
};

// Geometry types per node
const NODE_GEOMETRY: Record<string, "icosahedron" | "octahedron" | "dodecahedron"> = {
  ultra_magnus: "icosahedron",
  sky_lynx: "octahedron",
  academy: "dodecahedron",
};

interface EcosystemSceneProps {
  data: EcosystemSnapshot;
  onNodeClick?: (nodeId: string) => void;
}

export function EcosystemScene({ data, onNodeClick }: EcosystemSceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#4488ff" />

      {/* Nodes */}
      {data.nodes.map((node) => {
        const pos = NODE_POSITIONS[node.node_id] || [0, 0, 0];
        const color = NODE_COLORS[node.node_id as NodeId]?.hex || "#888";
        const geometry = NODE_GEOMETRY[node.node_id] || "icosahedron";
        const tier = calculateTier(node.record_count);

        return (
          <group key={node.node_id} position={pos}>
            <SystemNode
              nodeId={node.node_id}
              geometry={geometry}
              color={color}
              tier={tier}
              onNodeClick={onNodeClick}
            />
            <NodeLabel
              name={node.display_name}
              count={node.record_count}
              status={node.health_status}
            />
          </group>
        );
      })}

      {/* Edges */}
      {data.edges.map((edge) => {
        const start = NODE_POSITIONS[edge.source] || [0, 0, 0];
        const end = NODE_POSITIONS[edge.target] || [0, 0, 0];
        const state = calculateEdgeState(edge.recent_count);

        return (
          <FlowEdge
            key={`${edge.source}-${edge.target}`}
            start={start}
            end={end}
            state={state}
            label={edge.label}
          />
        );
      })}

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
      />
    </>
  );
}
