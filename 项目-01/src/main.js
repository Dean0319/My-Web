import "./style.css";

import { createViewerApp } from "./three/createViewerApp.js";
import { createBuildingDemo } from "./demo/createBuildingDemo.js";
import { analysisCategories } from "./data/analysisCategories.js";
import { demoPartDetails, detailsByMeshName } from "./data/partDetails.js";
import { renderAnalysis } from "./ui/renderAnalysis.js";
import { renderDetails } from "./ui/renderDetails.js";
import { createSideTabs } from "./ui/createSideTabs.js";

const canvas = document.querySelector("#gl");
const hud = document.querySelector("#hud");

const fileInput = document.querySelector("#file");
const loadDemoBtn = document.querySelector("#load-demo");
const loadUrlBtn = document.querySelector("#load-url");
const resetBtn = document.querySelector("#reset");

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

const analysisLabelById = Object.fromEntries(analysisCategories.map((c) => [c.id, c.label]));

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

function resolvePartDetails({ object }) {
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

  // 3) fallback：至少把名字展示出来，学生后续再补充
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

function loadBuildingDemo() {
  const { root } = createBuildingDemo();
  app.setModel(root, { fit: true });
  detailsUI.clear();
  sideTabs.setActive("analysis");
  setHud("已加载示例建筑场景：右键旋转 / 中键平移 / 滚轮缩放；左键点击建筑部件查看介绍。");
}

// 初始状态：放入示例建筑 + 环境
loadBuildingDemo();

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".glb")) {
    setHud("仅示例支持 .glb（glTF Binary）。");
    return;
  }

  try {
    await app.loadGLBFile(file);
    detailsUI.clear();
    sideTabs.setActive("analysis");
    setHud(`模型已加载：${file.name}。提示：点击不同部件可查看介绍（需在 partDetails.js 配置）。`);
  } catch (err) {
    console.error(err);
    setHud("加载失败：请看控制台错误。");
  } finally {
    fileInput.value = "";
  }
});

loadDemoBtn.addEventListener("click", () => {
  loadBuildingDemo();
});

loadUrlBtn.addEventListener("click", async () => {
  try {
    await app.loadGLBUrl("/models/demo.glb");
    detailsUI.clear();
    sideTabs.setActive("analysis");
    setHud("已请求：/models/demo.glb（若 404，请将文件放到 public/models/demo.glb）");
  } catch (err) {
    console.error(err);
    setHud("加载失败：可能是 /models/demo.glb 不存在，或网络/解码器问题。");
  }
});

resetBtn.addEventListener("click", () => {
  app.resetView();
  setHud("已重置视角。");
});

window.addEventListener("beforeunload", () => {
  app.dispose();
});
