/* ============================================================
   StatueStage — one shared WebGL renderer, many statues.
   Renders each god's scene into its niche element via the
   scissor technique (scales past the ~16 WebGL-context limit).
   Each statue is a marble placeholder; drop a .glb on a niche
   to swap in a real model (the "slot" the gods await).
   Requires: THREE, THREE.OrbitControls, THREE.GLTFLoader (r128).
   ============================================================ */
(function () {
  const MARBLE = 0xece7db;

  class StatueStage {
    constructor(canvas) {
      this.canvas = canvas;
      this.renderer = new THREE.WebGLRenderer({
        canvas, antialias: true, alpha: true, powerPreference: "high-performance"
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = false;
      this.items = [];
      this.autoRotate = true;
      this.lightBoost = 1;
      this.loader = new THREE.GLTFLoader();
      this._loop = this._loop.bind(this);
      this._raf = requestAnimationFrame(this._loop);
      window.addEventListener("resize", () => this._resize());
    }

    /* --- add one statue bound to a niche element --- */
    add(element, god) {
      const scene = new THREE.Scene();
      const accent = new THREE.Color(god.accent || "#c79a4e");

      // lighting — soft museum spotlights
      const hemi = new THREE.HemisphereLight(0xfff6e6, 0x6b5b40, 0.95);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xfff4e2, 1.35);
      key.position.set(-3, 5, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xdfe6ff, 0.5);
      fill.position.set(4, 1.5, 2);
      scene.add(fill);
      const rim = new THREE.PointLight(accent.getHex(), 0.7, 18);
      rim.position.set(0, 2.2, -3.4);
      scene.add(rim);

      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 1.1, 7.4);

      const controls = new THREE.OrbitControls(camera, element);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.enableZoom = false;      // keep page scroll intact; zoom via buttons
      controls.minPolarAngle = 0.55;
      controls.maxPolarAngle = 1.95;
      controls.rotateSpeed = 0.85;
      controls.target.set(0, 0.55, 0);

      const root = new THREE.Group();
      scene.add(root);
      this._buildPlaceholder(root, accent);
      this._addContactShadow(scene);

      const item = {
        scene, camera, controls, element, root, accent,
        lights: { hemi, key, fill, rim }, isModel: false, visible: true
      };
      this._frame(item);
      this.items.push(item);
      return item;
    }

    /* --- procedural marble bust placeholder --- */
    _buildPlaceholder(root, accent) {
      const marble = new THREE.MeshStandardMaterial({
        color: MARBLE, roughness: 0.72, metalness: 0.04
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: accent, roughness: 0.35, metalness: 0.5,
        emissive: accent.clone().multiplyScalar(0.18)
      });

      // plinth (stepped base)
      const plinthBot = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.28, 0.34, 48), marble);
      plinthBot.position.y = -1.95;
      const plinthTop = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.02, 0.26, 48), marble);
      plinthTop.position.y = -1.66;
      // accent inlay ring on plinth
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.035, 16, 64), accentMat);
      ring.rotation.x = Math.PI / 2; ring.position.y = -1.53;

      // column / pedestal
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 1.5, 48), marble);
      column.position.y = -0.78;
      const abacus = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.78, 0.16, 48), marble);
      abacus.position.y = 0.04;

      // bust — lathe shoulders + neck + head
      const profile = [
        [0.001, 0.00], [0.60, 0.02], [0.66, 0.18], [0.60, 0.40],
        [0.46, 0.62], [0.30, 0.82], [0.205, 1.02], [0.19, 1.18]
      ].map(p => new THREE.Vector2(p[0], p[1]));
      const bust = new THREE.Mesh(new THREE.LatheGeometry(profile, 56), marble);
      bust.position.y = 0.16;

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.2, 0.22, 32), marble);
      neck.position.y = 1.4;

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 40, 32), marble);
      head.scale.set(0.92, 1.12, 0.96);
      head.position.y = 1.78;
      // a suggested brow/nose ridge so the bust reads as a face direction
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 12), marble);
      nose.rotation.x = Math.PI / 2.05;
      nose.position.set(0, 1.74, 0.30);

      [plinthBot, plinthTop, ring, column, abacus, bust, neck, head, nose].forEach(m => root.add(m));
      root.userData.placeholder = true;
    }

    _addContactShadow(scene) {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d");
      const grd = g.createRadialGradient(64, 64, 6, 64, 64, 64);
      grd.addColorStop(0, "rgba(40,30,15,0.42)");
      grd.addColorStop(1, "rgba(40,30,15,0)");
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(c);
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(4.2, 4.2),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -2.1;
      scene.add(shadow);
    }

    /* --- fit camera + controls to current root contents --- */
    _frame(item) {
      const box = new THREE.Box3().setFromObject(item.root);
      if (box.isEmpty()) return;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const center = sphere.center;
      item.controls.target.copy(center);
      const fov = item.camera.fov * Math.PI / 180;
      const dist = (sphere.radius / Math.sin(fov / 2)) * 1.08;
      const dir = new THREE.Vector3(0.15, 0.18, 1).normalize();
      item.camera.position.copy(center).add(dir.multiplyScalar(dist));
      item.camera.near = dist / 40;
      item.camera.far = dist * 40;
      item.camera.updateProjectionMatrix();
      item._homeDist = dist;
      item.controls.update();
    }

    /* --- swap placeholder for a real glTF model --- */
    loadModelFromURL(item, url, onDone) {
      this.loader.load(url, (gltf) => {
        this._replace(item, gltf.scene);
        if (onDone) onDone(null);
      }, undefined, (err) => { if (onDone) onDone(err); });
    }
    loadModelFromFile(item, file, onDone) {
      const url = URL.createObjectURL(file);
      this.loader.load(url, (gltf) => {
        this._replace(item, gltf.scene);
        URL.revokeObjectURL(url);
        if (onDone) onDone(null);
      }, undefined, (err) => { URL.revokeObjectURL(url); if (onDone) onDone(err); });
    }
    _replace(item, obj) {
      while (item.root.children.length) item.root.remove(item.root.children[0]);
      // normalise: drop to floor, recentre on x/z
      const box = new THREE.Box3().setFromObject(obj);
      const c = box.getCenter(new THREE.Vector3());
      obj.position.x -= c.x; obj.position.z -= c.z;
      obj.position.y -= box.min.y - (-2.1);
      item.root.add(obj);
      item.isModel = true;
      this._frame(item);
    }

    /* --- niche tool helpers --- */
    reset(item) { this._frame(item); }
    zoom(item, factor) {
      const t = item.controls.target;
      const v = item.camera.position.clone().sub(t);
      v.multiplyScalar(factor);
      item.camera.position.copy(t).add(v);
      item.controls.update();
    }

    /* --- tweak hooks --- */
    setAutoRotate(on) {
      this.autoRotate = on;
      this.items.forEach(i => {
        i.controls.autoRotate = on;
        i.controls.autoRotateSpeed = 1.1;
      });
    }
    setLightBoost(mult) {
      this.lightBoost = mult;
      this.items.forEach(i => {
        i.lights.hemi.intensity = 0.95 * mult;
        i.lights.key.intensity = 1.35 * mult;
        i.lights.fill.intensity = 0.5 * mult;
        i.lights.rim.intensity = 0.7 * mult;
      });
    }

    _resize() {
      this._needResize = true;
    }

    _loop() {
      this._raf = requestAnimationFrame(this._loop);
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      if (this.canvas.width !== Math.floor(w * this.renderer.getPixelRatio()) || this._needResize) {
        this.renderer.setSize(w, h, false);
        this._needResize = false;
      }
      const r = this.renderer;
      r.setScissorTest(true);
      const canvasRect = this.canvas.getBoundingClientRect();
      for (const item of this.items) {
        item.controls.update();
        const rect = item.element.getBoundingClientRect();
        // cull if fully off-screen
        if (rect.bottom < 0 || rect.top > window.innerHeight ||
            rect.right < 0 || rect.left > window.innerWidth) continue;
        const left = rect.left - canvasRect.left;
        const bottom = canvasRect.bottom - rect.bottom;
        r.setViewport(left, bottom, rect.width, rect.height);
        r.setScissor(left, bottom, rect.width, rect.height);
        item.camera.aspect = rect.width / rect.height;
        item.camera.updateProjectionMatrix();
        r.render(item.scene, item.camera);
      }
      r.setScissorTest(false);
    }
  }

  window.StatueStage = StatueStage;
})();
