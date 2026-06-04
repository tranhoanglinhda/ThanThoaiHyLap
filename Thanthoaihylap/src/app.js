// ============================================================================
//  app.js — Gallery scene for the 17 deities.
//  Ring of pedestals + orbit controls + click-to-focus detail view.
// ============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GODS, createDeity } from './gods.js';
import { buildPedestal } from './parts.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0e16);
scene.fog = new THREE.FogExp2(0x0c0e16, 0.022);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 6, 22);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI * 0.52;
controls.target.set(0, 2, 0);

// ----------------------------------------------------------------------------
//  Lighting
// ----------------------------------------------------------------------------
scene.add(new THREE.HemisphereLight(0xbfd0ff, 0x1a1408, 0.55));
const key = new THREE.DirectionalLight(0xfff0d8, 1.1);
key.position.set(8, 16, 10); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -22; key.shadow.camera.right = 22;
key.shadow.camera.top = 22; key.shadow.camera.bottom = -22;
key.shadow.camera.far = 60; key.shadow.bias = -0.0005;
scene.add(key);
const rim = new THREE.DirectionalLight(0x6a8cff, 0.5); rim.position.set(-12, 8, -10); scene.add(rim);

// ----------------------------------------------------------------------------
//  Floor — dark marble disc with a subtle grid
// ----------------------------------------------------------------------------
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(30, 64),
  new THREE.MeshStandardMaterial({ color: 0x141826, roughness: 0.9, metalness: 0.1 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.PolarGridHelper(28, 16, 8, 64, 0x2a3350, 0x1c2238);
grid.position.y = 0.01; scene.add(grid);

// ----------------------------------------------------------------------------
//  Build the ring of deities
// ----------------------------------------------------------------------------
const RADIUS = 11;
const slots = []; // { meta, model, pedestal, group, angle, focusPos }
GODS.forEach((meta, i) => {
  const angle = (i / GODS.length) * Math.PI * 2;
  const x = Math.cos(angle) * RADIUS, z = Math.sin(angle) * RADIUS;

  const slot = new THREE.Group();
  slot.position.set(x, 0, z);
  // face outward (front toward the orbiting viewer / focus camera)
  slot.rotation.y = -angle + Math.PI / 2;

  const ped = buildPedestal(meta.name, meta.greek, meta.color);
  slot.add(ped);

  const model = createDeity(meta.id);
  model.position.y = 0.62; // stand on pedestal top
  model.scale.setScalar(1.0);
  model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  slot.add(model);

  scene.add(slot);
  slots.push({ meta, model, pedestal: ped, group: slot, angle });
});

// ----------------------------------------------------------------------------
//  Raycasting for click-to-focus
// ----------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null, focused = null;

function pickSlot(ev) {
  pointer.x = (ev.clientX / innerWidth) * 2 - 1;
  pointer.y = -(ev.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(slots.map((s) => s.group), true);
  if (!hits.length) return null;
  let o = hits[0].object;
  while (o.parent && !slots.find((s) => s.group === o)) o = o.parent;
  return slots.find((s) => s.group === o) || null;
}

renderer.domElement.addEventListener('pointermove', (ev) => {
  if (focused) return;
  const s = pickSlot(ev);
  if (s !== hovered) {
    hovered = s;
    renderer.domElement.style.cursor = s ? 'pointer' : 'grab';
  }
});

renderer.domElement.addEventListener('click', (ev) => {
  const s = pickSlot(ev);
  if (s) focusOn(s);
});

// ----------------------------------------------------------------------------
//  Camera transitions (gallery <-> focus)
// ----------------------------------------------------------------------------
function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
let flying = false;
function flyTo(targetPos, lookAt, dur = 1000) {
  const fromP = camera.position.clone();
  const fromT = controls.target.clone();
  const toP = targetPos.clone(), toT = lookAt.clone();
  const t0 = performance.now();
  flying = true;
  function tick() {
    const k = Math.min(1, (performance.now() - t0) / dur);
    const e = ease(k);
    camera.position.lerpVectors(fromP, toP, e);
    controls.target.lerpVectors(fromT, toT, e);
    controls.update();
    if (k < 1) requestAnimationFrame(tick); else flying = false;
  }
  tick();
}

function focusOn(slot) {
  focused = slot;
  controls.enabled = false;
  const p = slot.group.position;
  const dir = p.clone().normalize();
  const camPos = p.clone().add(dir.clone().multiplyScalar(5.5)).setY(3.4);
  flyTo(camPos, p.clone().setY(2.2));
  showPanel(slot.meta);
  document.body.classList.add('focused');
}

function exitFocus() {
  focused = null;
  controls.enabled = true;
  flyTo(new THREE.Vector3(0, 6, 22), new THREE.Vector3(0, 2, 0));
  hidePanel();
  document.body.classList.remove('focused');
}

// ----------------------------------------------------------------------------
//  Info panel UI
// ----------------------------------------------------------------------------
const panel = document.getElementById('panel');
function showPanel(meta) {
  const hex = '#' + meta.color.toString(16).padStart(6, '0');
  panel.innerHTML = `
    <div class="gen" style="color:${hex}">${meta.gen}</div>
    <div class="greek">${meta.greek}</div>
    <h1>${meta.name}</h1>
    <div class="domain">${meta.domain}</div>
    <p>${meta.blurb}</p>
    <div class="symbols">${meta.symbols.map((s) => `<span style="border-color:${hex}55;color:${hex}">${s}</span>`).join('')}</div>
    <div class="nav">
      <button id="prev">‹ Prev</button>
      <button id="next">Next ›</button>
      <button id="back">Back to gallery</button>
    </div>`;
  panel.style.setProperty('--accent', hex);
  panel.classList.add('show');
  document.getElementById('back').onclick = exitFocus;
  document.getElementById('prev').onclick = () => step(-1);
  document.getElementById('next').onclick = () => step(1);
}
function hidePanel() { panel.classList.remove('show'); }
function step(d) {
  const i = slots.indexOf(focused);
  const n = slots[(i + d + slots.length) % slots.length];
  focusOn(n);
}

// keyboard
addEventListener('keydown', (e) => {
  if (!focused) return;
  if (e.key === 'Escape') exitFocus();
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});

// ----------------------------------------------------------------------------
//  Top legend chips — jump to any god
// ----------------------------------------------------------------------------
const legend = document.getElementById('legend');
GODS.forEach((meta, i) => {
  const hex = '#' + meta.color.toString(16).padStart(6, '0');
  const chip = document.createElement('button');
  chip.className = 'chip'; chip.textContent = meta.name;
  chip.style.setProperty('--c', hex);
  chip.onclick = () => focusOn(slots[i]);
  legend.appendChild(chip);
});

// ----------------------------------------------------------------------------
//  Render loop
// ----------------------------------------------------------------------------
const clock = new THREE.Clock();
let last = 0;
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const dt = Math.min(0.05, t - last); last = t;
  for (const s of slots) {
    s.model.userData.update?.(t + s.angle);
    // gentle turntable + face the camera plate
    s.model.rotation.y = Math.sin(t * 0.2 + s.angle) * 0.18;
    if (s.pedestal.userData.plate) s.pedestal.userData.plate.lookAt(camera.position);
  }
  if (!flying) controls.update();
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// expose for debugging
// expose for debugging / external control
window.__gods = { scene, slots, focusOn, exitFocus, GODS, camera, controls, renderer };
