import { Component, Suspense, useMemo } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import modelManifest from "virtual:model-manifest";
import Placeholder from "./Placeholder";
import ProceduralStatue, { hasProceduralModel } from "./ProceduralStatue";

const AVAILABLE = new Set(modelManifest);

const FLOOR_Y = -2.1;
const TARGET_HEIGHT = 3.7;

/** Centre on X/Z, drop feet to the floor, and scale to a consistent height
 *  so models of any size frame nicely (README §2 normalisation). */
function normalize(source: THREE.Object3D): THREE.Object3D {
  const obj = source.clone(true);
  obj.updateWorldMatrix(true, true);
  let box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  if (size.y > 0) {
    const s = TARGET_HEIGHT / size.y;
    obj.scale.setScalar(s);
  }
  obj.updateWorldMatrix(true, true);
  box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  obj.position.x -= center.x;
  obj.position.z -= center.z;
  obj.position.y -= box.min.y - FLOOR_Y;
  return obj;
}

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const normalized = useMemo(() => normalize(scene), [scene]);
  return <primitive object={normalized} />;
}

/** Catches a failed/absent model load and shows the placeholder instead. */
class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev: { children: ReactNode }) {
    // reset when the child (e.g. a newly dropped model) changes
    if (prev.children !== this.props.children && this.state.failed) {
      this.setState({ failed: false });
    }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export interface StatueProps {
  accent: string;
  /** static slot path, e.g. "models/zeus.glb" (served from /public) */
  modelPath: string;
}

export default function Statue({ accent, modelPath }: StatueProps) {
  // Only touch the GLTF loader when there's actually a slot file present in
  // public/models (per the build manifest). Otherwise fall back to the
  // procedural deity built from THREE primitives, and only show the bare
  // placeholder for ids we can't build.
  const id = modelPath.replace(/^.*\//, "").replace(/\.(glb|gltf)$/i, "");
  const fallback = hasProceduralModel(id) ? <ProceduralStatue id={id} /> : <Placeholder accent={accent} />;

  const url = AVAILABLE.has(id) ? "/" + modelPath.replace(/^\/+/, "") : null;
  if (!url) return fallback;

  return (
    <ModelBoundary key={url} fallback={fallback}>
      <Suspense fallback={fallback}>
        <GLTFModel url={url} />
      </Suspense>
    </ModelBoundary>
  );
}
