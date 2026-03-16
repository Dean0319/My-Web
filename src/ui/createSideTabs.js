// 侧边栏 Tabs：用于在同一块右侧区域切换“分析/介绍/更多面板”。
//
// 设计目标：
// - 结构简单：纯 DOM 操作，无框架
// - 可扩展：后续新增面板时，只要在 HTML 增加 button + pane 即可

export function createSideTabs({ tablist, panes, initial }) {
  const state = {
    active: initial,
  };

  function setActive(id) {
    if (!panes[id]) return;

    state.active = id;

    for (const btn of tablist.querySelectorAll('button[role="tab"]')) {
      const selected = btn.dataset.pane === id;
      btn.setAttribute("aria-selected", selected ? "true" : "false");
      btn.tabIndex = selected ? 0 : -1;
    }

    for (const [key, pane] of Object.entries(panes)) {
      pane.hidden = key !== id;
    }
  }

  tablist.addEventListener("click", (e) => {
    const btn = e.target?.closest?.('button[role="tab"]');
    if (!btn) return;
    setActive(btn.dataset.pane);
  });

  if (initial) setActive(initial);

  return {
    setActive,
    getActive: () => state.active,
  };
}
