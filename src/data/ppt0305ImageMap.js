// PPT 素材图（已去除含个人信息的图片）按主题的归类。
//
// 约定：topicId 对应 analysisCategories 的 id（便于渲染时自动插入）。
// 未来新增图片：只要补这里的映射，UI 就会自动跟随。

import { publicUrl } from "../utils/publicUrl.js";

export const ppt0305ImageMap = [

   // 历史与遗产
  {
    src: publicUrl("showcase/ppt-0305/image2.png"),
    alt: "历史沿革时间轴（示例）",
    topicId: "history",
    caption: "用时间轴组织关键事件/政策/空间变化",
  },
  {
    src: publicUrl("showcase/ppt-0305/image3.png"),
    alt: "形态演变（示例）",
    topicId: "history",
    caption: "用‘阶段-形态-照片’讲清楚格局变迁",
  },
  {
    src: publicUrl("showcase/ppt-0305/image4.jpeg"),
    alt: "风貌保护与街巷格局（示例）",
    topicId: "history",
    caption: "把街巷骨架与保护要点叠加到同一底图",
  },

    // 交通与慢行
  {
    src: publicUrl("showcase/ppt-0305/image5.jpeg"),
    alt: "道路交通系统规划（示例）",
    topicId: "transport",
    caption: "道路等级、慢行、公交、停车的综合表达",
  },
  {
    src: publicUrl("showcase/ppt-0305/image6.png"),
    alt: "道路与交通组成分析（示例）",
    topicId: "transport",
    caption: "用箭头 + 注释说明出行方式与可达性问题",
  },
  {
    src: publicUrl("showcase/ppt-0305/image7.png"),
    alt: "交通策略分图（示例）",
    topicId: "transport",
    caption: "步行/公交/机动车/骑行分别成图，最后汇总策略",
  },
  {
    src: publicUrl("showcase/ppt-0305/image16.jpeg"),
    alt: "慢行游线与界面观察（示例）",
    topicId: "transport",
    caption: "用游线 + 视线/界面剖析强化‘走的体验’",
  },

  
  // 开敞空间系统（示例：节点-连线、密度、周边用地、总体策略）
  {
    src: publicUrl("showcase/ppt-0305/image10.png"),
    alt: "场地与节点连线（示例）",
    topicId: "openspace",
    caption: "区位关系/节点串联的图示表达方式",
  },
  {
    src: publicUrl("showcase/ppt-0305/image8.png"),
    alt: "人群密度、周边用地、交通（示例）",
    topicId: "openspace",
    caption: "用‘密度圈层 + 周边功能泡泡 + 道路结构’讲清楚区位",
  },
  {
    src: publicUrl("showcase/ppt-0305/image9.png"),
    alt: "空间策略/站城理念（示例）",
    topicId: "openspace",
    caption: "用多张小图归纳‘总体策略/导则’（如：空间、功能、交通协同）",
  },



  // 功能系统
  {
    src: publicUrl("showcase/ppt-0305/image18.png"),
    alt: "周边公共绿地与连通（示例）",
    topicId: "function",
    caption: "用距离/半径表达公共绿地覆盖与短板",
  },

  // 功能与用地
  {
    src: publicUrl("showcase/ppt-0305/image10.png"),
    alt: "用地布局/功能分区（示例）",
    topicId: "function",
    caption: "用颜色分区说明业态/公共服务/绿地等功能结构",
  },

  // 建筑与风貌
  {
    src: publicUrl("showcase/ppt-0305/image13.jpeg"),
    alt: "建筑层数/质量/年代评价（示例）",
    topicId: "building",
    caption: "用分级评价支持‘保留/更新/改造’判断",
  },
  {
    src: publicUrl("showcase/ppt-0305/image14.jpeg"),
    alt: "天际线与界面（示例）",
    topicId: "building",
    caption: "用剖面/天际线表达沿街界面与节点控制",
  },

  // 活力与人群
  {
    src: publicUrl("showcase/ppt-0305/image12.jpeg"),
    alt: "人群与活动时段需求（示例）",
    topicId: "vitality",
    caption: "用时间轴说明不同人群在不同时间段的空间需求",
  },
];