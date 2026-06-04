// ============================================================================
//  gods.js — The 17 deities: 12 Olympians + 5 primordials/Titans.
//  Each entry is metadata + a build(THREE-built parts) recipe.
//  createDeity(id) -> THREE.Group  (feet at y=0, faces +Z).
//  The group carries .userData.update(t) for idle animation.
// ============================================================================
import * as THREE from 'three';
import * as P from './parts.js';

// ----------------------------------------------------------------------------
//  Metadata registry — colors, lore, symbols. Drives UI + materials.
// ----------------------------------------------------------------------------
export const GODS = [
  // --- Primordials (the beginning) -----------------------------------------
  { id: 'chaos', name: 'Chaos', greek: 'Χάος', gen: 'Primordial', domain: 'The Void · Origin of all',
    color: 0x8a4bff, symbols: ['Void', 'Abyss', 'Beginning'],
    blurb: 'The yawning emptiness that existed before everything. From Chaos came the first beings.' },
  { id: 'gaia', name: 'Gaia', greek: 'Γαῖα', gen: 'Primordial', domain: 'The Earth',
    color: 0x4caf50, symbols: ['Earth', 'Mountains', 'Life'],
    blurb: 'The primordial Earth, mother of the sky, sea and the Titans. The ground beneath all things.' },
  { id: 'uranus', name: 'Uranus', greek: 'Οὐρανός', gen: 'Primordial', domain: 'The Sky · Heavens',
    color: 0x3d6dff, symbols: ['Sky', 'Stars', 'Cosmos'],
    blurb: 'The personified sky and first ruler of the cosmos, partner of Gaia, father of the Titans.' },

  // --- Titans (the old order) ----------------------------------------------
  { id: 'cronus', name: 'Cronus', greek: 'Κρόνος', gen: 'Titan', domain: 'Time · The Harvest',
    color: 0xc9a227, symbols: ['Scythe', 'Time', 'Harvest'],
    blurb: 'Leader of the Titans who overthrew Uranus and ruled the Golden Age — until his son Zeus dethroned him.' },
  { id: 'rhea', name: 'Rhea', greek: 'Ῥέα', gen: 'Titaness', domain: 'Motherhood · Flow',
    color: 0x2bb3a3, symbols: ['Lions', 'Motherhood', 'Flow'],
    blurb: 'The Titaness mother of the Olympians who hid the infant Zeus to save him from Cronus.' },

  // --- The Twelve Olympians -------------------------------------------------
  { id: 'zeus', name: 'Zeus', greek: 'Ζεύς', gen: 'Olympian', domain: 'King of Gods · Sky & Thunder',
    color: 0x6fb7ff, symbols: ['Thunderbolt', 'Eagle', 'Oak'],
    blurb: 'King of the gods, ruler of Mount Olympus, wielder of the thunderbolt and god of the sky.' },
  { id: 'hera', name: 'Hera', greek: 'Ἥρα', gen: 'Olympian', domain: 'Queen of Gods · Marriage',
    color: 0xd96fb0, symbols: ['Peacock', 'Crown', 'Pomegranate'],
    blurb: 'Queen of the gods and goddess of marriage, women and family. Wife and sister of Zeus.' },
  { id: 'poseidon', name: 'Poseidon', greek: 'Ποσειδῶν', gen: 'Olympian', domain: 'The Sea · Earthquakes',
    color: 0x2bb3c0, symbols: ['Trident', 'Horse', 'Waves'],
    blurb: 'God of the sea, storms and earthquakes. He strikes the ground with his trident to shake the earth.' },
  { id: 'demeter', name: 'Demeter', greek: 'Δημήτηρ', gen: 'Olympian', domain: 'Harvest · Agriculture',
    color: 0xd9a441, symbols: ['Wheat', 'Torch', 'Seasons'],
    blurb: 'Goddess of the harvest and agriculture who governs the fertility of the earth and the seasons.' },
  { id: 'athena', name: 'Athena', greek: 'Ἀθηνᾶ', gen: 'Olympian', domain: 'Wisdom · Strategic War',
    color: 0xb6c2cf, symbols: ['Owl', 'Aegis', 'Olive'],
    blurb: 'Goddess of wisdom, craft and strategic warfare. Born fully armoured from the head of Zeus.' },
  { id: 'apollo', name: 'Apollo', greek: 'Ἀπόλλων', gen: 'Olympian', domain: 'Sun · Music · Prophecy',
    color: 0xffc83d, symbols: ['Lyre', 'Sun', 'Bow'],
    blurb: 'God of the sun, light, music, poetry and prophecy. The radiant ideal of youth and the arts.' },
  { id: 'artemis', name: 'Artemis', greek: 'Ἄρτεμις', gen: 'Olympian', domain: 'Moon · The Hunt',
    color: 0xa9c9e8, symbols: ['Bow', 'Moon', 'Deer'],
    blurb: 'Goddess of the hunt, wilderness and the moon. Twin of Apollo, protector of young creatures.' },
  { id: 'ares', name: 'Ares', greek: 'Ἄρης', gen: 'Olympian', domain: 'War · Bloodlust',
    color: 0xe14b4b, symbols: ['Spear', 'Helmet', 'Vulture'],
    blurb: 'God of war, courage and raw violence — the brutal, untamed spirit of battle.' },
  { id: 'aphrodite', name: 'Aphrodite', greek: 'Ἀφροδίτη', gen: 'Olympian', domain: 'Love · Beauty',
    color: 0xff7eb6, symbols: ['Dove', 'Mirror', 'Rose'],
    blurb: 'Goddess of love, beauty and desire, born from the sea foam off the coast of Cythera.' },
  { id: 'hephaestus', name: 'Hephaestus', greek: 'Ἥφαιστος', gen: 'Olympian', domain: 'Fire · The Forge',
    color: 0xff7a1a, symbols: ['Hammer', 'Anvil', 'Flame'],
    blurb: 'God of fire, blacksmiths and craftsmen. He forges the weapons and wonders of the gods.' },
  { id: 'hermes', name: 'Hermes', greek: 'Ἑρμῆς', gen: 'Olympian', domain: 'Travel · Messenger',
    color: 0x4fd6c2, symbols: ['Caduceus', 'Winged sandals', 'Tortoise'],
    blurb: 'The swift messenger of the gods, guide of travelers, traders and souls to the underworld.' },
  { id: 'dionysus', name: 'Dionysus', greek: 'Διόνυσος', gen: 'Olympian', domain: 'Wine · Ecstasy',
    color: 0x8e44ad, symbols: ['Grapes', 'Thyrsus', 'Vine'],
    blurb: 'God of wine, festivity, theatre and ecstatic liberation. The most exuberant of the Olympians.' },
  { id: 'hestia', name: 'Hestia', greek: 'Ἑστία', gen: 'Olympian', domain: 'The Hearth · Home',
    color: 0xc08552, symbols: ['Sacred flame', 'Hearth', 'Home'],
    blurb: 'Eldest sister of Zeus, gentle goddess of the hearth and home, keeper of the sacred flame.' },
  { id: 'hades', name: 'Hades', greek: 'ᾍδης', gen: 'Olympian', domain: 'The Underworld · The Dead',
    color: 0x5a5560, symbols: ['Bident', 'Cerberus', 'Cypress'],
    blurb: 'Brother of Zeus and ruler of the realm of the dead — a stern, impartial judge of the world beyond.' },
  { id: 'persephone', name: 'Persephone', greek: 'Περσεφόνη', gen: 'Olympian', domain: 'Underworld · Spring',
    color: 0x8f5f9c, symbols: ['Pomegranate', 'Grain', 'Torch'],
    blurb: 'Daughter of Demeter, Queen of the Underworld whose yearly return turns the seasons of the earth.' },
];

export const GODS_BY_ID = Object.fromEntries(GODS.map((g) => [g.id, g]));

// ----------------------------------------------------------------------------
//  Per-god build recipes. Each returns extra meshes to add and an updater.
//  `ctx` = { meta, skin, robe, accent } already prepared.
// ----------------------------------------------------------------------------
const RECIPES = {
  zeus(ctx) {
    const h = P.buildHumanoid({ pose: 'raised', robeColor: 0xeef0f4, accent: P.glow(ctx.c, 1.2) });
    h.head.add(P.headLaurel(0xc9a227));
    const beard = P.cone(0.16, 0.34, P.marble(0xdedcd2), 6); beard.position.set(0, -0.22, 0.12); beard.rotation.x = Math.PI - 0.32; h.head.add(beard);
    P.grip(h.handR, P.propBolt(0x9fe3ff), { y: -0.1, rz: 0.2, s: 0.9 });
    return withAura(h, 'spark', ctx.c, 60);
  },
  hera(ctx) {
    const h = P.buildHumanoid({ pose: 'staff', robeColor: 0xf0e6ef, accent: P.glow(ctx.c, 1.0) });
    h.head.add(P.headCrown(0xc9a227, 0xff4d6d));
    P.grip(h.handR, P.propStaff(0xc9a227, 'orb'), { y: -0.7 });
    // peacock-feather fan behind
    const fan = new THREE.Group();
    for (let i = -3; i <= 3; i++) {
      const f = P.cone(0.05, 0.5, P.glow(0x2b8fb3, 0.7), 5);
      f.position.set(i * 0.12, 1.7, -0.3); f.rotation.set(-0.4, 0, i * 0.18); fan.add(f);
      const eye = P.sph(0.05, P.glow(ctx.c, 1.2), 0); eye.position.set(i * 0.18, 1.95, -0.32); fan.add(eye);
    }
    h.group.add(fan);
    return finish(h);
  },
  poseidon(ctx) {
    const h = P.buildHumanoid({ pose: 'raised', robeColor: 0xdfeef0, accent: P.glow(ctx.c, 1.2) });
    h.head.add(P.headLaurel(0x2bb3c0));
    const beard = P.cone(0.16, 0.36, P.marble(0xd6e2e2), 6); beard.position.set(0, -0.22, 0.12); beard.rotation.x = Math.PI - 0.32; h.head.add(beard);
    P.grip(h.handR, P.propTrident(ctx.c), { y: 0.2, rz: 0.15 });
    return withAura(h, 'water', ctx.c, 70);
  },
  demeter(ctx) {
    const h = P.buildHumanoid({ pose: 'staff', robeColor: 0xeee6cf, accent: P.glow(ctx.c, 0.9) });
    h.head.add(P.headLaurel(0xd9a441));
    P.grip(h.handR, P.propWheat(0xd9a441), { y: -0.2 });
    return withAura(h, 'leaf', 0xc9d96a, 40);
  },
  athena(ctx) {
    const h = P.buildHumanoid({ pose: 'weapon', robeColor: 0xe6ebf0, accent: P.glow(ctx.c, 0.9), legs: false });
    h.head.add(P.headHelmet(0xb8c0cc, 0xc9a227));
    P.grip(h.handR, P.propSpear(0xd9dde2), { y: 0.4 });
    P.grip(h.handL, P.propShield(0xc9a227, 0xb8c0cc), { z: 0.1, ry: Math.PI / 2, s: 0.9 });
    // owl on shoulder
    const owl = P.sph(0.1, P.marble(0xcfc7b6), 1); owl.scale.set(1, 1.2, 1); owl.position.set(-0.4, 1.66, 0.05); h.group.add(owl);
    return finish(h);
  },
  apollo(ctx) {
    const h = P.buildHumanoid({ pose: 'lyre', robeColor: 0xfff2d6, accent: P.glow(ctx.c, 1.4) });
    h.head.add(P.headHalo(0xffd24d)); h.head.add(P.headLaurel(0xc9a227));
    P.grip(h.handL, P.propLyre(0xc9a227), { y: 0.0, z: 0.1, ry: 0.3 });
    return withAura(h, 'sun', ctx.c, 50);
  },
  artemis(ctx) {
    const h = P.buildHumanoid({ pose: 'weapon', robeColor: 0xe3eef8, accent: P.glow(ctx.c, 1.0) });
    // crescent moon crown
    const moon = P.torus(0.16, 0.025, P.glow(0xcfe3ff, 1.4), 18, 6, Math.PI * 1.2);
    moon.geometry = new THREE.TorusGeometry(0.16, 0.025, 6, 18, Math.PI * 1.2);
    moon.position.y = 0.2; moon.rotation.z = -0.4; h.head.add(moon);
    P.grip(h.handL, P.propBow(0xc9a227), { z: 0.1, ry: Math.PI / 2 });
    return withAura(h, 'dust', 0xcfe3ff, 30);
  },
  ares(ctx) {
    const h = P.buildHumanoid({ pose: 'weapon', robeColor: 0x8a3030, accent: P.glow(ctx.c, 1.0), legs: true });
    h.head.add(P.headHelmet(0x7a2a2a, ctx.c));
    P.grip(h.handR, P.propSword(0xd9dde2), { y: 0.1 });
    P.grip(h.handL, P.propShield(0x7a2a2a, 0xc9a227), { z: 0.1, ry: Math.PI / 2, s: 0.9 });
    return finish(h);
  },
  aphrodite(ctx) {
    const h = P.buildHumanoid({ pose: 'offering', robeColor: 0xffe1ef, accent: P.glow(ctx.c, 1.0) });
    h.head.add(P.headVeil(ctx.c));
    P.grip(h.handR, P.propMirror(ctx.c), { y: -0.2, z: 0.1 });
    // a dove
    const dove = P.sph(0.08, P.marble(0xffffff), 1); dove.scale.set(1.4, 0.9, 1); dove.position.set(0.45, 1.5, 0.2); h.group.add(dove);
    return withAura(h, 'dust', ctx.c, 36);
  },
  hephaestus(ctx) {
    const h = P.buildHumanoid({ pose: 'staff', robeColor: 0x6b4a3a, accent: P.glow(ctx.c, 1.4), legs: true });
    const cap = P.cyl(0.16, 0.2, 0.16, P.stone(0x7a5240), 8); cap.position.y = 0.12; h.head.add(cap);
    P.grip(h.handR, P.propHammer(0x6b6b6b), { y: -0.3 });
    // anvil at his side
    const anvil = new THREE.Group();
    const a1 = P.box(0.5, 0.16, 0.26, P.metal(0x4a4a4a, 0.5)); a1.position.y = 0.7;
    const a2 = P.box(0.2, 0.5, 0.2, P.stone(0x555)); a2.position.y = 0.35; anvil.add(a1, a2);
    anvil.position.set(0.85, 0, 0.2); anvil.scale.setScalar(0.8); h.group.add(anvil);
    return withAura(h, 'ember', ctx.c, 70);
  },
  hermes(ctx) {
    const h = P.buildHumanoid({ pose: 'staff', robeColor: 0xdef5f0, accent: P.glow(ctx.c, 1.2), legs: true });
    // winged cap
    const cap = P.sph(0.2, P.marble(0xeae7dd), 1); cap.scale.set(1, 0.7, 1); cap.position.y = 0.1; h.head.add(cap);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const f = P.box(0.02, 0.04, 0.12 - i * 0.03, P.glow(0xffffff, 0.7));
        f.position.set(s * 0.18, 0.12 + i * 0.03, 0); f.rotation.y = s * 0.5; h.head.add(f);
      }
    }
    // winged sandals
    for (const s of [-1, 1]) {
      const w = P.box(0.02, 0.08, 0.18, P.glow(0xffffff, 0.7)); w.position.set(s * 0.17, 0.16, -0.05); w.rotation.y = s * 0.5; h.group.add(w);
    }
    P.grip(h.handR, P.propCaduceus(0xc9a227), { y: -0.5 });
    return finish(h);
  },
  dionysus(ctx) {
    const h = P.buildHumanoid({ pose: 'staff', robeColor: 0x6c3a8c, accent: P.glow(ctx.c, 1.0) });
    // grape-vine wreath
    const wreath = P.torus(0.2, 0.03, P.glow(0x4caf50, 0.7), 16, 6); wreath.rotation.x = Math.PI / 2; wreath.position.y = 0.08; h.head.add(wreath);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const grape = P.sph(0.035, P.glow(ctx.c, 1.2), 0); grape.position.set(Math.cos(a) * 0.2, 0.06, Math.sin(a) * 0.2); h.head.add(grape); }
    P.grip(h.handR, P.propThyrsus(ctx.c), { y: -0.7 });
    // grape cluster in left hand
    const cluster = new THREE.Group();
    for (let i = 0; i < 7; i++) { const gr = P.sph(0.04, P.glow(ctx.c, 1.0), 0); gr.position.set((i % 3 - 1) * 0.06, -Math.floor(i / 3) * 0.07, 0); cluster.add(gr); }
    P.grip(h.handL, cluster, { y: -0.05 });
    return finish(h);
  },
  hestia(ctx) {
    const h = P.buildHumanoid({ pose: 'offering', robeColor: 0xf0e0cf, accent: P.glow(ctx.c, 1.0) });
    h.head.add(P.headVeil(ctx.c));
    // a hearth bowl cradling the sacred flame, held forward in both hands
    const hearth = new THREE.Group();
    const cup = P.cyl(0.18, 0.1, 0.12, P.metal(0xc9a227, 0.4), 12); cup.position.y = 0.06;
    const flame = P.cone(0.11, 0.3, P.glow(0xff7a1a, 1.8), 6); flame.position.y = 0.26;
    const inner = P.cone(0.06, 0.2, P.glow(0xffd24d, 2.2), 5); inner.position.y = 0.3;
    hearth.add(cup, flame, inner);
    P.grip(h.handR, hearth, { y: -0.05, x: -0.12 });
    return withAura(h, 'ember', 0xff9a3a, 48);
  },

  // --- Titans ---------------------------------------------------------------
  cronus(ctx) {
    const h = P.buildHumanoid({ pose: 'staff', robeColor: 0x4a4036, accent: P.glow(ctx.c, 1.0) });
    const beard = P.cone(0.18, 0.55, P.marble(0xbdb8ac), 6); beard.position.set(0, -0.32, 0.12); beard.rotation.x = Math.PI - 0.28; h.head.add(beard);
    const crown = P.cyl(0.2, 0.2, 0.12, P.metal(ctx.c, 0.4), 9); crown.position.y = 0.16; h.head.add(crown);
    P.grip(h.handR, P.propScythe(0x9aa0a6), { y: 0.1, rz: 0.1 });
    return withAura(h, 'dust', ctx.c, 30);
  },
  rhea(ctx) {
    const h = P.buildHumanoid({ pose: 'offering', robeColor: 0xdcefe9, accent: P.glow(ctx.c, 0.9) });
    h.head.add(P.headVeil(ctx.c));
    // two lions flanking (her sacred animals) — simple crouched forms
    for (const s of [-1, 1]) {
      const lion = new THREE.Group();
      const body = P.box(0.34, 0.2, 0.16, P.marble(0xcaa86a)); body.position.y = 0.18;
      const headL = P.sph(0.12, P.marble(0xcaa86a), 1); headL.position.set(s * 0.2, 0.24, 0);
      lion.add(body, headL); lion.position.set(s * 0.85, 0, 0.2); lion.scale.setScalar(0.7); h.group.add(lion);
    }
    // swaddled infant Zeus in arms
    const baby = P.lathe([[0, 0.12], [0.07, 0.08], [0.08, -0.08], [0, -0.12]], P.glow(0x6fb7ff, 0.6), 8);
    P.grip(h.handR, baby, { y: -0.05, x: -0.1 });
    return finish(h);
  },

  // --- Primordials ----------------------------------------------------------
  gaia(ctx) {
    const h = P.buildHumanoid({ pose: 'offering', robeColor: 0x5a7a4a, accent: P.glow(ctx.c, 0.9) });
    // crown of leaves + small mountains rising from shoulders
    const wreath = P.torus(0.21, 0.035, P.glow(ctx.c, 0.8), 16, 6); wreath.rotation.x = Math.PI / 2; wreath.position.y = 0.07; h.head.add(wreath);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const lf = P.cone(0.03, 0.1, P.glow(ctx.c, 0.9), 4); lf.position.set(Math.cos(a) * 0.21, 0.1, Math.sin(a) * 0.21); lf.rotation.set(Math.PI / 2, a, 0); h.head.add(lf); }
    // a small globe/orb of earth offered in hands
    const orb = P.sph(0.16, P.marble(0x6b8c4a), 1); P.grip(h.handR, orb, { y: -0.05, x: -0.1 });
    const veins = P.torus(0.16, 0.012, P.glow(ctx.c, 1.0), 18, 6); P.grip(h.handR, veins, { y: -0.05, x: -0.1, rx: 0.6 });
    return withAura(h, 'leaf', ctx.c, 50);
  },
  uranus(ctx) {
    const h = P.buildHumanoid({ pose: 'raised', robeColor: 0x2a3d6e, accent: P.glow(ctx.c, 1.2) });
    // a starry sky-dome held overhead
    const dome = P.sph(0.34, new THREE.MeshStandardMaterial({ color: 0x1b2a52, emissive: ctx.c, emissiveIntensity: 0.4, roughness: 0.6, flatShading: true, transparent: true, opacity: 0.85 }), 1);
    P.grip(h.handR, dome, { y: -0.1 });
    // stars on the dome
    for (let i = 0; i < 16; i++) { const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI; const st = P.sph(0.02, P.glow(0xffffff, 1.8), 0); st.position.set(Math.sin(b) * Math.cos(a) * 0.34, Math.cos(b) * 0.34, Math.sin(b) * Math.sin(a) * 0.34); P.grip(h.handR, st, { x: st.position.x, y: -0.1 + st.position.y, z: st.position.z, s: 1 }); }
    const crown = P.torus(0.2, 0.02, P.glow(ctx.c, 1.4), 18, 6); crown.rotation.x = Math.PI / 2; crown.position.y = 0.1; h.head.add(crown);
    return withAura(h, 'dust', 0xbcd0ff, 40);
  },
  hades(ctx) {
    const h = P.buildHumanoid({ pose: 'staff', robeColor: 0x3a3640, accent: P.glow(ctx.c, 1.0) });
    const beard = P.cone(0.16, 0.34, P.marble(0x6a6570), 6); beard.position.set(0, -0.22, 0.12); beard.rotation.x = Math.PI - 0.32; h.head.add(beard);
    h.head.add(P.headCrown(0x6a6570, 0x8a4bff));
    // bident — Hades' two-pronged staff
    const bident = new THREE.Group();
    const shaft = P.cyl(0.028, 0.032, 1.6, P.metal(0x4a4550, 0.4), 6); bident.add(shaft);
    for (const x of [-0.1, 0.1]) { const p = P.cone(0.045, 0.32, P.metal(0x8a8494, 0.3), 5); p.position.set(x, 0.92, 0); bident.add(p); }
    P.grip(h.handR, bident, { y: -0.6 });
    // Cerberus — a small three-headed hound at his side
    const dog = new THREE.Group();
    const body = P.box(0.36, 0.22, 0.18, P.marble(0x423e4a)); body.position.y = 0.2;
    for (const dx of [-0.12, 0, 0.12]) {
      const hd = P.sph(0.1, P.marble(0x423e4a), 1); hd.position.set(dx, 0.34, 0.14); dog.add(hd);
      const eye = P.sph(0.022, P.glow(0xe14b4b, 1.8), 0); eye.position.set(dx, 0.36, 0.22); dog.add(eye);
    }
    dog.add(body); dog.position.set(0.88, 0, 0.25); dog.scale.setScalar(0.7); h.group.add(dog);
    return withAura(h, 'dust', 0x8a7fa0, 46);
  },
  persephone(ctx) {
    const h = P.buildHumanoid({ pose: 'offering', robeColor: 0xe7d6ec, accent: P.glow(ctx.c, 1.0) });
    // a wreath of spring flowers
    const wreath = P.torus(0.2, 0.028, P.glow(0x4caf50, 0.8), 16, 6); wreath.rotation.x = Math.PI / 2; wreath.position.y = 0.08; h.head.add(wreath);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const fl = P.sph(0.035, P.glow(i % 2 ? 0xff7eb6 : 0xffd24d, 1.2), 0); fl.position.set(Math.cos(a) * 0.2, 0.1, Math.sin(a) * 0.2); h.head.add(fl); }
    // a pomegranate cradled in the right hand
    const pom = P.sph(0.1, P.glow(0xe14b4b, 0.9), 1); P.grip(h.handR, pom, { y: -0.05, x: -0.05 });
    const calyx = P.cone(0.03, 0.07, P.glow(0x4caf50, 0.9), 4); P.grip(h.handR, calyx, { y: 0.06, x: -0.05 });
    // wheat in the left
    P.grip(h.handL, P.propWheat(0xd9a441), { y: -0.1, s: 0.7 });
    return withAura(h, 'leaf', 0xcf9ad9, 44);
  },
  chaos(ctx) {
    // Chaos is NOT humanoid — a swirling void form.
    const g = new THREE.Group();
    const core = P.sph(0.6, new THREE.MeshStandardMaterial({ color: 0x140a26, emissive: ctx.c, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.2, flatShading: true }), 2);
    core.position.y = 1.3; g.add(core);
    // orbiting shards
    const shards = new THREE.Group(); shards.position.y = 1.3;
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2, r = 0.8 + Math.random() * 0.7, y = (Math.random() - 0.5) * 1.6;
      const shard = P.box(0.06 + Math.random() * 0.12, 0.06, 0.06, P.glow(ctx.c, 1.2 + Math.random()));
      shard.position.set(Math.cos(a) * r, y, Math.sin(a) * r); shard.rotation.set(a, a, 0); shards.add(shard);
    }
    g.add(shards);
    const aura = P.buildAura('void', ctx.c, 120); aura.points.position.y = 0; g.add(aura.points);
    g.userData.update = (t) => { core.rotation.y = t * 0.3; core.rotation.x = t * 0.15; shards.rotation.y = -t * 0.4; aura.update(t); core.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06); };
    return g;
  },
};

// helper: finish a humanoid build with idle bob only
function finish(h) {
  const g = h.group;
  g.userData.update = (t) => { g.position.y = Math.sin(t * 1.1) * 0.03; };
  return g;
}
// helper: finish + attach a particle aura
function withAura(h, type, color, count) {
  const g = h.group;
  const aura = P.buildAura(type, color, count); g.add(aura.points);
  g.userData.update = (t) => { g.position.y = Math.sin(t * 1.1) * 0.03; aura.update(t); };
  return g;
}

// ----------------------------------------------------------------------------
//  Public factory
// ----------------------------------------------------------------------------
export function createDeity(id) {
  const meta = GODS_BY_ID[id];
  if (!meta) throw new Error('Unknown deity: ' + id);
  const ctx = { meta, c: meta.color };
  const group = RECIPES[id](ctx);
  group.userData.meta = meta;
  if (!group.userData.update) group.userData.update = () => {};
  return group;
}

// Convenience: build everything as a dictionary.
export function createAllDeities() {
  return GODS.map((g) => ({ meta: g, model: createDeity(g.id) }));
}
