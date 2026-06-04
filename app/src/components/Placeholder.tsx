import { useMemo } from "react";
import * as THREE from "three";

const MARBLE = 0xece7db;

/**
 * Procedural marble bust placeholder — the "slot" each god awaits until a real
 * .glb is dropped in. Geometry mirrors the prototype's _buildPlaceholder.
 */
export default function Placeholder({ accent }: { accent: string }) {
  const accentColor = useMemo(() => new THREE.Color(accent || "#c79a4e"), [accent]);

  const bustProfile = useMemo(
    () =>
      (
        [
          [0.001, 0.0],
          [0.6, 0.02],
          [0.66, 0.18],
          [0.6, 0.4],
          [0.46, 0.62],
          [0.3, 0.82],
          [0.205, 1.02],
          [0.19, 1.18],
        ] as [number, number][]
      ).map(([x, y]) => new THREE.Vector2(x, y)),
    []
  );

  const emissive = useMemo(() => accentColor.clone().multiplyScalar(0.18), [accentColor]);

  return (
    <group>
      {/* shared marble material via per-mesh declaration keeps it simple */}
      {/* plinth (stepped base) */}
      <mesh position={[0, -1.95, 0]}>
        <cylinderGeometry args={[1.18, 1.28, 0.34, 48]} />
        <meshStandardMaterial color={MARBLE} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[0, -1.66, 0]}>
        <cylinderGeometry args={[0.92, 1.02, 0.26, 48]} />
        <meshStandardMaterial color={MARBLE} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* accent inlay ring */}
      <mesh position={[0, -1.53, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.035, 16, 64]} />
        <meshStandardMaterial color={accentColor} roughness={0.35} metalness={0.5} emissive={emissive} />
      </mesh>
      {/* column / pedestal */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.62, 0.72, 1.5, 48]} />
        <meshStandardMaterial color={MARBLE} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.86, 0.78, 0.16, 48]} />
        <meshStandardMaterial color={MARBLE} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* bust — lathe shoulders */}
      <mesh position={[0, 0.16, 0]}>
        <latheGeometry args={[bustProfile, 56]} />
        <meshStandardMaterial color={MARBLE} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.165, 0.2, 0.22, 32]} />
        <meshStandardMaterial color={MARBLE} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.78, 0]} scale={[0.92, 1.12, 0.96]}>
        <sphereGeometry args={[0.32, 40, 32]} />
        <meshStandardMaterial color={MARBLE} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* suggested brow/nose ridge so the bust reads a facing direction */}
      <mesh position={[0, 1.74, 0.3]} rotation={[Math.PI / 2.05, 0, 0]}>
        <coneGeometry args={[0.055, 0.16, 12]} />
        <meshStandardMaterial color={MARBLE} roughness={0.72} metalness={0.04} />
      </mesh>
    </group>
  );
}
