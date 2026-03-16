// 分析面板的数据源（可扩展）。
//
// 扩展方式（给未来的你/学生）：
// 1) 在 categories 数组里新增一个对象：{ id, label, summary, sections }
// 2) UI 会自动生成一个新的 Tab，并渲染 sections。
// 3) 如需新的 section 类型：到 src/ui/renderAnalysis.js 里新增一个渲染分支。

import { ppt0305ImageMap } from "./ppt0305ImageMap.js";

function imagesFor(topicId) {
  return ppt0305ImageMap.filter((x) => x.topicId === topicId);
}

export const analysisCategories = [
  {
    id: "location",
    label: "区位与结构",
    summary: "面向历史街区：先讲清楚‘在哪、为什么在这、与谁相连’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "一句话定位",
            text: "用 1 句话说明：历史街区在城市中的角色（文旅节点/生活片区/滨水门户…），以及研究边界。",
            bullets: ["研究范围与缓冲区", "城市主轴/边界关系", "与周边重要节点的联系"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("location").filter((x) => x.src.endsWith("image17.jpeg")),
          },
          {
            title: "节点-连线-圈层",
            text: "用‘节点照片 + 连线 + 步行半径’表达空间认知，强调路径体验与视线落点。",
            bullets: ["入口节点与到达方式", "关键节点与停留空间", "视线通廊/地标"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("location").filter((x) => x.src.endsWith("image1.png")),
          },
          {
            title: "总体策略（可选）",
            text: "如果你的方案需要‘导则/策略’，可以用多张小图快速归纳空间、交通、功能的协同逻辑。",
            bullets: ["空间结构（主街/支巷/节点）", "功能聚集与分散", "交通优先级（慢行优先）"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("location").filter((x) => x.src.endsWith("image9.png")),
          },
        ],
      },
    ],
  },

  {
    id: "transport",
    label: "交通与慢行",
    summary: "说明‘怎么到、怎么走、走得舒不舒服’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "道路与交通系统",
            text: "建议把：道路等级、公交站点、停车、慢行系统放在一套底图上，并明确矛盾点。",
            bullets: ["车行占用公共空间？", "慢行是否连续？", "公交可达性是否合理？"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("transport").filter((x) => x.src.endsWith("image5.jpeg")),
          },
          {
            title: "公共交通可达性（示例）",
            text: "用箭头与注释，把‘出行方式/人群特征/公交不可达’等信息说明白。",
            bullets: ["站点位置与步行距离", "人群差异（游客/居民/老年人）", "冲突点与优化节点"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("transport").filter((x) => x.src.endsWith("image6.png")),
          },
          {
            title: "分图表达（步行/公交/车行/骑行）",
            text: "把不同出行方式分图表达，再汇总到‘长期交通策略’里。",
            bullets: ["步行优先片区", "服务车/货运时段", "骑行网络与停放"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("transport").filter((x) => x.src.endsWith("image7.png")),
          },
          {
            title: "慢行游线与界面观察",
            text: "把‘游线’与沿途空间片段结合：照片、剖面、界面节奏，让观众理解‘走的体验’。",
            bullets: ["停留点与视线变化", "界面连续性与开敞点", "无障碍与坡度"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("transport").filter((x) => x.src.endsWith("image16.jpeg")),
          },
        ],
      },
    ],
  },

  {
    id: "history",
    label: "历史与遗产",
    summary: "说明‘曾经是什么、如何变化、哪些必须保护’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "时间轴：事件—空间—政策",
            text: "用时间轴组织关键事件、产业更替、空间格局变化，并标出遗产与重要节点。",
            bullets: ["关键年代与事件", "产业/人群变化", "空间格局变化"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("history").filter((x) => x.src.endsWith("image2.png")),
          },
          {
            title: "形态演变：格局变迁",
            text: "用‘阶段-形态-照片/注释’讲清楚街巷骨架、滨水界面、节点空间如何演化。",
            bullets: ["街巷骨架", "滨水/山体边界", "重要节点的出现/消失"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("history").filter((x) => x.src.endsWith("image3.png")),
          },
          {
            title: "保护与更新：底图叠加",
            text: "把保护要点（格局、建筑、界面、视线）叠加在同一张底图上，形成清晰导则。",
            bullets: ["可保护结构", "可更新区域", "关键风貌控制"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("history").filter((x) => x.src.endsWith("image4.jpeg")),
          },
        ],
      },
    ],
  },

  {
    id: "open-space",
    label: "开敞空间",
    summary: "说明‘能不能停、停在哪、缺什么公共空间’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "公共绿地覆盖与连通",
            text: "用距离/半径表达绿地覆盖与短板，说明‘缺核心公共场所’或‘空间断裂点’。",
            bullets: ["覆盖半径（300m/500m）", "空间断裂点", "潜在整合区域"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("open-space"),
          },
        ],
      },
    ],
  },

  {
    id: "function",
    label: "功能与用地",
    summary: "说明‘做什么、服务谁、哪些功能空缺’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "功能分区与结构",
            text: "用颜色分区表达功能结构，并用文字补充：服务对象、服务时段与活动对比。",
            bullets: ["功能是否单一", "是否存在低效空间", "是否缺乏文化公共功能"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("function"),
          },
        ],
      },
    ],
  },

  {
    id: "building",
    label: "建筑与风貌",
    summary: "说明‘留什么、改什么、更新到什么程度’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "分级评价：层数 / 质量 / 年代",
            text: "用分级评价支撑判断：保留 / 改造 / 更新，并与街道界面一起讲。",
            bullets: ["风貌是否混乱", "是否有高质量保留建筑", "建筑组织模式特征"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("building").filter((x) => x.src.endsWith("image13.jpeg")),
          },
          {
            title: "天际线与界面控制",
            text: "用剖面/天际线说明沿街界面与门户节点的高度控制与视线关系。",
            bullets: ["节点高度控制", "沿街界面连续性", "关键视线与地标"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("building").filter((x) => x.src.endsWith("image14.jpeg")),
          },
        ],
      },
    ],
  },

  {
    id: "vitality",
    label: "活力与人群",
    summary: "说明‘谁在用、什么时候用、空间怎么回应’。",
    sections: [
      {
        type: "cards",
        cards: [
          {
            title: "人群—时间—空间需求",
            text: "用时间轴把不同人群的活动规律画出来，并对应到‘需要哪些公共空间类型’。",
            bullets: ["工作日/周末差异", "不同年龄段需求", "活动热点与断裂点"],
            imagesTitle: "参考图示（PPT 摘录）",
            images: imagesFor("vitality"),
          },
        ],
      },
    ],
  },

  {
    id: "materials",
    label: "素材库",
    summary: "所有可用的 PPT 素材图（已剔除含个人信息的图片），点击可在新标签页打开。",
    sections: [
      {
        type: "gallery",
        title: "PPT 内嵌媒体（已筛选）",
        note: "我已删除 2 张包含姓名/学号等个人信息的图片（不会被网页公开访问）。其余图片仍建议你快速浏览确认后再用于公开展示。",
        collapsible: false,
        images: ppt0305ImageMap,
      },
    ],
  },
];
