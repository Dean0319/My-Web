// 分析面板数据源（卡片模式）
// 每个分类由 cards 组成，renderAnalysis.js 会按卡片渲染。

import { ppt0305ImageMap } from "./ppt0305ImageMap.js";
import { publicUrl } from "../utils/publicUrl.js";

function imagesFor(topicId) {
  return ppt0305ImageMap.filter((x) => x.topicId === topicId);
}

const historyWordImages = {
  timeline: [
    { src: publicUrl("showcase/word-prompts/image1.png"), alt: "历史沿革 图示" },
  ],
  heritage: [
    { src: publicUrl("showcase/word-prompts/image2.png"), alt: "遗产分布 图示" },
    
  ],
  morphology: [
    { src: publicUrl("showcase/word-prompts/image3.jpeg"), alt: "格局演变 图示" },
    { src: publicUrl("showcase/word-prompts/image4.png"), alt: "遗产分布 补充图示" },
  ],
};

export const analysisCategories = [
  {
    id: "history",
    label: "历史与遗产",
    summary: "说明‘如何演变、有哪些遗产、保护更新怎么平衡’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "历史沿革",
            subtitle: "关键时期与事件",
            text: "以时间轴组织街区历史沿革，提炼关键转折。",
            bullets: ["关键年代", "空间变化", "社会背景"],
            imagesTitle: "参考图示",
            images: historyWordImages.timeline,
          },
          {
            title: "遗产分布",
            subtitle: "重要资产与节点现状",
            text: "分析历史建筑、文化遗产与功能节点在区域内的空间分布，用标注与照片说明关联关系。",
            bullets: ["遗产名称、类型、特征", "建筑与遗产的空间（路径）关系", "地图上清晰标注"],
            imagesTitle: "参考图示",
            images: historyWordImages.heritage,
          },
          {
            title: "格局演变",
            subtitle: "肌理与边界变化",
            text: "分析街巷肌理、滨水边界和节点空间在不同阶段的变化。",
            bullets: ["街巷骨架", "边界变化", "节点变迁"],
            imagesTitle: "参考图示",
            images: historyWordImages.morphology,
          },
        ],
      },
    ],
  },

  
  {
    id: "transport",
    label: "交通与慢行",
    summary: "说明‘怎么到、怎么走、哪里堵、怎么改’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "道路与交通系统",
            subtitle: "现状问题识别",
            text: "在同一底图上叠加道路等级、公交、停车和慢行路径，定位冲突点。",
            bullets: ["车行道路", "人行道路"],
            imagesTitle: "参考图示",
            images: imagesFor("transport").filter((x) => x.src.endsWith("image5.jpeg")),
          },
          {
            title: "公共交通可达性",
            subtitle: "人群差异分析",
            text: "说明游客、居民、老年群体在到达方式上的差异和痛点。",
            bullets: ["站点步行距离", "换乘关系", "不可达区域"],
            imagesTitle: "参考图示",
            images: imagesFor("transport").filter((x) => x.src.endsWith("image6.png")),
          },
          {
            title: "慢行游线",
            subtitle: "体验路径优化",
            text: "结合游线与界面观察，提出停留节点、无障碍和界面优化策略。",
            bullets: ["游线连续性", "节点停留", "无障碍坡度"],
            imagesTitle: "参考图示",
            images: imagesFor("transport").filter((x) => x.src.endsWith("image7.png")),
          },
        ],
      },
    ],
  },

  {
    id: "openspace",
    label: "开敞空间系统",
    summary: "先讲清楚‘在哪里、边界是什么、与周边如何联系’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "开敞空间类型与分布",
            subtitle: "功能种类与分布",
            text: "用不同的颜色表示各区域用地性质，如公园绿地、广场用地、商住混合用地等",
            bullets: ["用地性质", "颜色区分"],
            imagesTitle: "参考图示",
            images: imagesFor("openspace").filter((x) => x.src.endsWith("image10.png")),
          },
          {
            title: "节点-连线-圈层",
            subtitle: "空间结构表达",
            text: "通过节点、连线与步行半径表达空间组织和可达性。",
            bullets: ["入口节点", "关键停留点", "视线通廊"],
            imagesTitle: "参考图示",
            images: imagesFor("openspace").filter((x) => x.src.endsWith("image8.png")),
          },
          {
            title: "总体策略",
            subtitle: "结构与功能协同",
            text: "从空间结构、功能布局和交通组织三方面总结总体策略。",
            bullets: ["空间结构", "功能组织", "慢行优先"],
            imagesTitle: "参考图示",
            images: imagesFor("openspace").filter((x) => x.src.endsWith("image9.png")),
          },
        ],
      },
    ],
  },

  {
    id: "function",
    label: "功能系统",
    summary: "先讲清楚‘在哪里、边界是什么、与周边如何联系’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "开敞空间类型与分布",
            subtitle: "功能种类与分布",
            text: "用不同的颜色表示各区域用地性质，如公园绿地、广场用地、商住混合用地等",
            bullets: ["用地性质", "颜色区分"],
            imagesTitle: "参考图示",
            images: imagesFor("function").filter((x) => x.src.endsWith("image10.png")),
          },
          {
            title: "节点-连线-圈层",
            subtitle: "空间结构表达",
            text: "通过节点、连线与步行半径表达空间组织和可达性。",
            bullets: ["入口节点", "关键停留点", "视线通廊"],
            imagesTitle: "参考图示",
            images: imagesFor("function").filter((x) => x.src.endsWith("image8.png")),
          },
          {
            title: "总体策略",
            subtitle: "结构与功能协同",
            text: "从空间结构、功能布局和交通组织三方面总结总体策略。",
            bullets: ["空间结构", "功能组织", "慢行优先"],
            imagesTitle: "参考图示",
            images: imagesFor("openspace").filter((x) => x.src.endsWith("image9.png")),
          },
        ],
      },
    ],
  },

   {
    id: "function",
    label: "建筑系统",
    summary: "先讲清楚‘在哪里、边界是什么、与周边如何联系’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "开敞空间类型与分布",
            subtitle: "功能种类与分布",
            text: "用不同的颜色表示各区域用地性质，如公园绿地、广场用地、商住混合用地等",
            bullets: ["用地性质", "颜色区分"],
            imagesTitle: "参考图示",
            images: imagesFor("function").filter((x) => x.src.endsWith("image10.png")),
          },
          {
            title: "节点-连线-圈层",
            subtitle: "空间结构表达",
            text: "通过节点、连线与步行半径表达空间组织和可达性。",
            bullets: ["入口节点", "关键停留点", "视线通廊"],
            imagesTitle: "参考图示",
            images: imagesFor("function").filter((x) => x.src.endsWith("image8.png")),
          },
          {
            title: "总体策略",
            subtitle: "结构与功能协同",
            text: "从空间结构、功能布局和交通组织三方面总结总体策略。",
            bullets: ["空间结构", "功能组织", "慢行优先"],
            imagesTitle: "参考图示",
            images: imagesFor("openspace").filter((x) => x.src.endsWith("image9.png")),
          },
        ],
      },
    ],
  },

  {
    id: "function",
    label: "场所活力",
    summary: "先讲清楚‘在哪里、边界是什么、与周边如何联系’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "开敞空间类型与分布",
            subtitle: "功能种类与分布",
            text: "用不同的颜色表示各区域用地性质，如公园绿地、广场用地、商住混合用地等",
            bullets: ["用地性质", "颜色区分"],
            imagesTitle: "参考图示",
            images: imagesFor("function").filter((x) => x.src.endsWith("image10.png")),
          },
          {
            title: "节点-连线-圈层",
            subtitle: "空间结构表达",
            text: "通过节点、连线与步行半径表达空间组织和可达性。",
            bullets: ["入口节点", "关键停留点", "视线通廊"],
            imagesTitle: "参考图示",
            images: imagesFor("function").filter((x) => x.src.endsWith("image8.png")),
          },
          {
            title: "总体策略",
            subtitle: "结构与功能协同",
            text: "从空间结构、功能布局和交通组织三方面总结总体策略。",
            bullets: ["空间结构", "功能组织", "慢行优先"],
            imagesTitle: "参考图示",
            images: imagesFor("openspace").filter((x) => x.src.endsWith("image9.png")),
          },
        ],
      },
    ],
  },
  
];