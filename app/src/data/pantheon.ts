/* ===========================================================================
   PANTHEON DATA — single source of truth.
   Imports handoff/pantheon.json directly (the same file shipped in the
   handoff package). Relationships are by `id`; `generation` drives the
   family-tree tiers; `model` is the slot a real .glb gets dropped into.
   =========================================================================== */
import raw from "../../../handoff/pantheon.json";

export type Bilingual = { vi: string; en: string };
export type GroupKey = "primordial" | "titan" | "olympian";

export interface Deity {
  id: string;
  name: string;
  roman: string;
  group: GroupKey;
  generation: number;
  accent: string;
  epithet: Bilingual;
  domain: Bilingual;
  symbol: Bilingual;
  desc: Bilingual;
  parents: string[];
  consorts: string[];
  children: string[];
  model: string;
}

export type Groups = Record<GroupKey, Bilingual>;

const data = raw as { groups: Groups; deities: Deity[] };

export const PANTHEON: Deity[] = data.deities;
export const GROUPS: Groups = data.groups;

export const byId = (id: string): Deity | undefined =>
  PANTHEON.find((g) => g.id === id);

export const ROMAN = [
  "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];
