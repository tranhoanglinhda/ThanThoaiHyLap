import type { RefObject } from "react";
import { byId, ROMAN } from "../data/pantheon";
import type { Deity } from "../data/pantheon";
import type { StatueHandle } from "./StatueScene";

function scrollToGod(id: string) {
  const el = document.getElementById("god-" + id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top: y, behavior: "smooth" });
  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");
}

interface Props {
  god: Deity;
  index: number;
  flip: boolean;
  nicheRef: RefObject<HTMLDivElement>;
  getHandle: (id: string) => StatueHandle | undefined;
}

export default function GodRow({ god, index, flip, nicheRef, getHandle }: Props) {
  const rel: [string, string[]][] = [];
  if (god.parents.length) rel.push(["Cha mẹ · Parents", god.parents]);
  if (god.consorts.length) rel.push(["Phối ngẫu · Consort", god.consorts]);
  if (god.children.length) rel.push(["Con cái · Children", god.children.slice(0, 6)]);

  const info = (
    <div className="god-info reveal">
      <div className="roman">
        {god.roman !== "—" ? "La Mã · " + god.roman : "Nguyên thủy · Primordial"}
      </div>
      <h3>{god.name}</h3>
      <div className="epithet">
        {god.epithet.vi} <span className="en">/ {god.epithet.en}</span>
      </div>
      <div className="god-desc">
        <div className="vi">{god.desc.vi}</div>
        <div className="en">{god.desc.en}</div>
      </div>
      <div className="attr-grid">
        <div className="cell">
          <div className="lab">Cai quản · Domain</div>
          <div className="val">
            {god.domain.vi}
            <small>{god.domain.en}</small>
          </div>
        </div>
        <div className="cell">
          <div className="lab">Biểu tượng · Symbol</div>
          <div className="val">
            {god.symbol.vi}
            <small>{god.symbol.en}</small>
          </div>
        </div>
      </div>
      {rel.length > 0 && (
        <div className="relation-chips" style={{ "--accent": god.accent } as React.CSSProperties}>
          {rel.map(([lab, ids], i) => (
            <span key={i} style={{ display: "contents" }}>
              <span className="rc-lab">{lab}</span>
              {ids.map((id) => {
                const g = byId(id);
                return g ? (
                  <a key={id} onClick={() => scrollToGod(id)}>
                    {g.name}
                  </a>
                ) : null;
              })}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const niche = (
    <div
      className="god-niche"
      ref={nicheRef}
      style={{ "--accent": god.accent } as React.CSSProperties}
    >
      <div className="niche-accent"></div>
      <div className="god-index">{god.roman !== "—" ? ROMAN[index] : "✶"}</div>
      <div className="niche-tools">
        <button title="Đặt lại góc nhìn" onClick={() => getHandle(god.id)?.reset()}>↺</button>
      </div>
    </div>
  );

  return (
    <section className={"god-row" + (flip ? " flip" : "")} id={"god-" + god.id}>
      {flip ? (
        <>
          {info}
          {niche}
        </>
      ) : (
        <>
          {niche}
          {info}
        </>
      )}
    </section>
  );
}
