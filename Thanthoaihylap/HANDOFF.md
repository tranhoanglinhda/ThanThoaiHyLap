# Pantheon — 17 Greek Deities as procedural Three.js 3D models

A drop-in Three.js library that builds **17 low-poly marble statues** (12 Olympians
+ 2 Titans + 3 Primordials) entirely from primitives — **no external `.glb`/`.fbx`
assets, no textures to download**. Each deity is a `THREE.Group` you can place,
scale, light and animate however you like.

This package is meant to be handed to **Claude Code** (or any dev) to wire into a
web app. Everything below is what you need to integrate it.

---

## 1. Files

```
index.html        ← reference app: gallery ring + click-to-focus + info panel
src/parts.js      ← LIBRARY: materials, low-poly humanoid, props, headpieces, pedestal, particle auras
src/gods.js       ← LIBRARY: the 17 deity recipes + metadata + createDeity()
src/app.js        ← reference scene wiring (orbit controls, raycast focus, UI). Replace with your own.
HANDOFF.md        ← this file
```

**The reusable library is just `src/parts.js` + `src/gods.js`.** `app.js`/`index.html`
are a working example you can lift from or throw away.

---

## 2. Requirements

- **Three.js r0.160+** (ES modules). The reference app loads it from a CDN import map:
  ```html
  <script type="importmap">
  { "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }}
  </script>
  ```
  In a bundler (Vite/Next/etc.) just `npm i three` — the `import * as THREE from 'three'`
  statements at the top of `parts.js` / `gods.js` resolve normally.
- No build step is strictly required; the files are plain ES modules.

---

## 3. Public API

```js
import { createDeity, createAllDeities, GODS, GODS_BY_ID } from './src/gods.js';

// One deity → a THREE.Group, feet at y = 0, facing +Z, ~2.2 units tall.
const zeus = createDeity('zeus');
scene.add(zeus);

// Idle animation: call its updater every frame with elapsed seconds.
function tick(t) { zeus.userData.update(t); renderer.render(scene, camera); }

// All 17 at once: [{ meta, model }, ...]
const all = createAllDeities();

// Metadata for UI (name, greek, domain, color, symbols, blurb, generation)
GODS;            // ordered array (primordials → titans → olympians)
GODS_BY_ID.zeus; // single record
```

### Deity ids (use these exact strings)
`chaos`, `gaia`, `uranus`, `cronus`, `rhea`, `zeus`, `hera`, `poseidon`,
`demeter`, `athena`, `apollo`, `artemis`, `ares`, `aphrodite`, `hephaestus`,
`hermes`, `dionysus`

### `userData` on each model
| key | type | meaning |
|---|---|---|
| `meta` | object | the `GODS` record (name, color, blurb, …) |
| `update(t)` | fn | advance idle animation; `t` = elapsed seconds (Number) |

### Metadata record shape
```js
{
  id: 'poseidon',
  name: 'Poseidon',
  greek: 'Ποσειδῶν',
  gen: 'Olympian',                       // 'Primordial' | 'Titan' | 'Titaness' | 'Olympian'
  domain: 'The Sea · Earthquakes',
  color: 0x2bb3c0,                        // domain accent (hex int) — drives the glow + UI
  symbols: ['Trident', 'Horse', 'Waves'],
  blurb: '…one-sentence description…'
}
```

---

## 4. How each deity is built (recognisable silhouettes)

All 16 humanoids share one posable low-poly body (`buildHumanoid` in `parts.js`) and
are individuated by **pose + headpiece + prop + accent color + particle aura**.
Chaos is the one non-humanoid (a swirling void orb).

| Deity | Accent | Pose | Headpiece | Prop / motif | Aura |
|---|---|---|---|---|---|
| **Chaos** | violet | — | — | void orb + orbiting shards | swirling void |
| **Gaia** | green | offering | leaf crown | green earth-orb w/ veins | falling leaves |
| **Uranus** | blue | raised | star circlet | glowing star-dome held overhead | sky dust |
| **Cronus** | gold | staff | crown + long beard | scythe | time dust |
| **Rhea** | teal | offering | veil | swaddled infant Zeus + 2 lions | — |
| **Zeus** | sky-blue | raised | laurel + beard | lightning bolt | sparks |
| **Hera** | magenta | staff | jewelled crown | orb-staff + peacock fan | — |
| **Poseidon** | cyan | raised | laurel + beard | trident | water |
| **Demeter** | amber | staff | laurel | wheat sheaf | leaves |
| **Athena** | steel | weapon | crested helmet | spear + round shield + owl | — |
| **Apollo** | gold | lyre | radiant halo + laurel | lyre | sun motes |
| **Artemis** | pale blue | weapon | crescent moon | bow | dust |
| **Ares** | red | weapon | war helmet (legs) | sword + shield | — |
| **Aphrodite** | pink | offering | veil | mirror + dove | love motes |
| **Hephaestus** | ember | staff | workman's cap (legs) | hammer + anvil | embers |
| **Hermes** | aqua | staff | winged cap + sandals | caduceus | — |
| **Dionysus** | purple | staff | grape-vine wreath | thyrsus + grape cluster | — |

**Reusable builders exported from `parts.js`** (mix and match for your own variants):
`marble, stone, metal, glow`, `buildHumanoid`, headpieces (`headLaurel, headCrown,
headHelmet, headHorns, headVeil, headHalo`), props (`propTrident, propBolt, propStaff,
propSpear, propShield, propSword, propBow, propCaduceus, propHammer, propWheat,
propThyrsus, propMirror, propScythe, propLyre`), `grip(hand, prop, transform)`,
`buildPedestal(name, greek, accentHex)`, `buildAura(type, color, count)`.

`buildHumanoid({ pose, robeColor, accent, legs })` returns
`{ group, handR, handL, head, shoulderY }` — `handR/handL` are empty `Object3D`s at the
palms; attach a prop with `grip(handR, propTrident(0x2bb3c0), { y: 0.2 })`.
Poses: `'staff' | 'raised' | 'offering' | 'weapon' | 'lyre' | 'rest'`.

---

## 5. Minimal integration example

```js
import * as THREE from 'three';
import { createDeity } from './src/gods.js';

const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xbfd0ff, 0x1a1408, 0.6));
const key = new THREE.DirectionalLight(0xfff0d8, 1.1); key.position.set(8,16,10);
scene.add(key);

const god = createDeity('zeus');
god.traverse(o => { if (o.isMesh) o.castShadow = true; });
scene.add(god);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  god.userData.update(clock.getElapsedTime());   // idle bob + particles
  renderer.render(scene, camera);
});
```

---

## 6. Suggested web UX (what the reference `app.js` does)

- **Gallery**: 17 pedestals on a ring (radius ~11), all facing outward, `OrbitControls`
  outside looking in. Models slowly turntable; nameplates billboard to the camera.
- **Focus**: raycast on click → tween the camera to that statue (own `requestAnimationFrame`
  tween, ease-in-out) and slide in an info panel built from `meta` (name, Greek,
  domain, blurb, symbol chips). `←/→` step through, `Esc` returns to the gallery.
- **Legend**: chips along the bottom, one per deity, colored by `meta.color`, click to jump.

Feel free to redesign the scene/UI — only `parts.js` + `gods.js` are load-bearing.

---

## 7. Performance notes

- Materials are **cached/shared** across all statues (see the `cached()` map in
  `parts.js`), so 17 figures = a few dozen materials, not hundreds.
- Geometry is low-poly + `flatShading`. The whole pantheon is light enough for mobile.
- Particle auras are `THREE.Points`; counts are modest (30–120 each). Drop them by
  not calling `userData.update`, or thin the `count` arg in the recipes.
- For instancing/static scenes you can call `update` only on the focused model.

---

## 8. Tuning & extending

- **Change a domain color**: edit `color` in the `GODS` array (`gods.js`) — it feeds the
  glow material, particle tint, pedestal ring and UI accent automatically.
- **Repose / re-prop a god**: edit its recipe in `RECIPES` (`gods.js`). Each recipe is a
  few lines: build a humanoid, add a headpiece, `grip` a prop, pick an aura.
- **Add a new deity** (e.g. Hades, Hestia, Persephone): add a `GODS` record + a `RECIPES`
  entry. Reuse existing props or add one to `parts.js`.
- **Swap marble for gold/bronze**: change the default in `marble()` or pass a `robeColor`,
  and use `metal(0xc9a227)` for the body material.
