import { useEffect, useState } from "react";

export default function TopBar({ onToggleTheme }: { onToggleTheme: () => void }) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTree = () => {
    const el = document.getElementById("tree-section");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  return (
    <div className={"topbar" + (solid ? " solid" : "")}>
      <a href="#top" className="brand">PANTHEON</a>
      <div className="controls">
        <button className="tb-btn" onClick={toTree}>Gia phả · Tree</button>
        <button className="tb-btn" onClick={onToggleTheme}>◐ Theme</button>
      </div>
    </div>
  );
}
