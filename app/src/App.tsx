import { useEffect } from "react";
import { useTweaks } from "./hooks/useTweaks";
import TopBar from "./components/TopBar";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";
import FamilyTree from "./components/FamilyTree";
import Footer from "./components/Footer";
import SettingsPanel from "./components/SettingsPanel";

const FONT_MAP: Record<string, string> = {
  Cinzel: '"Cinzel", serif',
  Cormorant: '"Cormorant Garamond", serif',
  Playfair: '"Playfair Display", serif',
  "EB Garamond": '"EB Garamond", serif',
};

export default function App() {
  const [t, setTweak] = useTweaks();

  // theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    try {
      localStorage.setItem("pantheon-theme", t.theme);
    } catch {
      /* ignore */
    }
  }, [t.theme]);

  // display font
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-display",
      FONT_MAP[t.displayFont] ?? FONT_MAP.Cinzel
    );
  }, [t.displayFont]);

  const lightBoost = t.dramaticLight ? 1.5 : 1;

  return (
    <>
      <TopBar onToggleTheme={() => setTweak("theme", t.theme === "light" ? "dark" : "light")} />
      <Hero />
      <Gallery autoRotate={t.autoRotate} lightBoost={lightBoost} />
      <FamilyTree />
      <Footer />
      <SettingsPanel tweaks={t} setTweak={setTweak} />
    </>
  );
}
