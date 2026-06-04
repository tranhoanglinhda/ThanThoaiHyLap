import type * as THREE from "three";

export interface DeityMeta {
  id: string;
  name: string;
  greek: string;
  gen: string;
  domain: string;
  color: number;
  symbols: string[];
  blurb: string;
}

export const GODS: DeityMeta[];
export const GODS_BY_ID: Record<string, DeityMeta>;

/** Build a deity as a THREE.Group (feet at y=0, faces +Z, ~2.2 units tall).
 *  The group carries `userData.update(t)` for idle animation. */
export function createDeity(id: string): THREE.Group;
export function createAllDeities(): { meta: DeityMeta; model: THREE.Group }[];
