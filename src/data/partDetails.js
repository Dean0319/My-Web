// 部件“详细介绍”的数据源。
//
// 支持两种匹配方式：
// 1) demo：通过 partId（src/demo 下的示例模型使用）
// 2) glb：通过 mesh.name（学生导出的 glb 通常每个 Mesh 都有名字）
//
// 扩展方式：
// - demo：在 demoPartDetails 里加条目（key = partId）
// - glb：在 detailsByMeshName 里加条目（key = 模型里网格的 name）

export const demoPartDetails = {
  // 建筑（可点击部件）
  bldg_facade: {
    title: "建筑立面",
    subtitle: "风貌与界面",
    description: "立面可展示：开窗比例、材料与色彩、沿街界面治理策略（招牌/雨棚/灯光）。",
    tags: ["立面", "风貌", "材料"],
    relatedAnalysis: ["history"],
  },
  bldg_roof: {
    title: "屋顶",
    subtitle: "构造与天际线",
    description: "屋顶可展示：坡屋面形式、瓦作构造、排水方式，以及街区整体天际线控制。",
    tags: ["屋顶", "构造", "天际线"],
    relatedAnalysis: ["history"],
  },
  bldg_door: {
    title: "入口门洞",
    subtitle: "到达感与识别",
    description: "入口部件适合放：门头设计、导视系统、消防与无障碍的兼顾策略。",
    tags: ["入口", "导视", "无障碍"],
    relatedAnalysis: ["location", "transport"],
  },
  bldg_sign: {
    title: "招牌",
    subtitle: "业态与秩序",
    description: "招牌可展示：业态策略、字号与统一规范（材质/尺寸/照明），以及夜景氛围。",
    tags: ["业态", "招牌", "夜景"],
    relatedAnalysis: ["transport", "history"],
  },

  // 窗户（示例给一个通用模板；你也可以为每扇窗分别写）
  bldg_window_L1: {
    title: "窗户",
    subtitle: "采光与尺度",
    description: "窗户可展示：开窗尺度、室内外关系、栏杆/窗花等历史元素的保留与再设计。",
    tags: ["窗", "尺度", "元素"],
    relatedAnalysis: ["history"],
  },
  bldg_window_R1: {
    title: "窗户",
    subtitle: "采光与尺度",
    description: "窗户可展示：开窗尺度、室内外关系、栏杆/窗花等历史元素的保留与再设计。",
    tags: ["窗", "尺度", "元素"],
    relatedAnalysis: ["history"],
  },
  bldg_window_L2: {
    title: "窗户",
    subtitle: "采光与尺度",
    description: "窗户可展示：开窗尺度、室内外关系、栏杆/窗花等历史元素的保留与再设计。",
    tags: ["窗", "尺度", "元素"],
    relatedAnalysis: ["history"],
  },
  bldg_window_R2: {
    title: "窗户",
    subtitle: "采光与尺度",
    description: "窗户可展示：开窗尺度、室内外关系、栏杆/窗花等历史元素的保留与再设计。",
    tags: ["窗", "尺度", "元素"],
    relatedAnalysis: ["history"],
  },

  // 环境（可点击）
  env_plaza: {
    title: "铺装广场",
    subtitle: "停留与活动",
    description: "铺装可以用来展示：人群活动、节点空间、雨水/排水组织与材料耐久性。",
    tags: ["铺装", "活动", "节点"],
    relatedAnalysis: ["transport"],
  },
  env_road: {
    title: "道路",
    subtitle: "人车组织",
    description: "道路可展示：慢行优先、车行边界、停车组织，以及游客与居民的动线差异。",
    tags: ["道路", "慢行", "停车"],
    relatedAnalysis: ["transport"],
  },
  env_wall: {
    title: "巷道界面",
    subtitle: "转角与尺度",
    description: "巷道界面适合放：转角视线、巷道宽度、照明与小微空间的停留策略。",
    tags: ["巷道", "转角", "尺度"],
    relatedAnalysis: ["transport"],
  },

  env_lamp_1: {
    title: "路灯",
    subtitle: "夜景与安全",
    description: "路灯可展示：夜景照明、色温控制、眩光与安全性，以及历史街区的氛围营造。",
    tags: ["照明", "夜景", "安全"],
    relatedAnalysis: ["history"],
  },
  env_lamp_2: {
    title: "路灯",
    subtitle: "夜景与安全",
    description: "路灯可展示：夜景照明、色温控制、眩光与安全性，以及历史街区的氛围营造。",
    tags: ["照明", "夜景", "安全"],
    relatedAnalysis: ["history"],
  },

  env_tree_1: {
    title: "行道树",
    subtitle: "遮荫与微气候",
    description: "行道树可展示：夏季遮荫、雨洪调蓄、街道尺度感与视线遮挡的平衡。",
    tags: ["绿化", "微气候", "街道"],
    relatedAnalysis: ["location"],
  },
  env_tree_2: {
    title: "行道树",
    subtitle: "遮荫与微气候",
    description: "行道树可展示：夏季遮荫、雨洪调蓄、街道尺度感与视线遮挡的平衡。",
    tags: ["绿化", "微气候", "街道"],
    relatedAnalysis: ["location"],
  },
  env_tree_3: {
    title: "行道树",
    subtitle: "遮荫与微气候",
    description: "行道树可展示：夏季遮荫、雨洪调蓄、街道尺度感与视线遮挡的平衡。",
    tags: ["绿化", "微气候", "街道"],
    relatedAnalysis: ["location"],
  },
  env_tree_4: {
    title: "行道树",
    subtitle: "遮荫与微气候",
    description: "行道树可展示：夏季遮荫、雨洪调蓄、街道尺度感与视线遮挡的平衡。",
    tags: ["绿化", "微气候", "街道"],
    relatedAnalysis: ["location"],
  },
};

export const detailsByMeshName = {
  // 示例：把你的 glb 里某个 Mesh 命名为 "Gate"，这里就能配一段介绍。
  // Gate: {
  //   title: "入口门楼",
  //   subtitle: "第一印象",
  //   description: "...",
  //   tags: ["入口"],
  //   relatedAnalysis: ["location"],
  // },
};
