import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const K = window.KLProducts;
const S = window.KLStore;
const canvas = document.querySelector('#shoeCanvas');

if (canvas && K && S) {
  const stage = document.querySelector('#shoeStage');
  const status = document.querySelector('#modelStatus');
  const instructions = document.querySelector('#modelInstructions');
  const missing = document.querySelector('#modelMissing');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#201d2b');
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 1.35, 4.3);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x423650, 2.1));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(2, 4, 3);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0xff5a36, 24, 12);
  fillLight.position.set(-2, 1, 2);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0x7357ff, 28, 12);
  rimLight.position.set(1, 2, -3);
  scene.add(rimLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.48, 0);
  controls.minDistance = 2.3;
  controls.maxDistance = 7;

  let shoeMaterials = [];
  let activeModel = null;
  let selected = K.byId(new URLSearchParams(location.search).get('product')) || K.all()[0];

  function resize() {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);
  resize();

  function recolor(hex) {
    shoeMaterials.forEach(material => {
      if (material.color) material.color.set(hex);
      material.needsUpdate = true;
    });
    document.querySelectorAll('[data-color]').forEach(button => {
      button.classList.toggle('active', button.dataset.color.toLowerCase() === hex.toLowerCase());
    });
  }

  function makeFallbackSneaker() {
    // A shoe-specific procedural fallback (upper, sole, tongue and laces), not decorative primitives.
    const group = new THREE.Group();
    const upperMaterial = new THREE.MeshStandardMaterial({ color: '#f7f3ea', roughness: 0.72, metalness: 0.02 });
    const soleMaterial = new THREE.MeshStandardMaterial({ color: '#f4f0e7', roughness: 0.88 });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: '#282432', roughness: 0.8 });
    const laceMaterial = new THREE.MeshStandardMaterial({ color: '#fffaf0', roughness: 0.7 });
    shoeMaterials = [upperMaterial];

    // Outsole footprint follows the shape of a sneaker viewed from above.
    const footprint = new THREE.Shape();
    footprint.moveTo(-1.05, -0.16);
    footprint.quadraticCurveTo(-1.12, -0.29, -0.91, -0.32);
    footprint.lineTo(0.38, -0.34);
    footprint.quadraticCurveTo(0.85, -0.31, 1.02, -0.17);
    footprint.quadraticCurveTo(1.13, -0.06, 1.04, 0.14);
    footprint.quadraticCurveTo(0.98, 0.28, 0.72, 0.29);
    footprint.lineTo(-0.83, 0.25);
    footprint.quadraticCurveTo(-1.12, 0.20, -1.05, -0.16);
    const soleGeometry = new THREE.ExtrudeGeometry(footprint, { depth: 0.13, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 10 });
    soleGeometry.rotateX(Math.PI / 2);
    const sole = new THREE.Mesh(soleGeometry, soleMaterial);
    sole.position.y = 0.22;
    sole.castShadow = true;
    sole.receiveShadow = true;
    group.add(sole);

    // Build the upper from cross-sections so the toe tapers and the heel rises naturally.
    const rings = 42;
    const around = 24;
    const vertices = [];
    const indices = [];
    for (let i = 0; i <= rings; i++) {
      const t = i / rings;
      const x = -0.98 + t * 1.92;
      const toeTaper = Math.max(0.15, Math.min(1, (1 - t) * 5.5 + 0.2));
      const heelTaper = Math.max(0.55, Math.min(1, t * 5 + 0.5));
      const width = (0.19 + 0.055 * Math.sin(Math.PI * t)) * Math.min(toeTaper, heelTaper);
      let height = 0.42 + 0.12 * Math.sin(Math.PI * t);
      if (t < 0.22) height += (0.22 - t) * 0.65;
      if (t > 0.7) height -= (t - 0.7) * 0.32;
      for (let j = 0; j <= around; j++) {
        const angle = (j / around) * Math.PI * 2;
        const y = 0.30 + (0.5 + 0.5 * Math.sin(angle)) * height;
        const z = Math.cos(angle) * width;
        vertices.push(x, y, z);
        if (i < rings && j < around) {
          const a = i * (around + 1) + j;
          const b = a + around + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
    const upperGeometry = new THREE.BufferGeometry();
    upperGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    upperGeometry.setIndex(indices);
    upperGeometry.computeVertexNormals();
    const upper = new THREE.Mesh(upperGeometry, upperMaterial);
    upper.castShadow = true;
    upper.receiveShadow = true;
    group.add(upper);

    // Tongue and dark heel counter give the silhouette recognizable sneaker details.
    const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.055, 0.18), upperMaterial);
    tongue.position.set(-0.04, 0.73, 0);
    tongue.rotation.z = -0.10;
    group.add(tongue);
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.29), trimMaterial);
    heel.position.set(-0.78, 0.47, 0);
    heel.rotation.z = -0.08;
    group.add(heel);

    // Crossed laces placed over the instep.
    for (let i = 0; i < 5; i++) {
      const x = -0.37 + i * 0.14;
      const zOffset = 0.09 - i * 0.003;
      const points = [new THREE.Vector3(x - 0.045, 0.735 - i * 0.009, -zOffset), new THREE.Vector3(x + 0.045, 0.742 - i * 0.009, zOffset)];
      const lace = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(points[0], points[1]), 8, 0.012, 6, false), laceMaterial);
      group.add(lace);
    }

    // Sole seam: a fine line following the side wall.
    const seamPoints = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      seamPoints.push(new THREE.Vector3(-0.92 + t * 1.82, 0.29, 0.255 * Math.sin(Math.PI * t)));
    }
    group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints), 48, 0.008, 5, false), trimMaterial));
    group.rotation.y = -0.25;
    return group;
  }

  function installModel(model, isFallback = false) {
    if (activeModel) scene.remove(activeModel);
    activeModel = model;
    if (isFallback) {
      shoeMaterials = [];
      model.traverse(object => {
        if (object.isMesh && object.material && object.material.color && object.material.color.getHexString() === 'f7f3ea') shoeMaterials.push(object.material);
      });
      status.textContent = '3D sneaker ready · fallback model';
      instructions.textContent = 'Drag to rotate · Scroll to zoom';
      if (missing) {
        missing.hidden = false;
        missing.innerHTML = 'Showing the built-in 3D sneaker so the studio works immediately. For a higher-detail imported shoe, add a licensed <strong>sneaker.glb</strong> file to <code>assets/models/</code>.';
      }
    } else {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 2.4 / Math.max(size.x, size.y, size.z, 0.001);
      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));
      model.position.y -= box.min.y * scale;
      model.rotation.y = -0.3;
      shoeMaterials = [];
      model.traverse(object => {
        if (object.isMesh && object.material) {
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => {
            shoeMaterials.push(material);
            if (material.color) material.color.set('#f7f3ea');
          });
        }
      });
      status.textContent = '3D model loaded · drag to rotate';
      instructions.textContent = 'Drag to rotate · Scroll to zoom';
      if (missing) missing.hidden = true;
    }
    scene.add(model);
    recolor(document.querySelector('[data-color].active')?.dataset.color || '#ff5a36');
  }

  const select = document.querySelector('#customProduct');
  select.innerHTML = K.all().map(product => `<option value="${K.escape(product.id)}" ${String(product.id) === String(selected.id) ? 'selected' : ''}>${K.escape(product.name)}</option>`).join('');
  function updateProduct() {
    selected = K.byId(select.value) || K.all()[0];
    document.querySelector('#customProductName').textContent = selected.name;
    document.querySelector('#customPrice').textContent = K.money(selected.price);
  }
  select.addEventListener('change', updateProduct);
  updateProduct();

  document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => recolor(button.dataset.color)));
  document.querySelector('#customAdd').addEventListener('click', () => S.addCart(selected.id, Number(document.querySelector('#customSize').value)));
  document.querySelector('#saveDesign').addEventListener('click', () => {
    localStorage.setItem('kicksLabCustomDesign', JSON.stringify({ productId: selected.id, color: document.querySelector('[data-color].active')?.dataset.color || '#ff5a36', savedAt: new Date().toISOString() }));
    window.klToast?.('Design saved in this browser');
  });

  // Try the supplied GLB first; if it is missing or fails to parse, the built-in shoe is shown.
  new GLTFLoader().load(
    'assets/models/sneaker.glb',
    gltf => installModel(gltf.scene, false),
    undefined,
    () => installModel(makeFallbackSneaker(), true)
  );

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
