// ============================================================================
//  parts.js — Shared low-poly building blocks for the Greek Gods 3D set.
//  Pure procedural geometry from THREE primitives. No external assets.
//  Style: low-poly marble statues + domain-colored glowing accents.
// ============================================================================
import * as THREE from 'three';

// ----------------------------------------------------------------------------
//  Materials  (cached so 17 statues don't allocate hundreds of materials)
// ----------------------------------------------------------------------------
const _matCache = new Map();
function cached(key, make) {
  if (!_matCache.has(key)) _matCache.set(key, make());
  return _matCache.get(key);
}

/** Warm flat-shaded marble. tint lets a god lean cooler/warmer. */
export function marble(tint = 0xeae7dd) {
  return cached('marble_' + tint, () => new THREE.MeshStandardMaterial({
    color: tint, roughness: 0.92, metalness: 0.0, flatShading: true,
  }));
}

/** Darker stone for bases / contrast pieces. */
export function stone(tint = 0x9b968c) {
  return cached('stone_' + tint, () => new THREE.MeshStandardMaterial({
    color: tint, roughness: 0.96, metalness: 0.02, flatShading: true,
  }));
}

/** Polished metal — gold, bronze, iron for props. */
export function metal(color = 0xc9a227, rough = 0.35) {
  return cached(`metal_${color}_${rough}`, () => new THREE.MeshStandardMaterial({
    color, roughness: rough, metalness: 0.95, flatShading: true,
  }));
}

/** Emissive domain accent — the colored "glow" of each god. */
export function glow(color, intensity = 1.4) {
  return cached(`glow_${color}_${intensity}`, () => new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: intensity,
    roughness: 0.4, metalness: 0.1, flatShading: true,
  }));
}

// ----------------------------------------------------------------------------
//  Tiny geometry helpers — each returns a Mesh positioned at origin.
// ----------------------------------------------------------------------------
export const box = (w, h, d, m, seg = 1) =>
  new THREE.Mesh(new THREE.BoxGeometry(w, h, d, seg, seg, seg), m);

export const cyl = (rt, rb, h, m, rad = 8) =>
  new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, rad, 1), m);

export const sph = (r, m, det = 1) =>
  new THREE.Mesh(new THREE.IcosahedronGeometry(r, det), m);

export const cone = (r, h, m, rad = 8) =>
  new THREE.Mesh(new THREE.ConeGeometry(r, h, rad, 1), m);

export const torus = (r, t, m, rad = 16, tub = 8) =>
  new THREE.Mesh(new THREE.TorusGeometry(r, t, tub, rad), m);

/** Bell / drape shape from a profile, low-poly via radial segments. */
export function lathe(points, m, seg = 9) {
  const pts = points.map((p) => new THREE.Vector2(p[0], p[1]));
  return new THREE.Mesh(new THREE.LatheGeometry(pts, seg), m);
}

function place(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

// ----------------------------------------------------------------------------
//  Humanoid  — low-poly robed figure with posable arms.
//  Feet at y = 0. Returns { group, handR, handL, head, chest }.
//  handR / handL are empty Object3Ds at the palms — attach props to them.
// ----------------------------------------------------------------------------
export function buildHumanoid(opts = {}) {
  const {
    skin = marble(),
    robe = marble(0xe4e0d4),
    accent = glow(0x66ccff),
    pose = 'staff',
    legs = false,         // warriors show legs instead of a robe skirt
    robeColor = null,
  } = opts;

  const robeMat = robeColor ? marble(robeColor) : robe;
  const g = new THREE.Group();

  // --- lower body -----------------------------------------------------------
  if (legs) {
    for (const s of [-1, 1]) {
      const thigh = cyl(0.14, 0.12, 0.55, skin, 7);
      place(thigh, s * 0.17, 0.6, 0);
      const shin = cyl(0.11, 0.09, 0.55, skin, 7);
      place(shin, s * 0.17, 0.05 + 0.0, 0); shin.position.y = 0.32; // overlap
      const foot = box(0.18, 0.1, 0.34, skin); place(foot, s * 0.17, 0.05, 0.06);
      // skirt-let (battle skirt)
      g.add(thigh, shin, foot);
    }
    const kilt = lathe([[0.0, 0.95], [0.34, 0.92], [0.4, 0.78], [0.36, 0.66], [0.0, 0.66]], robeMat, 8);
    g.add(kilt);
  } else {
    // flowing toga: bell skirt from floor up to waist
    const skirt = lathe([
      [0.0, 0.0], [0.52, 0.02], [0.46, 0.3], [0.4, 0.62],
      [0.34, 0.95], [0.3, 1.18], [0.0, 1.2],
    ], robeMat, 9);
    g.add(skirt);
  }

  // --- torso ----------------------------------------------------------------
  const waistY = legs ? 0.92 : 1.0;
  const torso = cyl(0.27, 0.31, 0.66, robeMat, 8);
  place(torso, 0, waistY + 0.33, 0);
  // a draped sash across the chest for the accent color
  const sash = box(0.62, 0.14, 0.18, accent);
  sash.rotation.z = 0.5; place(sash, 0.02, waistY + 0.42, 0.2); sash.scale.z = 1.3;
  g.add(torso, sash);

  const shoulderY = waistY + 0.66;
  // shoulders
  const shoulders = cyl(0.1, 0.1, 0.62, skin, 7);
  shoulders.rotation.z = Math.PI / 2; place(shoulders, 0, shoulderY, 0);
  g.add(shoulders);

  // --- neck + head ----------------------------------------------------------
  const neck = cyl(0.09, 0.1, 0.16, skin, 7);
  place(neck, 0, shoulderY + 0.12, 0); g.add(neck);
  const head = new THREE.Group();
  const skull = sph(0.19, skin, 1); skull.scale.set(0.92, 1.08, 0.96);
  const nose = cone(0.04, 0.12, skin, 4); nose.rotation.x = Math.PI / 2; place(nose, 0, -0.01, 0.18);
  head.add(skull, nose);
  head.position.set(0, shoulderY + 0.34, 0);
  g.add(head);

  // --- arms (posable) -------------------------------------------------------
  function buildArm(side) {
    // side: -1 left, +1 right
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.32, shoulderY, 0);
    const upper = cyl(0.085, 0.075, 0.46, skin, 7);
    upper.position.y = -0.23; shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.46; shoulder.add(elbow);
    const fore = cyl(0.07, 0.06, 0.44, skin, 7);
    fore.position.y = -0.22; elbow.add(fore);
    const hand = new THREE.Object3D(); hand.position.y = -0.46; elbow.add(hand);
    const palm = sph(0.07, skin, 0); palm.scale.set(1, 1.2, 0.7); hand.add(palm);
    return { shoulder, elbow, hand };
  }
  const R = buildArm(1), L = buildArm(-1);
  g.add(R.shoulder, L.shoulder);

  // --- pose presets ---------------------------------------------------------
  applyPose(pose, R, L);

  g.userData.handR = R.hand;
  g.userData.handL = L.hand;
  g.userData.head = head;
  g.userData.shoulderY = shoulderY;
  return { group: g, handR: R.hand, handL: L.hand, head, shoulderY };
}

function applyPose(pose, R, L) {
  const set = (arm, sx, sz, ex) => { arm.shoulder.rotation.x = sx; arm.shoulder.rotation.z = sz; arm.elbow.rotation.x = ex; };
  switch (pose) {
    case 'raised': // right arm overhead (Zeus bolt, Poseidon trident)
      set(R, 0.2, -2.5, -0.5); set(L, 0.1, 0.25, -0.3); break;
    case 'offering': // both forearms forward, prop in front
      set(R, -1.4, 0.15, -0.7); set(L, -1.4, -0.15, -0.7); break;
    case 'weapon': // right holds weapon out, left holds shield
      set(R, -0.6, -0.2, -0.6); set(L, 0.15, 0.4, -1.4); break;
    case 'lyre': // both hands up near chest
      set(R, -1.1, 0.2, -1.0); set(L, -1.0, -0.1, -1.2); break;
    case 'rest': // arms relaxed at sides
      set(R, 0.05, 0.18, -0.25); set(L, 0.05, -0.18, -0.25); break;
    case 'staff': default: // right arm bent gripping a vertical staff
      set(R, -0.5, 0.05, -1.15); set(L, 0.08, 0.2, -0.3); break;
  }
}

// ----------------------------------------------------------------------------
//  Headpieces — slot onto humanoid.head
// ----------------------------------------------------------------------------
export function headLaurel(color = 0xc9a227) {
  const g = new THREE.Group();
  const ring = torus(0.2, 0.018, metal(color), 14, 6);
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.08; g.add(ring);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const leaf = cone(0.03, 0.09, metal(color), 4);
    leaf.position.set(Math.cos(a) * 0.2, 0.08, Math.sin(a) * 0.2);
    leaf.rotation.set(Math.PI / 2, a, 0.4); g.add(leaf);
  }
  return g;
}
export function headCrown(color = 0xc9a227, gem = 0xff4d6d) {
  const g = new THREE.Group();
  const band = cyl(0.2, 0.2, 0.1, metal(color), 9); band.position.y = 0.12; g.add(band);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const spike = cone(0.035, 0.13, metal(color), 4);
    spike.position.set(Math.cos(a) * 0.19, 0.23, Math.sin(a) * 0.19); g.add(spike);
  }
  const jewel = sph(0.05, glow(gem, 1.6), 0); jewel.position.set(0, 0.16, 0.2); g.add(jewel);
  return g;
}
export function headHelmet(color = 0xb8c0cc, crest = 0xc9a227) {
  const g = new THREE.Group();
  const dome = sph(0.21, metal(color), 1); dome.scale.set(1, 1.05, 1); dome.position.y = 0.04; g.add(dome);
  const guard = box(0.06, 0.22, 0.34, metal(color)); guard.position.set(0, -0.02, 0.16); g.add(guard);
  const crestMesh = box(0.04, 0.14, 0.42, glow(crest, 1.0)); crestMesh.position.set(0, 0.2, -0.02);
  crestMesh.geometry.translate(0, 0, 0); g.add(crestMesh);
  return g;
}
export function headHorns(color = 0xe8e2d0) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const horn = cone(0.05, 0.26, marble(color), 5);
    horn.position.set(s * 0.16, 0.16, 0); horn.rotation.z = s * 0.6; horn.rotation.x = -0.3; g.add(horn);
  }
  return g;
}
export function headVeil(color = 0xc9a227) {
  const g = new THREE.Group();
  const v = lathe([[0.0, 0.2], [0.22, 0.16], [0.26, 0.0], [0.24, -0.2], [0.0, -0.24]], glow(color, 0.5), 9);
  v.scale.set(1, 1, 1.1); v.position.y = -0.02; g.add(v);
  return g;
}
export function headHalo(color = 0xffd24d) {
  const g = new THREE.Group();
  const ring = torus(0.26, 0.02, glow(color, 1.8), 24, 8);
  ring.position.y = 0.05; ring.rotation.x = 0.5; g.add(ring);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const ray = box(0.02, 0.02, 0.12, glow(color, 1.4));
    ray.position.set(Math.cos(a) * 0.32, 0.05, Math.sin(a) * 0.32);
    ray.lookAt(0, 0.05, 0); g.add(ray);
  }
  return g;
}

// ----------------------------------------------------------------------------
//  Props — built so the GRIP sits at local origin; attach to a hand Object3D.
// ----------------------------------------------------------------------------
export function propTrident(color = 0x2bb3c0) {
  const g = new THREE.Group();
  const shaft = cyl(0.025, 0.03, 1.7, metal(color, 0.4), 6); g.add(shaft);
  const head = new THREE.Group(); head.position.y = 0.9;
  const bar = cyl(0.02, 0.02, 0.5, metal(color, 0.4), 6); bar.rotation.z = Math.PI / 2; head.add(bar);
  for (const x of [-0.24, 0, 0.24]) {
    const p = cone(0.035, 0.32, metal(color, 0.3), 5); p.position.set(x, 0.16, 0); head.add(p);
  }
  const orb = sph(0.05, glow(color, 1.6), 0); orb.position.y = -0.4; g.add(head, orb);
  return g;
}
export function propBolt(color = 0x9fe3ff) {
  const g = new THREE.Group();
  const m = glow(color, 2.0);
  const pts = [[0, 0], [0.12, 0.22], [0.0, 0.26], [0.14, 0.5], [-0.02, 0.54], [0.1, 0.78]];
  let prev = new THREE.Vector3(0, -0.3, 0);
  pts.forEach((p, i) => {
    const v = new THREE.Vector3(p[0], p[1] - 0.3, 0);
    const seg = box(0.06, prev.distanceTo(v), 0.06, m);
    seg.position.copy(prev.clone().add(v).multiplyScalar(0.5));
    seg.lookAt(v); seg.rotateX(Math.PI / 2); g.add(seg); prev = v;
  });
  // mirror downward for a double-ended bolt
  const lower = g.clone(); lower.scale.y = -0.7; lower.position.y = -0.0; g.add(lower);
  return g;
}
export function propStaff(color = 0xc9a227, topType = 'orb') {
  const g = new THREE.Group();
  const shaft = cyl(0.028, 0.032, 1.6, metal(color, 0.4), 6); g.add(shaft);
  if (topType === 'orb') { const o = sph(0.08, glow(color, 1.4), 0); o.position.y = 0.84; g.add(o); }
  if (topType === 'pinecone') {
    const pc = sph(0.09, glow(0x86c232, 1.0), 0); pc.scale.y = 1.6; pc.position.y = 0.88; g.add(pc);
  }
  return g;
}
export function propSpear(color = 0xb8c0cc) {
  const g = new THREE.Group();
  const shaft = cyl(0.022, 0.026, 1.9, metal(0x8a6b3b, 0.6), 6); g.add(shaft);
  const tip = cone(0.05, 0.3, metal(color, 0.25), 5); tip.position.y = 1.05; g.add(tip);
  return g;
}
export function propShield(color = 0xc9a227, face = 0xb8c0cc) {
  const g = new THREE.Group();
  const disc = cyl(0.42, 0.42, 0.07, metal(face, 0.5), 16); disc.rotation.x = Math.PI / 2; g.add(disc);
  const rim = torus(0.42, 0.04, metal(color, 0.4), 20, 8); g.add(rim);
  const boss = sph(0.1, metal(color, 0.3), 1); boss.position.z = 0.06; g.add(boss);
  return g;
}
export function propSword(color = 0xd9dde2) {
  const g = new THREE.Group();
  const blade = box(0.07, 0.95, 0.02, metal(color, 0.2)); blade.position.y = 0.55; g.add(blade);
  const tip = cone(0.05, 0.16, metal(color, 0.2), 4); tip.position.y = 1.06; g.add(tip);
  const guard = box(0.28, 0.05, 0.06, metal(0xc9a227, 0.4)); guard.position.y = 0.06; g.add(guard);
  const grip = cyl(0.03, 0.03, 0.18, stone(0x5b4632), 6); grip.position.y = -0.06; g.add(grip);
  return g;
}
export function propBow(color = 0xc9a227) {
  const g = new THREE.Group();
  const curve = torus(0.5, 0.025, metal(color, 0.4), 16, 6, Math.PI);
  curve.geometry = new THREE.TorusGeometry(0.5, 0.025, 6, 16, Math.PI * 1.1);
  curve.rotation.z = Math.PI / 2 - 0.16; g.add(curve);
  const string = cyl(0.004, 0.004, 0.98, glow(0xffffff, 0.4), 4); string.position.x = 0.0; g.add(string);
  return g;
}
export function propCaduceus(color = 0xc9a227) {
  const g = new THREE.Group();
  const shaft = cyl(0.022, 0.026, 1.4, metal(color, 0.35), 6); g.add(shaft);
  // wings
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const f = box(0.02, 0.04, 0.12 - i * 0.02, glow(0xffffff, 0.6));
      f.position.set(s * (0.06 + i * 0.04), 0.62 - i * 0.03, 0); f.rotation.y = s * 0.4; g.add(f);
    }
  }
  const orb = sph(0.05, glow(color, 1.4), 0); orb.position.y = 0.72; g.add(orb);
  // twin snakes (helix-ish)
  for (const s of [-1, 1]) {
    for (let i = 0; i < 10; i++) {
      const t = i / 10, a = t * Math.PI * 3 * s;
      const bead = sph(0.022, glow(0x86c232, 0.8), 0);
      bead.position.set(Math.cos(a) * 0.06, -0.5 + t * 1.0, Math.sin(a) * 0.06); g.add(bead);
    }
  }
  return g;
}
export function propHammer(color = 0x6b6b6b) {
  const g = new THREE.Group();
  const handle = cyl(0.03, 0.035, 0.9, stone(0x5b4632), 6); g.add(handle);
  const headM = box(0.34, 0.22, 0.22, metal(color, 0.5)); headM.position.y = 0.5; g.add(headM);
  const ember = sph(0.05, glow(0xff7a1a, 1.8), 0); ember.position.set(0.2, 0.5, 0); g.add(ember);
  return g;
}
export function propWheat(color = 0xd9a441) {
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const stalk = cyl(0.012, 0.012, 0.8, glow(color, 0.6), 4);
    stalk.position.set(Math.cos(a) * 0.05, 0.4, Math.sin(a) * 0.05); stalk.rotation.z = Math.cos(a) * 0.12;
    const ear = cone(0.05, 0.22, glow(color, 0.8), 5); ear.position.set(Math.cos(a) * 0.09, 0.86, Math.sin(a) * 0.09);
    g.add(stalk, ear);
  }
  return g;
}
export function propThyrsus(color = 0x8e44ad) {
  const g = propStaff(0xc9a227, 'pinecone');
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const leaf = cone(0.03, 0.12, glow(color, 0.9), 4);
    leaf.position.set(Math.cos(a) * 0.07, 0.6 + (i % 2) * 0.08, Math.sin(a) * 0.07);
    leaf.rotation.set(Math.PI / 2, a, 0); g.add(leaf);
  }
  return g;
}
export function propMirror(color = 0xff7eb6) {
  const g = new THREE.Group();
  const disc = cyl(0.18, 0.18, 0.03, metal(color, 0.2), 14); disc.rotation.x = Math.PI / 2; disc.position.y = 0.4; g.add(disc);
  const handle = cyl(0.02, 0.025, 0.4, metal(0xc9a227, 0.3), 6); g.add(handle);
  const heart = sph(0.05, glow(color, 1.6), 0); heart.position.set(0, 0.4, 0.03); g.add(heart);
  return g;
}
export function propScythe(color = 0x9aa0a6) {
  const g = new THREE.Group();
  const shaft = cyl(0.03, 0.035, 1.9, stone(0x4a4036), 6); g.add(shaft);
  const blade = torus(0.42, 0.03, metal(color, 0.3), 18, 6, Math.PI * 0.9);
  blade.geometry = new THREE.TorusGeometry(0.42, 0.03, 6, 18, Math.PI * 0.9);
  blade.position.y = 0.9; blade.rotation.z = -0.4; g.add(blade);
  const edge = glow(0xc9a227, 1.2);
  const tip = cone(0.04, 0.18, edge, 5); tip.position.set(0.42, 1.3, 0); tip.rotation.z = Math.PI; g.add(tip);
  return g;
}
export function propLyre(color = 0xc9a227) {
  const g = new THREE.Group();
  const base = box(0.26, 0.1, 0.06, metal(color, 0.35)); g.add(base);
  for (const s of [-1, 1]) {
    const arm = torus(0.26, 0.02, metal(color, 0.35), 14, 6, Math.PI * 0.7);
    arm.geometry = new THREE.TorusGeometry(0.26, 0.02, 6, 14, Math.PI * 0.7);
    arm.position.set(s * 0.12, 0.26, 0); arm.rotation.z = s * 0.6; g.add(arm);
  }
  const cross = box(0.34, 0.03, 0.03, metal(color, 0.35)); cross.position.y = 0.42; g.add(cross);
  for (let i = -2; i <= 2; i++) {
    const str = cyl(0.004, 0.004, 0.4, glow(0xffffff, 0.5), 4); str.position.set(i * 0.05, 0.22, 0); g.add(str);
  }
  return g;
}

// Attach a prop into a hand with a local grip transform.
export function grip(hand, prop, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1 } = {}) {
  prop.position.set(x, y, z); prop.rotation.set(rx, ry, rz); prop.scale.setScalar(s);
  hand.add(prop); return prop;
}

// ----------------------------------------------------------------------------
//  Pedestal + canvas nameplate
// ----------------------------------------------------------------------------
export function buildPedestal(name, greek, accentColor) {
  const g = new THREE.Group();
  const drum = cyl(0.95, 1.05, 0.5, stone(0xb9b3a6), 16); drum.position.y = 0.25; g.add(drum);
  const top = cyl(1.02, 1.0, 0.12, stone(0xcfc9bb), 16); top.position.y = 0.56; g.add(top);
  const ring = torus(0.96, 0.04, glow(accentColor, 1.0), 32, 8); ring.rotation.x = Math.PI / 2; ring.position.y = 0.5; g.add(ring);
  const base = cyl(1.12, 1.18, 0.14, stone(0x8d887c), 16); base.position.y = 0.07; g.add(base);

  // nameplate texture
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(20,20,24,0.0)'; cx.fillRect(0, 0, 512, 256);
  cx.textAlign = 'center';
  cx.fillStyle = '#f4f1e8'; cx.font = 'bold 70px Georgia, serif';
  cx.fillText(name.toUpperCase(), 256, 110);
  cx.fillStyle = '#' + accentColor.toString(16).padStart(6, '0');
  cx.font = '46px Georgia, serif';
  cx.fillText(greek, 256, 180);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.75),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  plate.position.set(0, 0.3, 1.07); g.add(plate);
  g.userData.plate = plate;
  return g;
}

// ----------------------------------------------------------------------------
//  Aura — domain particle systems. Returns { points, update(t) }.
//  type: 'spark' | 'water' | 'ember' | 'sun' | 'void' | 'leaf' | 'dust'
// ----------------------------------------------------------------------------
export function buildAura(type, color, count = 90) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, r = 0.6 + Math.random() * 0.9;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 2.6;
    pos[i * 3 + 2] = Math.sin(a) * r;
    seed[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size: type === 'void' ? 0.12 : 0.07, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  const base = pos.slice();
  function update(t) {
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const s = seed[i], k = i * 3;
      if (type === 'ember' || type === 'spark' || type === 'sun') {
        p[k + 1] = (base[k + 1] + t * (0.4 + s) ) % 2.8;
        p[k] = base[k] + Math.sin(t * 2 + s * 10) * 0.05;
      } else if (type === 'water') {
        p[k + 1] = base[k + 1] + Math.sin(t * 1.5 + s * 8) * 0.18;
      } else if (type === 'void') {
        const a = t * (0.3 + s * 0.4) + s * 6.28, r = 0.7 + Math.sin(t + s * 6) * 0.5;
        p[k] = Math.cos(a) * r; p[k + 2] = Math.sin(a) * r;
        p[k + 1] = 1.2 + Math.sin(t * 0.8 + s * 6) * 1.1;
      } else if (type === 'leaf') {
        p[k + 1] = (base[k + 1] - t * (0.2 + s * 0.3) + 2.8) % 2.8;
        p[k] = base[k] + Math.sin(t + s * 10) * 0.12;
      } else { // dust
        p[k + 1] = base[k + 1] + Math.sin(t * 0.8 + s * 6) * 0.1;
      }
    }
    geo.attributes.position.needsUpdate = true;
  }
  return { points, update };
}

export { applyPose };
