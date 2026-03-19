#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open(r'src/data/analysisCategories.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换第一个卡片的标题和内容
content = content.replace(
    '"时间轴：事件—空间—政策"',
    '"历史沿革（Historical Origin）"'
)
content = content.replace(
    '"用时间轴组织关键事件、产业更替、空间格局变化，并标出遗产与重要节点。"',
    '"用时间轴展示关键历史事件、产业变化与空间格局演变，标注重要历史节点。"'
)
content = content.replace(
    '["关键年代与事件", "产业/人群变化", "空间格局变化"]',
    '["关键年代与事件", "产业/人群变化", "空间格局演变"]'
)

# 替换第二个卡片
content = content.replace(
    '"形态演变：格局变迁"',
    '"平面格局变迁（Morphology）"'
)
content = content.replace(
    '"用\'阶段-形态-照片/注释\'讲清楚街巷骨架、滨水界面、节点空间如何演化。"',
    '"用多阶段平面图展示街巷骨架、滨水界面及节点空间的演变过程。"'
)
content = content.replace(
    '["街巷骨架", "滨水/山体边界", "重要节点的出现/消失"]',
    '["街巷空间框架", "滨水与山体边界", "重要节点位置变化"]'
)

# 替换第三个卡片
content = content.replace(
    '"保护与更新：底图叠加"',
    '"文化遗产分布图（Heritage Distribution）"'
)
content = content.replace(
    '"把保护要点（格局、建筑、界面、视线）叠加在同一张底图上，形成清晰导则。"',
    '"将保护建筑、历史风貌区、文化遗迹等要素叠加制图，形成遗产要素分布体系。"'
)
content = content.replace(
    '["可保护结构", "可更新区域", "关键风貌控制"]',
    '["可保护建筑与结构", "文化风貌控制区域", "历史遗迹分布"]'
)

# 更新summary
content = content.replace(
    'summary: "说明\'曾经是什么、如何变化、哪些必须保护\'。"',
    'summary: "展示历史沿革、遗产分布与位置分析。"'
)

with open(r'src/data/analysisCategories.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('✓ 历史与遗产栏目已重组')
