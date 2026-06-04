import { createRef, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject, RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { PANTHEON, GROUPS, ROMAN } from "../data/pantheon";
import type { GroupKey } from "../data/pantheon";
import { useReveal } from "../hooks/useReveal";
import StatueScene from "./StatueScene";
import type { StatueHandle } from "./StatueScene";
import GodRow from "./GodRow";

const GROUP_ORDER: GroupKey[] = ["primordial", "titan", "olympian"];
const GROUP_EYEBROW: Record<GroupKey, string> = {
  primordial: "Khởi nguyên",
  titan: "Thế hệ Titan",
  olympian: "Đỉnh Olympus",
};

interface Props {
  autoRotate: boolean;
  lightBoost: number;
}

export default function Gallery({ autoRotate, lightBoost }: Props) {
  useReveal();

  // one DOM ref per god, shared between the niche <div> and its <View>
  const nicheRefs = useMemo(() => {
    const m: Record<string, RefObject<HTMLDivElement>> = {};
    PANTHEON.forEach((g) => (m[g.id] = createRef<HTMLDivElement>()));
    return m;
  }, []);

  // imperative reset handles, registered by each StatueScene
  const handles = useRef<Record<string, StatueHandle | undefined>>({});
  const registerHandle = (id: string, handle: StatueHandle | null) => {
    handles.current[id] = handle ?? undefined;
  };
  const getHandle = (id: string) => handles.current[id];

  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  useEffect(() => setEventSource(document.getElementById("root")), []);

  let romanCount = 0;
  let flip = false;

  return (
    <>
      {/* one shared renderer; each <View> scissors to its niche element */}
      {eventSource && (
        <div className="scene-canvas">
          <Canvas eventSource={eventSource} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
            {PANTHEON.map((god) => (
            <View key={god.id} track={nicheRefs[god.id] as MutableRefObject<HTMLElement>}>
              <StatueScene
                god={god}
                autoRotate={autoRotate}
                lightBoost={lightBoost}
                registerHandle={registerHandle}
              />
            </View>
            ))}
            <View.Port />
          </Canvas>
        </div>
      )}

      <div className="wrap">
        {GROUP_ORDER.map((grp, gi) => {
          const list = PANTHEON.filter((x) => x.group === grp);
          return (
            <div key={grp}>
              <div className="group-band reveal">
                <div className="gb-num">{ROMAN[gi + 1]}</div>
                <div className="gb-text">
                  <span>{GROUP_EYEBROW[grp]}</span>
                  <h3>
                    {GROUPS[grp].vi} · {GROUPS[grp].en}
                  </h3>
                </div>
                <div className="gb-line"></div>
              </div>
              {list.map((god) => {
                romanCount += 1;
                flip = !flip;
                return (
                  <GodRow
                    key={god.id}
                    god={god}
                    index={romanCount}
                    flip={flip}
                    nicheRef={nicheRefs[god.id]}
                    getHandle={getHandle}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
