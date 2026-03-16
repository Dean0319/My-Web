import { clearElement, el } from "./dom.js";

function renderMediaGrid(items) {
  const grid = el("div", { class: "gallery-grid" });
  for (const it of items) {
    grid.appendChild(
      el("figure", { class: "gallery-fig" }, [
        el("a", { class: "gallery-item", href: it.src, target: "_blank", rel: "noreferrer" }, [
          el("img", { src: it.src, alt: it.alt || "image", loading: "lazy" }),
        ]),
        it.caption ? el("figcaption", { class: "gallery-cap" }, it.caption) : null,
      ])
    );
  }
  return grid;
}

function renderCards(mount, cards) {
  const stack = el("div", { class: "stack" });
  for (const c of cards) {
    const card = el("div", { class: "panel-card" }, [
      el("div", { class: "h" }, c.title),
      c.subtitle ? el("div", { class: "sh" }, c.subtitle) : null,
      c.text ? el("p", { class: "p" }, c.text) : null,
      Array.isArray(c.bullets) && c.bullets.length
        ? el(
            "ul",
            {},
            c.bullets.map((b) => el("li", {}, b))
          )
        : null,
      // 文字在上、图片在下：图片区域永远放在卡片末尾
      Array.isArray(c.images) && c.images.length
        ? el("div", { class: "gallery-inline" }, [
            c.imagesTitle ? el("div", { class: "muted" }, c.imagesTitle) : null,
            renderMediaGrid(c.images),
          ])
        : null,
    ]);
    stack.appendChild(card);
  }
  mount.appendChild(stack);
}

function renderTimeline(mount, { title, items }) {
  if (title) mount.appendChild(el("div", { class: "panel-card" }, [el("div", { class: "h" }, title)]));

  const list = el("div", { class: "timeline" });
  for (const it of items) {
    list.appendChild(
      el("div", { class: "tl-item" }, [
        el("div", { class: "tl-time" }, it.time),
        el("div", { class: "tl-body" }, it.text),
      ])
    );
  }
  mount.appendChild(list);
}

function renderGallery(mount, { title, note, collapsible = false, images = [] }) {
  const inner = el("div", { class: "stack" }, [
    title ? el("div", { class: "panel-card" }, [el("div", { class: "h" }, title)]) : null,
    note ? el("div", { class: "panel-card" }, [el("p", { class: "p" }, note)]) : null,
    images.length
      ? el("div", { class: "panel-card" }, [el("div", { class: "h" }, "图集"), renderMediaGrid(images)])
      : el("div", { class: "panel-card" }, [el("div", { class: "h" }, "图集"), el("p", { class: "p" }, "（暂无图片）")]),
  ]);

  if (!collapsible) {
    mount.appendChild(inner);
    return;
  }

  mount.appendChild(
    el("details", { class: "gallery-details" }, [
      el("summary", { class: "gallery-summary" }, "展开/收起图集"),
      inner,
    ])
  );
}

// 渲染“分析”面板（可扩展 Tab）。
// categories: [{ id, label, summary, sections }]
export function renderAnalysis({ mount, categories, initialId, onSelectCategory }) {
  clearElement(mount);

  const state = {
    activeId: initialId || categories?.[0]?.id,
  };

  const root = el("div", { class: "tabs" });
  const tablist = el("div", { class: "tablist", role: "tablist" });
  const content = el("div", { class: "stack" });

  function setActive(id) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    state.activeId = id;

    // 更新 Tab 状态
    for (const btn of tablist.querySelectorAll("button[role=tab]")) {
      const selected = btn.dataset.id === id;
      btn.setAttribute("aria-selected", selected ? "true" : "false");
      btn.tabIndex = selected ? 0 : -1;
    }

    // 更新内容
    clearElement(content);
    content.appendChild(el("div", { class: "muted" }, cat.summary || ""));

    for (const section of cat.sections || []) {
      if (section.type === "cards") {
        renderCards(content, section.cards || []);
        continue;
      }
      if (section.type === "timeline") {
        renderTimeline(content, section);
        continue;
      }
      if (section.type === "gallery") {
        renderGallery(content, section);
        continue;
      }

      // 未来扩展：新增 section.type 时在此追加分支
      content.appendChild(
        el("div", { class: "panel-card" }, [
          el("div", { class: "h" }, `未支持的 section.type：${section.type}`),
          el("p", { class: "p" }, "请在 src/ui/renderAnalysis.js 中补充渲染逻辑。"),
        ])
      );
    }

    onSelectCategory?.(cat);
  }

  for (const c of categories) {
    tablist.appendChild(
      el(
        "button",
        {
          type: "button",
          class: "tab",
          role: "tab",
          "aria-selected": c.id === state.activeId ? "true" : "false",
          tabindex: c.id === state.activeId ? 0 : -1,
          "data-id": c.id,
          onclick: () => setActive(c.id),
        },
        c.label
      )
    );
  }

  root.appendChild(tablist);
  root.appendChild(content);
  mount.appendChild(root);

  // 首次渲染
  if (state.activeId) setActive(state.activeId);

  return {
    setActive,
    getActiveId: () => state.activeId,
  };
}