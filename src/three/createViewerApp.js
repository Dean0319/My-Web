import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { createGLTFLoader } from "./loaders/createGLTFLoader.js";
import { fitCameraToObject } from "./utils/fitCameraToObject.js";
import { installResizeHandler } from "./utils/installResizeHandler.js";

// createViewerApp：
// - 负责 three.js 场景、相机、渲染循环
// - 提供 setModel / loadGLB* 等方法
// - 通过回调把“部件点击”事件交给 UI 层（UI 层负责展示详细介绍）
//
// 交互模式（当前）：Rhino-like（更接近 Rhino 视图导航）
// - 右键拖拽：旋转视图（Orbit）
// - 中键拖拽：平移视图（Pan）
// - 滚轮：缩放（Dolly）
// - 左键单击：拾取部件（查看详细介绍）
//
// 本文件刻意禁用了“触屏手势导航”，以免与 Rhino 鼠标操作产生重复/冲突。
export function createViewerApp({ canvas, onStatus, onPick, onCameraUpdate }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe7ebef);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 5000);
  camera.position.set(3, 2, 5);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const ssaoPass = new SSAOPass(scene, camera, 1, 1);
  ssaoPass.kernelRadius = 32;
  ssaoPass.minDistance = 0.0005;
  ssaoPass.maxDistance = 0.1;
  composer.addPass(ssaoPass);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.035, 0.2, 0.9);
  composer.addPass(bloomPass);
  let renderEffectsEnabled = true;
  let shadowEnabled = true;
  let sunEnabled = true;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // 阻尼系数：越大越“跟手”（惯性更小、停止更快），越小越“拖泥带水”（惯性更强）。
  // 想更丝滑但不粘滞：通常把它从默认值（≈0.05）提高到 0.1~0.2 比较合适。
  controls.dampingFactor = 0.14;
  controls.enablePan = true;
  controls.enableRotate = true;
  controls.target.set(0, 0.9, 0);

  // Rhino-like：右键旋转，中键平移，滚轮缩放。
  // 说明：左键留给“点击部件”。我们会在 pointerdown 捕获阶段拦截左键，避免 OrbitControls 响应。
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE,
  };

  // 取消“手势（触屏）”导航，避免和 Rhino 鼠标操作混淆。
  // 如果未来需要移动端手势，再把这里改回 ROTATE / DOLLY_PAN 即可。
  controls.touches = {
    ONE: THREE.TOUCH.NONE,
    TWO: THREE.TOUCH.NONE,
  };

  controls.update();

  // 阻止右键菜单，避免影响右键拖拽旋转
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // 灯光：偏柔和，适合“纸张 + 墨色”主题
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe3e5e8, 1.2));
  const dir = new THREE.DirectionalLight(0xffffff, 1.55);
  dir.position.set(8, 16, 10);
  dir.castShadow = true;
  dir.shadow.mapSize.set(4096, 4096);
  dir.shadow.bias = -0.00015;
  dir.shadow.normalBias = 0.025;
  dir.shadow.camera.near = 0.1;
  dir.shadow.camera.far = 250;
  dir.shadow.camera.left = -24;
  dir.shadow.camera.right = 24;
  dir.shadow.camera.top = 24;
  dir.shadow.camera.bottom = -24;
  scene.add(dir);
  scene.add(dir.target);

  // 轻微补光，增强结构可读性。
  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  fill.position.set(-5, 4, -6);
  scene.add(fill);

  // 可见的太阳
  const sunGeometry = new THREE.SphereGeometry(2.2, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    emissive: 0xffee88,
    emissiveIntensity: 1.4,
  });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunMesh.position.copy(dir.position);
  sunMesh.userData.pickable = false;
  scene.add(sunMesh);

  // 地面与网格仅用于参照（不可拾取）
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  ground.userData.pickable = false;
  scene.add(ground);

  const grid = new THREE.GridHelper(40, 40, 0x2f2a22, 0x2f2a22);
  grid.material.opacity = 0.12;
  grid.material.transparent = true;
  grid.visible = false;
  grid.position.y = 0.001;
  grid.userData.pickable = false;
  scene.add(grid);

  // pivot：用于挂载当前模型（便于替换/清理）
  const pivot = new THREE.Group();
  pivot.name = "ModelRoot";
  scene.add(pivot);

  const loader = createGLTFLoader();

  let currentRoot = null;
  let selectedMesh = null;
  let hoveredMesh = null;
  let lockedView = null;
  let edgeEnabled = true;
  const edgeLineMaterials = new Set();
  const edgeLines = new Set();
  const interactiveEdgeMaterials = new Set();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const clickState = {
    downX: 0,
    downY: 0,
    moved: false,
  };

  function setStatus(text) {
    onStatus?.(text);
  }

  function applyLightingState() {
    const shadowPipelineEnabled = renderEffectsEnabled && shadowEnabled;

    renderer.shadowMap.enabled = shadowPipelineEnabled;
    dir.castShadow = shadowPipelineEnabled;
    ground.receiveShadow = shadowPipelineEnabled;
    ssaoPass.enabled = shadowPipelineEnabled;
    sunMesh.visible = sunEnabled;
    dir.visible = sunEnabled;

    scene.environment = renderEffectsEnabled ? envTexture : null;
    bloomPass.enabled = renderEffectsEnabled;
    renderer.toneMappingExposure = renderEffectsEnabled ? 1.28 : 1.08;

    const hemi = scene.children.find((obj) => obj.type === "HemisphereLight");
    if (hemi) hemi.intensity = renderEffectsEnabled ? 1.0 : 0.88;

    if (shadowPipelineEnabled) {
      dir.intensity = 1.8;
      fill.intensity = 0.52;
    } else {
      dir.intensity = renderEffectsEnabled ? 1.4 : 1.2;
      fill.intensity = renderEffectsEnabled ? 0.78 : 0.68;
    }
  }

  function setRenderEffectsEnabled(enabled) {
    renderEffectsEnabled = !!enabled;
    applyLightingState();
  }

  function toggleRenderEffects() {
    setRenderEffectsEnabled(!renderEffectsEnabled);
    return renderEffectsEnabled;
  }

  function setShadowEnabled(enabled) {
    shadowEnabled = !!enabled;
    applyLightingState();
  }

  function toggleShadowEnabled() {
    setShadowEnabled(!shadowEnabled);
    return shadowEnabled;
  }

  function setSunEnabled(enabled) {
    sunEnabled = !!enabled;
    applyLightingState();
  }

  function toggleSunEnabled() {
    setSunEnabled(!sunEnabled);
    return sunEnabled;
  }

  function applyEdgeState() {
    for (const line of edgeLines) {
      line.visible = edgeEnabled;
    }
  }

  function setEdgeEnabled(enabled) {
    edgeEnabled = !!enabled;
    applyEdgeState();
  }

  function toggleEdgeEnabled() {
    setEdgeEnabled(!edgeEnabled);
    return edgeEnabled;
  }

  applyLightingState();

  function markPickable(root) {
    root.traverse((obj) => {
      if (obj.isMesh && obj.userData.pickable === undefined) obj.userData.pickable = true;
    });
  }

  function setupShadowForObject(object) {
    if (!object) return;
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = Math.max(8, sphere.radius * 1.55);
    dir.target.position.copy(sphere.center);

    scene.fog = new THREE.Fog(0xe7ebef, radius * 1.25, radius * 4.8);

    dir.shadow.camera.left = -radius;
    dir.shadow.camera.right = radius;
    dir.shadow.camera.top = radius;
    dir.shadow.camera.bottom = -radius;
    dir.shadow.camera.near = 0.1;
    dir.shadow.camera.far = Math.max(140, radius * 5.2);
    dir.shadow.camera.updateProjectionMatrix();
  }

  function getPercentile(values, ratio = 0.7) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor(sorted.length * ratio)));
    return sorted[idx];
  }

  function addMassEdge(mesh) {
    if (!mesh.geometry) return;
    const edgeGeometry = new THREE.EdgesGeometry(mesh.geometry, 40);
    const lineGeometry = new LineSegmentsGeometry();
    lineGeometry.setPositions(edgeGeometry.attributes.position.array);
    edgeGeometry.dispose();

    const edgeMaterial = new LineMaterial({
      color: 0x58606c,
      transparent: true,
      opacity: 0.52,
      linewidth: 2.2,
      worldUnits: false,
      depthTest: true,
      depthWrite: false,
    });
    edgeMaterial.resolution.set(window.innerWidth, window.innerHeight);
    edgeLineMaterials.add(edgeMaterial);

    const lines = new LineSegments2(lineGeometry, edgeMaterial);
    lines.name = "MassEdge";
    lines.userData.pickable = false;
    lines.renderOrder = 2;
    lines.visible = edgeEnabled;
    edgeLines.add(lines);
    mesh.add(lines);
  }

  function emphasizeBuildingMass(root) {
    if (!root) return;

    // 保留轮廓线强化，但不再修改任何材质颜色，避免“整体偏色”。
    const rootBox = new THREE.Box3().setFromObject(root);
    if (rootBox.isEmpty()) return;
    const rootSize = rootBox.getSize(new THREE.Vector3());

    const meshHeights = [];
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      const box = new THREE.Box3().setFromObject(obj);
      if (box.isEmpty()) return;
      meshHeights.push(box.getSize(new THREE.Vector3()).y);
    });

    const percentileH = getPercentile(meshHeights, 0.72);
    const minBuildingHeight = Math.max(rootSize.y * 0.015, percentileH);

    root.traverse((obj) => {
      if (!obj.isMesh) return;

      const box = new THREE.Box3().setFromObject(obj);
      if (box.isEmpty()) return;
      const size = box.getSize(new THREE.Vector3());
      const isBuildingMass = size.y >= minBuildingHeight && size.y > Math.max(size.x, size.z) * 0.02;

      if (isBuildingMass && obj.geometry?.attributes?.position?.count < 180000) {
        addMassEdge(obj);
      }
    });
  }

  function enableModelShadows(root) {
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
    });
  }

  function clearModel() {
    if (!currentRoot) return;
    clearHover();
    clearSelection();
    pivot.remove(currentRoot);

    currentRoot.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose?.();
      if (!obj.material) return;
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of materials) {
        for (const key of Object.keys(m)) {
          const v = m[key];
          if (v && typeof v === "object" && v.isTexture) v.dispose?.();
        }
        m.dispose?.();
      }
    });

    currentRoot = null;
    canvas.style.cursor = "default";
    edgeLineMaterials.clear();
    edgeLines.clear();
    interactiveEdgeMaterials.clear();
  }

  function clearSelection() {
    if (!selectedMesh) return;
    applyHighlight(selectedMesh, "none");
    selectedMesh = null;
  }

  function clearHover() {
    if (!hoveredMesh) return;
    applyHighlight(hoveredMesh, "none");
    hoveredMesh = null;
  }

  function collectHighlightMeshes(target) {
    if (!target) return [];
    if (target.isMesh) return [target];

    const meshes = [];
    target.traverse((obj) => {
      if (obj.isMesh) meshes.push(obj);
    });
    return meshes;
  }

  function ensureInteractiveEdge(mesh) {
    if (mesh.userData.__intEdge) return mesh.userData.__intEdge;
    if (!mesh.geometry) return null;

    const edgeGeometry = new THREE.EdgesGeometry(mesh.geometry, 36);
    const lineGeometry = new LineSegmentsGeometry();
    lineGeometry.setPositions(edgeGeometry.attributes.position.array);
    edgeGeometry.dispose();

    const coreMaterial = new LineMaterial({
      color: 0xd7edf4,
      transparent: true,
      opacity: 0.62,
      linewidth: 2.2,
      worldUnits: false,
      depthTest: true,
      depthWrite: false,
    });
    coreMaterial.resolution.set(window.innerWidth, window.innerHeight);
    interactiveEdgeMaterials.add(coreMaterial);

    // 外层“软边”用于模拟轻微虚化，避免边缘过硬。
    const softMaterial = new LineMaterial({
      color: 0xc6deea,
      transparent: true,
      opacity: 0.24,
      linewidth: 5.2,
      worldUnits: false,
      depthTest: true,
      depthWrite: false,
    });
    softMaterial.resolution.set(window.innerWidth, window.innerHeight);
    interactiveEdgeMaterials.add(softMaterial);

    const softLine = new LineSegments2(lineGeometry, softMaterial);
    softLine.name = "InteractiveEdgeSoft";
    softLine.userData.pickable = false;
    softLine.renderOrder = 3;
    mesh.add(softLine);

    const coreLine = new LineSegments2(lineGeometry, coreMaterial);
    coreLine.name = "InteractiveEdgeCore";
    coreLine.userData.pickable = false;
    coreLine.renderOrder = 4;
    mesh.add(coreLine);

    const info = { coreLine, softLine, lineGeometry, coreMaterial, softMaterial };
    mesh.userData.__intEdge = info;
    return info;
  }

  function setInteractiveEdgeStyle(mesh, mode) {
    if (mode === "none") {
      const info = mesh.userData.__intEdge;
      if (!info) return;
      mesh.remove(info.coreLine);
      mesh.remove(info.softLine);
      interactiveEdgeMaterials.delete(info.coreMaterial);
      interactiveEdgeMaterials.delete(info.softMaterial);
      info.lineGeometry.dispose?.();
      info.coreMaterial.dispose?.();
      info.softMaterial.dispose?.();
      delete mesh.userData.__intEdge;
      return;
    }

    const info = ensureInteractiveEdge(mesh);
    if (!info) return;

    if (mode === "hover") {
      info.coreMaterial.color.setHex(0xd8e9f2);
      info.coreMaterial.opacity = 0.66;
      info.coreMaterial.linewidth = 2.3;
      info.softMaterial.color.setHex(0xd8e9f2);
      info.softMaterial.opacity = 0.2;
      info.softMaterial.linewidth = 4.8;
    } else {
      info.coreMaterial.color.setHex(0x2c3f56);
      info.coreMaterial.opacity = 0.86;
      info.coreMaterial.linewidth = 3.1;
      info.softMaterial.color.setHex(0x6a8198);
      info.softMaterial.opacity = 0.28;
      info.softMaterial.linewidth = 6.2;
    }
    info.coreMaterial.needsUpdate = true;
    info.softMaterial.needsUpdate = true;
  }

  // 高亮：支持 hover/selected 两档，材质与边缘区分显示。
  function applyHighlight(target, mode = "selected") {
    const meshes = collectHighlightMeshes(target);

    for (const mesh of meshes) {
      if (mode !== "none") {
        if (!mesh.userData.__hlOrigMaterial) {
          const origArray = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const hlArray = origArray.map((mat) => {
            if (!mat || typeof mat.clone !== "function") return mat;
            return mat.clone();
          });

          mesh.userData.__hlOrigMaterial = mesh.material;
          mesh.userData.__hlOrigMaterials = origArray;
          mesh.userData.__hlMaterials = hlArray;
          mesh.material = Array.isArray(mesh.material) ? hlArray : hlArray[0];
        }

        const hlArray = mesh.userData.__hlMaterials || [];
        for (const cloned of hlArray) {
          if (!cloned) continue;

          if (cloned.emissive !== undefined) {
            if (mode === "hover") {
              cloned.emissive.setHex(0xb7dce0);
              cloned.emissiveIntensity = 0.24;
            } else {
              cloned.emissive.setHex(0x0f5f66);
              cloned.emissiveIntensity = 0.82;
            }
          } else if (cloned.color) {
            if (mode === "hover") {
              cloned.color.offsetHSL(0, 0.06, 0.03);
            } else {
              cloned.color.offsetHSL(0, 0.16, 0.08);
            }
          }

          cloned.needsUpdate = true;
        }

        setInteractiveEdgeStyle(mesh, mode);
        continue;
      }

      if (!mesh.userData.__hlOrigMaterial) continue;

      const origArray = mesh.userData.__hlOrigMaterials || [];
      const hlArray = mesh.userData.__hlMaterials || [];
      mesh.material = mesh.userData.__hlOrigMaterial;

      for (let i = 0; i < hlArray.length; i++) {
        const hl = hlArray[i];
        const orig = origArray[i];
        if (hl && hl !== orig) hl.dispose?.();
      }

      setInteractiveEdgeStyle(mesh, "none");

      delete mesh.userData.__hlOrigMaterial;
      delete mesh.userData.__hlOrigMaterials;
      delete mesh.userData.__hlMaterials;
    }
  }

  function setModel(root, { fit = true } = {}) {
    clearModel();

    currentRoot = root;
    pivot.add(root);

    enableModelShadows(root);
    emphasizeBuildingMass(root);
    markPickable(root);
    setupShadowForObject(root);

    if (fit) {
      fitCameraToObject({ THREE, camera, controls, object: root, padding: 1.25 });
    }

    setStatus("模型已就绪：右键旋转 / 中键平移 / 滚轮缩放；左键点击部件查看介绍。");
  }
  // Set a consistent angled view based on the object's bounding sphere.
  function setViewForObject({
    object,
    azimuthDeg = -35,
    polarDeg = 55,
    distanceFactor = 1.8,
    targetOffset = new THREE.Vector3(0, 0, 0),
  }) {
    if (!object) return;
    const box = new THREE.Box3().setFromObject(object);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const target = sphere.center.clone().add(targetOffset);

    const radius = Math.max(1, sphere.radius * distanceFactor);
    const phi = THREE.MathUtils.degToRad(polarDeg);
    const theta = THREE.MathUtils.degToRad(azimuthDeg);
    const offset = new THREE.Spherical(radius, phi, theta);

    camera.position.setFromSpherical(offset).add(target);
    controls.target.copy(target);
    controls.update();
  }

  function setCameraPose({ position, target }) {
    if (position) camera.position.copy(position);
    if (target) controls.target.copy(target);
    controls.update();
  }

  function lockView({ position, target, fov } = {}) {
    if (position) camera.position.copy(position);
    if (target) controls.target.copy(target);
    if (typeof fov === "number" && Number.isFinite(fov)) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    lockedView = {
      position: camera.position.clone(),
      target: controls.target.clone(),
      fov: camera.fov,
    };

    controls.enabled = false;
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.update();
  }

  function unlockView() {
    lockedView = null;
    controls.enabled = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.update();
  }

  function pitchCameraDown(degrees = 60) {
    const dir = new THREE.Vector3().subVectors(controls.target, camera.position);
    if (dir.lengthSq() < 1e-8) return;

    const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
    const rad = THREE.MathUtils.degToRad(Math.abs(degrees));

    const candA = dir.clone().applyAxisAngle(right, rad);
    const candB = dir.clone().applyAxisAngle(right, -rad);
    const nextDir = candA.y <= candB.y ? candA : candB;

    controls.target.copy(camera.position.clone().add(nextDir));
    controls.update();
  }

  function yawCameraLeft(degrees = 15) {
    const dir = new THREE.Vector3().subVectors(controls.target, camera.position);
    if (dir.lengthSq() < 1e-8) return;

    const rad = THREE.MathUtils.degToRad(Math.abs(degrees));
    const nextDir = dir.clone().applyAxisAngle(camera.up, rad);

    controls.target.copy(camera.position.clone().add(nextDir));
    controls.update();
  }

  function panCameraLeft(fraction = 0.25) {
    const dir = new THREE.Vector3().subVectors(controls.target, camera.position);
    if (dir.lengthSq() < 1e-8) return;

    const distance = dir.length();
    const left = new THREE.Vector3().crossVectors(camera.up, dir).normalize();
    const offset = left.multiplyScalar(distance * fraction);

    camera.position.add(offset);
    controls.target.add(offset);
    controls.update();
  }

  // 仅加载 glTF 并返回 root（不自动 setModel）。
  // 用途：当模型被拆成多个 glTF 分片时，UI 层可以把多个 root 组装到同一个 Group 再一次性 fit 相机。
  async function loadGLTFRootFromUrl(url) {
    const gltf = await loader.loadAsync(url);
    const root = gltf.scene || gltf.scenes?.[0];
    if (!root) throw new Error("GLTF 没有 scene");

    // 给没有命名的 mesh 补一个稳定名字（便于映射详细介绍）
    let autoIdx = 1;
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      if (!obj.name) obj.name = `Mesh_${autoIdx++}`;
    });

    return root;
  }

  async function loadGLBUrl(url) {
    setStatus("加载中…");
    const root = await loadGLTFRootFromUrl(url);

    setModel(root, { fit: true });
    setStatus("加载完成。");

    return root;
  }

  async function loadGLBFile(file) {
    const objectUrl = URL.createObjectURL(file);
    try {
      return await loadGLBUrl(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function resetView() {
    if (lockedView) {
      camera.position.copy(lockedView.position);
      controls.target.copy(lockedView.target);
      camera.fov = lockedView.fov;
      camera.updateProjectionMatrix();
      controls.update();
      return;
    }

    if (currentRoot) {
      fitCameraToObject({ THREE, camera, controls, object: currentRoot, padding: 1.25 });
      return;
    }
    camera.position.set(3, 2, 5);
    controls.target.set(0, 0.9, 0);
    controls.update();
  }

  function setPointerFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.set(x, y);
  }

  function isWaterLikeObject(obj) {
    if (!obj?.isMesh) return false;

    const name = (obj.name || "").toLowerCase();
    if (/water|river|lake|canal|pond|stream|shui|水|河|湖|渠/.test(name)) return true;

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const hsl = { h: 0, s: 0, l: 0 };

    for (const m of mats) {
      const matName = (m?.name || "").toLowerCase();
      if (/water|river|lake|canal|pond|stream|shui|水|河|湖|渠/.test(matName)) return true;
      if (!m?.color) continue;

      m.color.getHSL(hsl);
      const looksBlueCyan = hsl.h >= 0.48 && hsl.h <= 0.62;
      if (looksBlueCyan && hsl.s >= 0.2 && hsl.l >= 0.2 && hsl.l <= 0.82) return true;
    }

    return false;
  }

  function getFirstPickHit(e) {
    if (!currentRoot) return null;
    setPointerFromEvent(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(pivot, true);
    return hits.find((h) => h.object?.userData?.pickable !== false) || null;
  }

  function resolvePickObject(hitObject) {
    if (!hitObject) return null;

    let obj = hitObject;
    const waterPick = isWaterLikeObject(hitObject);
    if (!waterPick) {
      while (obj && !obj.userData.partId && obj.parent && obj.parent !== pivot) obj = obj.parent;
    }
    return obj;
  }

  function pick(e) {
    if (!currentRoot) {
      onPick?.(null);
      return;
    }

    const hit = getFirstPickHit(e);

    if (!hit?.object) {
      clearSelection();
      onPick?.(null);
      return;
    }

    const waterPick = isWaterLikeObject(hit.object);
    const obj = resolvePickObject(hit.object);

    if (hoveredMesh && hoveredMesh === obj) {
      applyHighlight(hoveredMesh, "none");
      hoveredMesh = null;
    }

    clearSelection();
    if (waterPick) {
      selectedMesh = obj;
      applyHighlight(selectedMesh, "selected");
    } else {
      selectedMesh = null;
    }

    onPick?.({ object: obj, hit });
  }

  // 点击拾取：用“位移阈值”避免与 OrbitControls 拖拽冲突
  // 关键点：在捕获阶段拦截左键 pointerdown，避免 OrbitControls 把左键当作平移。
  canvas.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      clickState.downX = e.clientX;
      clickState.downY = e.clientY;
      clickState.moved = false;
      e.stopImmediatePropagation();
    },
    { capture: true }
  );

  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    if (e.buttons !== 1) return;
    const dist = Math.hypot(e.clientX - clickState.downX, e.clientY - clickState.downY);
    if (dist > 6) clickState.moved = true;
  });

  // 悬停预高亮：浅色、柔和边缘，作为点击前提示。
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    if (e.buttons !== 0) return;

    const hit = getFirstPickHit(e);
    const waterHover = !!hit?.object && isWaterLikeObject(hit.object);
    const nextHover = waterHover ? resolvePickObject(hit.object) : null;
    const target = nextHover === selectedMesh ? null : nextHover;

    if (hoveredMesh && hoveredMesh !== target) {
      applyHighlight(hoveredMesh, "none");
      hoveredMesh = null;
    }

    if (target && hoveredMesh !== target) {
      hoveredMesh = target;
      applyHighlight(hoveredMesh, "hover");
    }

    canvas.style.cursor = waterHover ? "pointer" : "default";
  });

  canvas.addEventListener("pointerleave", () => {
    clearHover();
    canvas.style.cursor = "default";
  });

  canvas.addEventListener("pointerup", (e) => {
    if (e.pointerType === "touch") return;
    if (e.button !== 0) return;
    if (clickState.moved) return;
    pick(e);
  });

  const stopResize = installResizeHandler({
    canvas,
    renderer,
    camera,
    onResize: ({ width, height }) => {
      composer.setSize(width, height);
      composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      ssaoPass.setSize(width, height);
      bloomPass.setSize(width, height);
      for (const m of edgeLineMaterials) m.resolution.set(width, height);
      for (const m of interactiveEdgeMaterials) m.resolution.set(width, height);
    },
  });

  let raf = 0;
  function tick() {
    controls.update();
    onCameraUpdate?.({
      position: camera.position,
      target: controls.target,
    });
    composer.render();
    raf = requestAnimationFrame(tick);
  }
  tick();

  function dispose() {
    cancelAnimationFrame(raf);
    stopResize();
    clearModel();
    controls.dispose();
    composer.dispose();
    envTexture.dispose?.();
    pmremGenerator.dispose();
    renderer.dispose();
  }

  return {
    setModel,
    loadGLBUrl,
    loadGLTFRootFromUrl,
    loadGLBFile,
    setRenderEffectsEnabled,
    toggleRenderEffects,
    isRenderEffectsEnabled: () => renderEffectsEnabled,
    setShadowEnabled,
    toggleShadowEnabled,
    isShadowEnabled: () => shadowEnabled,
    setSunEnabled,
    toggleSunEnabled,
    isSunEnabled: () => sunEnabled,
    setEdgeEnabled,
    toggleEdgeEnabled,
    isEdgeEnabled: () => edgeEnabled,
    setViewForObject,
    setCameraPose,
    lockView,
    unlockView,
    pitchCameraDown,
    yawCameraLeft,
    panCameraLeft,
    resetView,
    dispose,
    getCurrentRoot: () => currentRoot,
  };
}
