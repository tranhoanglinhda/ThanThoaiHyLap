import { useCallback, useEffect, useState } from "react";

export interface Tweaks {
  theme: "light" | "dark";
  displayFont: "Cinzel" | "Cormorant" | "Playfair" | "EB Garamond";
  autoRotate: boolean;
  dramaticLight: boolean;
}

export const TWEAK_DEFAULTS: Tweaks = {
  theme: "dark",
  displayFont: "EB Garamond",
  autoRotate: true,
  dramaticLight: true,
};

const STORAGE_KEY = "pantheon-tweaks";

/** Settings store, persisted to localStorage (theme also drives the pre-paint script). */
export function useTweaks(): [Tweaks, <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void] {
  const [tweaks, setTweaks] = useState<Tweaks>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...TWEAK_DEFAULTS, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    // honour the theme the pre-paint inline script may have already applied
    const t = document.documentElement.getAttribute("data-theme");
    return t === "dark" ? { ...TWEAK_DEFAULTS, theme: "dark" } : TWEAK_DEFAULTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks));
    } catch {
      /* ignore */
    }
  }, [tweaks]);

  const setTweak = useCallback(
    <K extends keyof Tweaks>(key: K, value: Tweaks[K]) =>
      setTweaks((prev) => ({ ...prev, [key]: value })),
    []
  );

  return [tweaks, setTweak];
}
