/* ============================================================
   gallery.jsx — hero, group bands, god rows (3D niche + text),
   top bar, footer. Boots the shared StatueStage and exposes it
   on window.__stage for the Tweaks panel.
   ============================================================ */
const { useEffect, useRef, useState, useCallback } = React;

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

function byId(id) { return window.PANTHEON.find(g => g.id === id); }
function scrollToGod(id) {
  const el = document.getElementById("god-" + id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top: y, behavior: "smooth" });
  el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse");
}

/* ---------- reveal-on-scroll ---------- */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

/* ---------- Top bar ---------- */
function TopBar() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const toggleTheme = () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    const next = cur === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("pantheon-theme", next); } catch (e) {}
  };
  return (
    <div className={"topbar" + (solid ? " solid" : "")}>
      <a href="#top" className="brand">PANTHEON</a>
      <div className="controls">
        <button className="tb-btn" onClick={() => { const t = document.getElementById("tree-section"); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" }); }}>Gia phả · Tree</button>
        <button className="tb-btn" onClick={toggleTheme}>◐ Theme</button>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <header className="hero" id="top">
      <div className="kicker">Thần thoại Hy Lạp · Greek Mythology</div>
      <h1>PANTHEON<span className="sub">Mười hai vị thần Olympus & dòng dõi thần linh</span></h1>
      <div className="hr-rule"></div>
      <p className="lede">
        Một thư viện điêu khắc tương tác: xoay từng pho tượng, lần theo cây gia phả từ Hư Không nguyên thủy đến đỉnh Olympus.
        <br/><span style={{ fontStyle: "italic", fontSize: ".9em", opacity: .8 }}>Rotate each marble, then trace the bloodline from primordial Chaos to the heights of Olympus.</span>
      </p>
      <div className="scroll-cue">Cuộn để khám phá</div>
    </header>
  );
}

/* ---------- A single god row ---------- */
function GodRow({ god, index, flip, stageRef, handlesRef }) {
  const nicheRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!stageRef.current || !nicheRef.current) return;
    const item = stageRef.current.add(nicheRef.current, god);
    handlesRef.current[god.id] = item;
    return () => {};
  }, []);

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && /\.(glb|gltf)$/i.test(f.name) && handlesRef.current[god.id]) {
      stageRef.current.loadModelFromFile(handlesRef.current[god.id], f, (err) => { if (!err) setLoaded(true); });
    }
  };

  const rel = [];
  if (god.parents.length) rel.push(["Cha mẹ · Parents", god.parents]);
  if (god.consorts.length) rel.push(["Phối ngẫu · Consort", god.consorts]);
  if (god.children.length) rel.push(["Con cái · Children", god.children.slice(0, 6)]);

  const info = (
    <div className="god-info reveal">
      <div className="roman">{god.roman !== "—" ? "La Mã · " + god.roman : "Nguyên thủy · Primordial"}</div>
      <h3>{god.name}</h3>
      <div className="epithet">{god.epithet.vi} <span className="en">/ {god.epithet.en}</span></div>
      <div className="god-desc">
        <div className="vi">{god.desc.vi}</div>
        <div className="en">{god.desc.en}</div>
      </div>
      <div className="attr-grid">
        <div className="cell"><div className="lab">Cai quản · Domain</div><div className="val">{god.domain.vi}<small>{god.domain.en}</small></div></div>
        <div className="cell"><div className="lab">Biểu tượng · Symbol</div><div className="val">{god.symbol.vi}<small>{god.symbol.en}</small></div></div>
      </div>
      {rel.length > 0 && (
        <div className="relation-chips" style={{ "--accent": god.accent }}>
          {rel.map(([lab, ids], i) => (
            <React.Fragment key={i}>
              <span className="rc-lab">{lab}</span>
              {ids.map(id => { const g = byId(id); return g ? <a key={id} onClick={() => scrollToGod(id)}>{g.name}</a> : null; })}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );

  const niche = (
    <div
      className={"god-niche" + (dragOver ? " drag-over" : "")}
      ref={nicheRef}
      style={{ "--accent": god.accent }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div className="niche-accent"></div>
      <div className="god-index">{god.roman !== "—" ? ROMAN[index] : "✶"}</div>
      <div className="niche-tools">
        <button title="Thu nhỏ" onClick={(e) => { e.stopPropagation(); stageRef.current.zoom(handlesRef.current[god.id], 1.18); }}>−</button>
        <button title="Phóng to" onClick={(e) => { e.stopPropagation(); stageRef.current.zoom(handlesRef.current[god.id], 0.85); }}>+</button>
        <button title="Đặt lại" onClick={(e) => { e.stopPropagation(); stageRef.current.reset(handlesRef.current[god.id]); }}>↺</button>
      </div>
      <div className="niche-badge"><span className="dot"></span>{loaded ? "Model đã gắn · loaded" : "Kéo thả .glb · model slot"}</div>
    </div>
  );

  return (
    <section className={"god-row" + (flip ? " flip" : "")} id={"god-" + god.id}>
      {flip ? <>{info}{niche}</> : <>{niche}{info}</>}
    </section>
  );
}

/* ---------- Gallery (groups + rows) ---------- */
function Gallery() {
  const stageRef = useRef(null);
  const handlesRef = useRef({});
  const [ready, setReady] = useState(false);
  useReveal();

  useEffect(() => {
    const canvas = document.getElementById("scene-canvas");
    stageRef.current = new window.StatueStage(canvas);
    window.__stage = stageRef.current;
    setReady(true);
    return () => {};
  }, []);

  const groups = ["primordial", "titan", "olympian"];
  const G = window.PANTHEON_GROUPS;
  let romanCount = 0;
  let flip = false;

  return (
    <div className="wrap">
      {groups.map((grp, gi) => {
        const list = window.PANTHEON.filter(x => x.group === grp);
        return (
          <div key={grp}>
            <div className="group-band reveal">
              <div className="gb-num">{ROMAN[gi + 1]}</div>
              <div className="gb-text">
                <span>{grp === "primordial" ? "Khởi nguyên" : grp === "titan" ? "Thế hệ Titan" : "Đỉnh Olympus"}</span>
                <h3>{G[grp].vi} · {G[grp].en}</h3>
              </div>
              <div className="gb-line"></div>
            </div>
            {ready && list.map((god) => {
              romanCount += 1; flip = !flip;
              return <GodRow key={god.id} god={god} index={romanCount} flip={flip} stageRef={stageRef} handlesRef={handlesRef} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer wrap">
      <div className="mark">⚺ PANTHEON ⚺</div>
      <p>
        Thư viện điêu khắc tương tác về thần thoại Hy Lạp · Mỗi bệ là một khung chờ model 3D (.glb/.gltf).
        Each pedestal is a slot awaiting a real 3D model — drag one onto any niche to see it live.
      </p>
    </footer>
  );
}

Object.assign(window, { TopBar, Hero, Gallery, Footer, scrollToGod, byId, ROMAN });
