/* ============================================================
   family-tree.jsx — node-link genealogy laid out by generation.
   Click a god to highlight parents, children & consorts; the
   rest dims. Click empty space to clear.
   ============================================================ */

function FamilyTree() {
  const [sel, setSel] = React.useState(null);
  const P = window.PANTHEON;

  // tier (generation) -> y of box top
  const TIER_Y = { 0: 26, 1: 132, 2: 244, 3: 372, 4: 520 };
  const TIER_LABEL = {
    0: { vi: "Hư Không", en: "Void" },
    1: { vi: "Nguyên thủy", en: "Primordial" },
    2: { vi: "Titan", en: "Titans" },
    3: { vi: "Olympus · đời I", en: "Olympians I" },
    4: { vi: "Olympus · đời II", en: "Olympians II" }
  };
  const W = 1320, MARGIN_L = 150, MARGIN_R = 40, BOXW = 120, BOXH = 50, H = 620;

  const layout = React.useMemo(() => {
    const pos = {};
    const innerW = W - MARGIN_L - MARGIN_R;
    [0, 1, 2, 3, 4].forEach(gen => {
      const list = P.filter(g => g.generation === gen);
      list.forEach((g, i) => {
        const cx = MARGIN_L + (i + 0.5) * (innerW / list.length);
        pos[g.id] = { cx, cyTop: TIER_Y[gen], cyBot: TIER_Y[gen] + BOXH, gen };
      });
    });
    return pos;
  }, []);

  // parent -> child edges
  const edges = [];
  P.forEach(g => g.parents.forEach(pid => {
    if (layout[pid] && layout[g.id]) edges.push({ from: pid, to: g.id });
  }));

  // kin of selection
  const kin = new Set();
  if (sel) {
    const g = window.byId(sel);
    [...g.parents, ...g.children, ...g.consorts].forEach(id => kin.add(id));
  }
  const isLit = (e) => sel && (e.from === sel || e.to === sel);

  const edgePath = (e) => {
    const a = layout[e.from], b = layout[e.to];
    const x1 = a.cx, y1 = a.cyBot, x2 = b.cx, y2 = b.cyTop;
    const my = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
  };

  return (
    <div className="tree-section wrap" id="tree-section">
      <div className="section-head reveal">
        <div className="eyebrow">Phả hệ thần linh · Divine Bloodline</div>
        <h2>Cây Gia Phả</h2>
        <p>Từ Hư Không đến đỉnh Olympus — chạm vào một vị thần để lần theo quan hệ</p>
      </div>
      <div className="tree-frame reveal">
        <div className="tree-hint">Chạm vào một vị thần để làm nổi bật cha mẹ, con cái và phối ngẫu · Tap a deity to trace their relations</div>
        <div className="tree-scroll">
          <svg className={"tree-svg tree" + (sel ? " has-selection" : "")} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <rect x="0" y="0" width={W} height={H} fill="transparent" onClick={() => setSel(null)} />

            {/* tier labels */}
            {[0, 1, 2, 3, 4].map(gen => (
              <g key={"t" + gen}>
                <text className="tree-tier-label" x="20" y={TIER_Y[gen] + 22}>{TIER_LABEL[gen].vi}</text>
                <text className="tree-tier-label" x="20" y={TIER_Y[gen] + 38} style={{ opacity: .55, fontSize: 9 }}>{TIER_LABEL[gen].en}</text>
                <line x1="150" y1={TIER_Y[gen] - 14} x2={W - 30} y2={TIER_Y[gen] - 14} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 6" opacity=".5" />
              </g>
            ))}

            {/* edges */}
            {edges.map((e, i) => (
              <path key={i} className={"tree-edge" + (isLit(e) ? " lit" : "")} d={edgePath(e)} />
            ))}

            {/* nodes */}
            {P.map(g => {
              const p = layout[g.id];
              if (!p) return null;
              const cls = "tree-node" + (sel === g.id ? " sel" : kin.has(g.id) ? " kin" : "");
              return (
                <g key={g.id} className={cls} onClick={(ev) => { ev.stopPropagation(); setSel(sel === g.id ? null : g.id); }}>
                  <rect className="node-card" x={p.cx - BOXW / 2} y={p.cyTop} width={BOXW} height={BOXH} rx="9" />
                  <circle cx={p.cx - BOXW / 2 + 12} cy={p.cyTop + 12} r="4" fill={g.accent} />
                  <text x={p.cx} y={p.cyTop + 26} textAnchor="middle" fontSize="16">{g.name}</text>
                  <text className="gen-lab" x={p.cx} y={p.cyTop + 40} textAnchor="middle" fontSize="9.5">{g.epithet.vi.length > 18 ? g.epithet.vi.slice(0, 17) + "…" : g.epithet.vi}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="tree-legend">
          <div className="lg"><span className="sw" style={{ background: "var(--gold)" }}></span> Đang chọn · Selected</div>
          <div className="lg"><span className="sw" style={{ background: "var(--line)", border: "1px solid var(--gold)" }}></span> Liên quan · Related</div>
          <div className="lg"><span className="sw" style={{ background: "var(--line)" }}></span> Dòng dõi · Lineage</div>
        </div>
      </div>
    </div>
  );
}

window.FamilyTree = FamilyTree;
