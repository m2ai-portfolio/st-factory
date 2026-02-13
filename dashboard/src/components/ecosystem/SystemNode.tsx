"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { GrowthTier } from "@/lib/growth";

interface SystemNodeProps {
  nodeId: string;
  geometry: "icosahedron" | "octahedron" | "dodecahedron";
  color: string;
  tier: GrowthTier;
  onNodeClick?: (nodeId: string) => void;
}

const GEOMETRY_COMPONENTS = {
  icosahedron: (args: [number, number]) => <icosahedronGeometry args={args} />,
  octahedron: (args: [number, number]) => <octahedronGeometry args={args} />,
  dodecahedron: (args: [number, number]) => <dodecahedronGeometry args={args} />,
};

export function SystemNode({ nodeId, geometry, color, tier, onNodeClick }: SystemNodeProps) {
  const meshRef = useRef<Mesh>(null);

  // Slow rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  const GeometryEl = GEOMETRY_COMPONENTS[geometry];
  const detail = tier.tier >= 3 ? 1 : 0;

  return (
    <mesh
      ref={meshRef}
      scale={tier.scale}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick?.(nodeId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {GeometryEl([0.6, detail])}
      <meshStandardMaterial
        color={color}
        wireframe={tier.wireframe}
        emissive={color}
        emissiveIntensity={tier.emissiveIntensity}
        transparent={tier.wireframe}
        opacity={tier.wireframe ? 0.6 : 1}
      />
    </mesh>
  );
}
