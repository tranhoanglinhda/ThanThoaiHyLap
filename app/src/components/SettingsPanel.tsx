import { useState } from "react";
import type { Tweaks } from "../hooks/useTweaks";

interface Props {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
}

const FONTS: Tweaks["displayFont"][] = ["Cinzel", "Cormorant", "Playfair", "EB Garamond"];

export default function SettingsPanel({ tweaks, setTweak }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="settings-panel" role="dialog" aria-label="Tinh chỉnh">
          <h4>Giao diện · Appearance</h4>
          <div className="set-row">
            <span>Theme</span>
            <div className="seg">
              {(["light", "dark"] as const).map((v) => (
                <button
                  key={v}
                  className={tweaks.theme === v ? "on" : ""}
                  onClick={() => setTweak("theme", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="set-row">
            <span>Font tiêu đề</span>
            <select
              className="set-select"
              value={tweaks.displayFont}
              onChange={(e) => setTweak("displayFont", e.target.value as Tweaks["displayFont"])}
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <h4>Tượng 3D · Statues</h4>
          <div className="set-row">
            <span>Tự xoay · Auto-rotate</span>
            <button
              className="swbtn"
              data-on={tweaks.autoRotate ? "1" : "0"}
              role="switch"
              aria-checked={tweaks.autoRotate}
              onClick={() => setTweak("autoRotate", !tweaks.autoRotate)}
            >
              <i />
            </button>
          </div>
          <div className="set-row">
            <span>Ánh sáng kịch tính</span>
            <button
              className="swbtn"
              data-on={tweaks.dramaticLight ? "1" : "0"}
              role="switch"
              aria-checked={tweaks.dramaticLight}
              onClick={() => setTweak("dramaticLight", !tweaks.dramaticLight)}
            >
              <i />
            </button>
          </div>
        </div>
      )}
      <button
        className="settings-fab"
        aria-label="Tinh chỉnh · Settings"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "✕" : "⚙"}
      </button>
    </>
  );
}
