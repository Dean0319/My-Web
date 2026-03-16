import { clearElement, el } from "./dom.js";

// 渲染“详细介绍”面板。
// setPart(part) 接收：{ title, subtitle, description, tags, relatedAnalysis, debug }
export function renderDetails({ mount, onJumpAnalysis, getAnalysisLabel }) {
  clearElement(mount);

  const state = {
    current: null,
  };

  const empty = el(
    "div",
    { class: "muted" },
    "点击模型的不同部件，在这里展示详细介绍。\n（学生可在 src/data/partDetails.js 中补充内容）"
  );
  mount.appendChild(empty);

  function setPart(part) {
    state.current = part;
    clearElement(mount);

    if (!part) {
      mount.appendChild(empty);
      return;
    }

    mount.appendChild(
      el("div", { class: "panel-card" }, [
        el("div", { class: "h" }, part.title || "未命名部件"),
        part.subtitle ? el("p", { class: "p" }, part.subtitle) : null,
      ])
    );

    mount.appendChild(
      el("div", { class: "panel-card" }, [
        el("div", { class: "h" }, "说明"),
        el("p", { class: "p" }, part.description || "（暂无描述）"),
        Array.isArray(part.tags) && part.tags.length
          ? el(
              "div",
              { class: "links" },
              part.tags.map((t) => el("span", { class: "pill" }, t))
            )
          : null,
      ])
    );

    if (Array.isArray(part.relatedAnalysis) && part.relatedAnalysis.length) {
      const buttons = part.relatedAnalysis.map((id) => {
        const label = getAnalysisLabel?.(id) || id;
        return el(
          "button",
          {
            type: "button",
            class: "linkbtn",
            onclick: () => onJumpAnalysis?.(id),
          },
          `打开：${label}`
        );
      });

      mount.appendChild(
        el("div", { class: "panel-card" }, [
          el("div", { class: "h" }, "关联分析"),
          el("div", { class: "links" }, buttons),
        ])
      );
    }

    if (part.debug?.meshName) {
      mount.appendChild(
        el("div", { class: "panel-card" }, [
          el("div", { class: "h" }, "调试信息（可删）"),
          el("p", { class: "p" }, `mesh.name = ${part.debug.meshName}`),
        ])
      );
    }
  }

  return {
    setPart,
    clear: () => setPart(null),
  };
}
