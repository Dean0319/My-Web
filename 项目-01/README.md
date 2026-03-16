# 历史街区成果展示模板（阶段一）

这是一个给学生用的网页模板，用于“充分展示成果”。当前阶段（阶段一）包含：

1) **模型展示**：支持导入 `.glb`（three.js / GLTFLoader）
2) **分析面板（右侧）**：多类别 Tab，可扩展新增分析模块，并可在卡片中插入图片
3) **详细介绍（右侧）**：左键点击模型部件，展示对应介绍（按 `partId` 或 `mesh.name` 映射）

## 启动

在 `F:\vscode\02-网页\项目-01` 打开终端：

```bash
npm install
npm run dev
```

## 导入模型（GLB）

- 页面顶部“导入 .glb”：直接从本地选择文件
- 或把文件放到 `public/models/` 后用 URL 加载（例如 `/models/demo.glb`）

## 点击部件显示介绍

见：`src/data/partDetails.js`

- demo 示例：用 `mesh.userData.partId`
- 你的 glb：推荐用 `mesh.name`（更稳定）

## 操控模式（Rhino-like）

- 右键拖拽：旋转视图
- 中键拖拽：平移视图
- 滚轮：缩放
- 左键单击：选中部件并在右侧显示介绍

（实现位置：`src/three/createViewerApp.js`）
