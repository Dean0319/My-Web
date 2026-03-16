import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
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
export function createViewerApp({ canvas, onStatus, onPick }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
  camera.position.set(3, 2, 5);

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
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2f2a22, 0.9));
  const dir = new THREE.DirectionalLight(0xffffff, 1.8);
  dir.position.set(6, 10, 7);
  scene.add(dir);

  // 地面与网格仅用于参照（不可拾取）
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0xf1eadb, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.userData.pickable = false;
  scene.add(ground);

  const grid = new THREE.GridHelper(40, 40, 0x2f2a22, 0x2f2a22);
  grid.material.opacity = 0.12;
  grid.material.transparent = true;
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

  function markPickable(root) {
    root.traverse((obj) => {
      if (obj.isMesh && obj.userData.pickable === undefined) obj.userData.pickable = true;
    });
  }

  function clearModel() {
    if (!currentRoot) return;
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
    clearSelection();
  }

  function clearSelection() {
    if (!selectedMesh) return;
    applyHighlight(selectedMesh, false);
    selectedMesh = null;
  }

  // 简单高亮：使用 emissive（不改动原始 baseColor）
  function applyHighlight(mesh, enabled) {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (!m || m.emissive === undefined) continue;
      if (enabled) {
        if (!mesh.userData.__origEmissive) mesh.userData.__origEmissive = m.emissive.clone();
        m.emissive.setHex(0x0a5c5a);
        m.emissiveIntensity = 0.35;
      } else if (mesh.userData.__origEmissive) {
        m.emissive.copy(mesh.userData.__origEmissive);
        m.emissiveIntensity = 1.0;
      }
    }
  }

  function setModel(root, { fit = true } = {}) {
    clearModel();

    currentRoot = root;
    pivot.add(root);

    markPickable(root);

    if (fit) {
      fitCameraToObject({ THREE, camera, controls, object: root, padding: 1.25 });
    }

    setStatus("模型已就绪：右键旋转 / 中键平移 / 滚轮缩放；左键点击部件查看介绍。");
  }

  async function loadGLBUrl(url) {
    setStatus("加载中…");
    const gltf = await loader.loadAsync(url);
    const root = gltf.scene || gltf.scenes?.[0];
    if (!root) throw new Error("GLTF 没有 scene");

    // 给没有命名的 mesh 补一个稳定名字（便于映射详细介绍）
    let autoIdx = 1;
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      if (!obj.name) obj.name = `Mesh_${autoIdx++}`;
    });

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

  function pick(e) {
    if (!currentRoot) {
      onPick?.(null);
      return;
    }

    setPointerFromEvent(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(pivot, true);
    const hit = hits.find((h) => h.object?.userData?.pickable !== false);

    if (!hit?.object) {
      clearSelection();
      onPick?.(null);
      return;
    }

    // 尽量上溯到“带 partId 的父级”，以便学生用 Group 做语义分组
    let obj = hit.object;
    while (obj && !obj.userData.partId && obj.parent && obj.parent !== pivot) obj = obj.parent;

    clearSelection();
    selectedMesh = obj;
    applyHighlight(selectedMesh, true);

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

  canvas.addEventListener("pointerup", (e) => {
    if (e.pointerType === "touch") return;
    if (e.button !== 0) return;
    if (clickState.moved) return;
    pick(e);
  });

  const stopResize = installResizeHandler({ canvas, renderer, camera });

  let raf = 0;
  function tick() {
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  function dispose() {
    cancelAnimationFrame(raf);
    stopResize();
    clearModel();
    controls.dispose();
    renderer.dispose();
  }

  return {
    setModel,
    loadGLBUrl,
    loadGLBFile,
    resetView,
    dispose,
    getCurrentRoot: () => currentRoot,
  };
}
