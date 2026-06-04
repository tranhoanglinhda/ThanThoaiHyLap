import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createDeity, GODS_BY_ID } from "../lib/pantheon3d/gods.js";

const FLOOR_Y = -2.1;
const TARGET_HEIGHT = 3.7;

/** ids for which a procedural model exists (17 of the 20 pantheon entries). */
export const hasProceduralModel = (id: string): boolean => id in GODS_BY_ID;

/** Renders one deity built procedurally from THREE primitives (no .glb).
 *  Normalised to the same floor/height as the GLB path in Statue.tsx so the
 *  framing matches, and ticks its idle animation every frame. */
export default function ProceduralStatue({ id }: { id: string }) {
  const { deity, scale } = useMemo(() => {
    const group = createDeity(id);
    group.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    // centre on X/Z; Y (feet) stays at 0 and is driven by the idle bob.
    let box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.x -= center.x;
    group.position.z -= center.z;

    box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const s = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    return { deity: group, scale: s };
  }, [id]);

  useFrame((state) => {
    deity.userData.update?.(state.clock.getElapsedTime());
  });

  return (
    <group scale={scale} position={[0, FLOOR_Y, 0]}>
      <primitive object={deity} />
    </group>
  );
}
