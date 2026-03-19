import "./style.css";

import * as THREE from "three";
import { createViewerApp } from "./three/createViewerApp.js";
import { analysisCategories } from "./data/analysisCategories.js";
import { demoPartDetails, detailsByMeshName } from "./data/partDetails.js";
import { renderAnalysis } from "./ui/renderAnalysis.js";
import { renderDetails } from "./ui/renderDetails.js";
import { createSideTabs } from "./ui/createSideTabs.js";
import { publicUrl } from "./utils/publicUrl.js";

const canvas = document.querySelector("#gl");
const hud = document.querySelector("#hud");
const cameraPos = document.querySelector("#camera-pos");

const resetBtn = document.querySelector("#reset");
const toggleEdgeBtn = document.querySelector("#toggle-edge");
const toggleSunBtn = document.querySelector("#toggle-sun");
const toggleShadowBtn = document.querySelector("#toggle-shadow");

const analysisRoot = document.querySelector("#analysis-root");
const detailRoot = document.querySelector("#detail-root");

const sideTabs = createSideTabs({
  tablist: document.querySelector("#side-tabs"),
  panes: {
    analysis: analysisRoot,
    detail: detailRoot,
  },
  initial: "analysis",
});

function setHud(text) {
  hud.textContent = text;
}

function formatNumber(n) {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function setCameraPosText(position) {
  if (!cameraPos || !position) return;
  cameraPos.textContent = `Camera: x ${formatNumber(position.x)}, y ${formatNumber(position.y)}, z ${formatNumber(position.z)}`;
}

const analysisLabelById = Object.fromEntries(analysisCategories.map((c) => [c.id, c.label]));

const WATER_DETAIL = {
  title: "水体系统",
  subtitle: "河道与滨水空间",
  description:
    "该区域为水体要素，可用于展示：河道断面、驳岸形式、蓝绿基础设施、雨洪调蓄与滨水步行体验等内容。",
  tags: ["水体", "滨水", "雨洪", "生态"],
  relatedAnalysis: ["location", "history"],
};

function isLikelyWaterMesh(mesh) {
  if (!mesh?.isMesh || !mesh.material) return false;

  const name = (mesh.name || "").toLowerCase();
  if (/water|river|lake|canal|pond|stream|shui|水|河|湖|渠/.test(name)) return true;

  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const planar = size.y <= Math.max(0.25, Math.min(size.x, size.z) * 0.08);

  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const hsl = { h: 0, s: 0, l: 0 };
  let hasWaterColor = false;
  for (const m of mats) {
    if (!m?.color) continue;
    m.color.getHSL(hsl);
    if (hsl.h >= 0.48 && hsl.h <= 0.62 && hsl.s >= 0.2 && hsl.l >= 0.2 && hsl.l <= 0.82) {
      hasWaterColor = true;
      break;
    }
  }

  return hasWaterColor && planar;
}

const analysisUI = renderAnalysis({
  mount: analysisRoot,
  categories: analysisCategories,
  initialId: analysisCategories[0]?.id,
});

const detailsUI = renderDetails({
  mount: detailRoot,
  getAnalysisLabel: (id) => analysisLabelById[id],
  onJumpAnalysis: (id) => {
    analysisUI.setActive(id);
    sideTabs.setActive("analysis");
  },
});

function resolvePartDetails({ object, hit }) {
  const pickedMesh = object?.isMesh ? object : hit?.object;

  // 1) demo：优先通过 partId 映射（示例建筑用的是这个）
  const partId = object?.userData?.partId;
  if (partId && demoPartDetails[partId]) {
    return { ...demoPartDetails[partId], debug: { meshName: object.name } };
  }

  // 2) glb：通过 mesh.name 映射（推荐学生用 mesh.name 做映射）
  const name = object?.name;
  if (name && detailsByMeshName[name]) {
    return { ...detailsByMeshName[name], debug: { meshName: name } };
  }

  // 3) 水体：按名称/颜色+形体特征识别，点击蓝色水面可直接看到说明。
  if (isLikelyWaterMesh(pickedMesh)) {
    return {
      ...WATER_DETAIL,
      debug: { meshName: name || pickedMesh?.name },
    };
  }

  // 4) fallback：至少把名字展示出来，学生后续再补充
  return {
    title: name || "未命名部件",
    subtitle: partId ? `partId: ${partId}` : "（未配置详细介绍）",
    description:
      "你可以在 src/data/partDetails.js 中为该部件补充：标题、说明、标签，以及关联的分析类别。",
    tags: ["待补充"],
    relatedAnalysis: [],
    debug: { meshName: name },
  };
}

const app = createViewerApp({
  canvas,
  onStatus: setHud,
  onCameraUpdate: ({ position }) => {
    setCameraPosText(position);
  },
  onPick: (payload) => {
    if (!payload?.object) {
      detailsUI.clear();
      setHud("未选中部件。提示：右键旋转 / 中键平移 / 滚轮缩放；左键点击部件查看介绍。");
      return;
    }

    const detail = resolvePartDetails(payload);
    detailsUI.setPart(detail);
    sideTabs.setActive("detail");
    setHud(`已选中：${payload.object.name || "(未命名)"}`);
  },
});

function syncShadowButton() {
  if (!toggleShadowBtn) return;
  const enabled = app.isShadowEnabled();
  toggleShadowBtn.textContent = enabled ? "阴影：开" : "阴影：关";
}

function syncSunButton() {
  if (!toggleSunBtn) return;
  const enabled = app.isSunEnabled();
  toggleSunBtn.textContent = enabled ? "太阳：开" : "太阳：关";
}

function syncEdgeButton() {
  if (!toggleEdgeBtn) return;
  const enabled = app.isEdgeEnabled();
  toggleEdgeBtn.textContent = enabled ? "边缘：开" : "边缘：关";
}

syncShadowButton();
syncSunButton();
syncEdgeButton();

function loadYuYuanModel() {
  const url = publicUrl("models/diao-yu-tai-yuyuan/钓鱼台+荷花塘-愚园-2018_result-0.gltf");
  setHud("加载中…（钓鱼台+荷花塘-愚园-2018）");

  return app
    .loadGLBUrl(url)
    .then(() => {
      detailsUI.clear();
      sideTabs.setActive("analysis");
      setHud("已加载默认演示模型：钓鱼台+荷花塘-愚园-2018。");
      app.setViewForObject({ object: app.getCurrentRoot(), azimuthDeg: -35, polarDeg: 55, distanceFactor: 2.2 });
      app.setCameraPose({ position: new THREE.Vector3(-764.51, 232.79, -1057.11) });
      app.yawCameraLeft(15);
      app.pitchCameraDown(45);
      app.panCameraLeft(0.1);
    })
    .catch((err) => {
      console.error(err);
      setHud("加载失败：默认演示模型。请确认 public/models/diao-yu-tai-yuyuan/ 下的 gltf/bin/jpg 是否齐全。");
    });
}

loadYuYuanModel();

resetBtn.addEventListener("click", () => {
  app.resetView();
  setHud("已重置视角。");
});

toggleSunBtn?.addEventListener("click", () => {
  const enabled = app.toggleSunEnabled();
  syncSunButton();
  setHud(enabled ? "太阳已开启。" : "太阳已关闭。");
});

toggleShadowBtn?.addEventListener("click", () => {
  const enabled = app.toggleShadowEnabled();
  syncShadowButton();
  setHud(enabled ? "阴影已开启（含 AO 接触阴影）。" : "阴影已关闭（更平面）。");
});

toggleEdgeBtn?.addEventListener("click", () => {
  const enabled = app.toggleEdgeEnabled();
  syncEdgeButton();
  setHud(enabled ? "边缘加粗已开启。" : "边缘加粗已关闭。");
});

window.addEventListener("beforeunload", () => {
  app.dispose();
});
