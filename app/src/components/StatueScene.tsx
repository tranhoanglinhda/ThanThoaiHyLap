import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Statue from "./Statue";
import type { Deity } from "../data/pantheon";

export interface StatueHandle {
  zoom: (factor: number) => void;
  reset: () => void;
}

const CAM_HOME = new THREE.Vector3(0, 1.1, 7.4);
const TARGET = new THREE.Vector3(0, 0.55, 0);

interface Props {
  god: Deity;
  autoRotate: boolean;
  lightBoost: number;
  registerHandle: (id: string, handle: StatueHandle | null) => void;
}

/** The contents of one niche's <View>: camera, museum lighting, the statue,
 *  and OrbitControls. Registers imperative zoom/reset for the niche tools. */
export default function StatueScene({ god, autoRotate, lightBoost, registerHandle }: Props) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const accent = god.accent || "#c79a4e";

  useEffect(() => {
    const handle: StatueHandle = {
      zoom: (factor) => {
        const cam = camRef.current;
        const controls = controlsRef.current;
        if (!cam || !controls) return;
        const t = controls.target;
        const v = cam.position.clone().sub(t).multiplyScalar(factor);
        cam.position.copy(t).add(v);
        controls.update();
      },
      reset: () => {
        const cam = camRef.current;
        const controls = controlsRef.current;
        if (!cam || !controls) return;
        cam.position.copy(CAM_HOME);
        controls.target.copy(TARGET);
        controls.update();
      },
    };
    registerHandle(god.id, handle);
    return () => registerHandle(god.id, null);
  }, [god.id, registerHandle]);

  return (
    <>
      <PerspectiveCamera ref={camRef} makeDefault fov={34} position={[0, 1.1, 7.4]} near={0.1} far={100} />

      {/* museum lighting — boosted by the "dramatic light" tweak */}
      <hemisphereLight color={0xfff6e6} groundColor={0x6b5b40} intensity={0.95 * lightBoost} />
      <directionalLight color={0xfff4e2} intensity={1.35 * lightBoost} position={[-3, 5, 4]} />
      <directionalLight color={0xdfe6ff} intensity={0.5 * lightBoost} position={[4, 1.5, 2]} />
      <pointLight color={accent} intensity={0.7 * lightBoost} distance={18} position={[0, 2.2, -3.4]} />

      <Statue accent={accent} modelPath={god.model} />

      {/* soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
        <circleGeometry args={[2.1, 48]} />
        <meshBasicMaterial color={0x281e0f} transparent opacity={0.32} depthWrite={false} />
      </mesh>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.55}
        maxPolarAngle={1.95}
        rotateSpeed={0.85}
        autoRotate={autoRotate}
        autoRotateSpeed={1.1}
        target={[0, 0.55, 0]}
      />
    </>
  );
}
