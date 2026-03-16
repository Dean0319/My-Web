// 将 `public/` 下的静态资源路径拼接为“可部署”的 URL。
//
// 为什么需要它：
// - 本地开发时资源根路径通常是 `/`。
// - 部署到 GitHub Pages（仓库子路径）或 Vite 配了 `base` 时，资源根路径会变成 `/repo/` 或 `./`。
// - 因此不要在代码里写死以 `/` 开头的绝对路径（例如 `/showcase/...`），否则在子路径部署会 404。
export function publicUrl(path) {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalized = String(path ?? "").replace(/^\/+/, "");
  return `${base}${normalized}`;
}