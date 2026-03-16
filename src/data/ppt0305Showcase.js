// 从 `0305城市研究阶段调研PPT模板(1).pptx` 提取的“非个人信息”内容（已做基础脱敏/筛选）。
//
// 安全策略：
// - 跳过含“姓名/学号/学院/指导老师”等字段的封面/致谢页
// - 只保留“调研框架与方法”类内容
// - 图片为 PPT 内嵌媒体资源（非整页截图）；仍建议人工检查是否包含个人信息

import { ppt0305Media } from "./ppt0305Media.js";

export const ppt0305Showcase = {
  title: "城市研究阶段调研：框架模板（摘录）",
  sourceNote: "来源：0305城市研究阶段调研PPT模板(1).pptx（已筛掉可能包含个人信息的页面）",

  // 结构化要点：用于渲染为 cards，后续可继续补充为你自己的调研内容。
  systems: [
    {
      id: "history_system",
      label: "历史系统",
      pages: [
        {
          title: "历史沿革与格局演变（现状分析）",
          diagramSuggestions: ["历史沿革", "平面格局变迁", "文化遗产分布图"],
        },
        {
          title: "历史价值总结（问题/价值判断）",
          analysisSuggestions: ["保留较完整的街巷肌理", "受破坏区域", "重要文化遗存价值判断"],
          outputSuggestions: ["可保护结构", "可更新区域", "历史空间特征关键词"],
        },
      ],
    },
    {
      id: "transport_system",
      label: "交通系统",
      pages: [
        {
          title: "交通现状分析",
          diagramSuggestions: ["交通分析图（道路等级、停车设施、慢行交通、公共交通等）"],
        },
        {
          title: "交通问题总结",
          analysisSuggestions: ["是否车行占用公共空间", "慢行系统是否连续", "公交可达性是否合理"],
          outputSuggestions: ["交通冲突点", "可优化节点"],
        },
      ],
    },
    {
      id: "open_space_system",
      label: "开敞空间系统",
      pages: [
        {
          title: "开敞空间现状",
          diagramSuggestions: ["开敞空间分布图（公园、广场、绿地等）"],
        },
        {
          title: "开敞空间问题",
          analysisSuggestions: ["是否形成系统网络", "是否碎片化", "是否缺乏核心公共场所"],
          outputSuggestions: ["空间断裂点", "潜在整合区域"],
        },
      ],
    },
    {
      id: "function_system",
      label: "功能系统",
      pages: [
        {
          title: "功能布局分析",
          diagramSuggestions: ["功能分布图", "服务对象与服务时段", "活动对比图"],
        },
        {
          title: "功能问题总结",
          analysisSuggestions: ["是否功能单一", "是否存在低效空间", "是否缺乏文化公共功能"],
          outputSuggestions: ["功能空缺", "潜在植入点"],
        },
      ],
    },
    {
      id: "building_system",
      label: "建筑系统",
      pages: [
        {
          title: "建筑现状分析",
          diagramSuggestions: ["建筑高度图", "建筑品质分级图", "街道界面图"],
        },
        {
          title: "建筑问题总结",
          analysisSuggestions: ["风貌是否混乱", "是否有高质量保留建筑", "建筑组织模式特征"],
          outputSuggestions: ["保留 / 改造 / 更新判断"],
        },
      ],
    },
    {
      id: "vitality",
      label: "场所活力",
      pages: [
        {
          title: "场所活力现状",
          diagramSuggestions: ["人流追踪图 / 停留热点图", "典型空间照片分析"],
        },
        {
          title: "场所问题总结",
          analysisSuggestions: ["活力来源", "活力断裂点", "是否存在空心区域"],
          outputSuggestions: ["潜力激活点"],
        },
      ],
    },
  ],

  media: ppt0305Media,
};
