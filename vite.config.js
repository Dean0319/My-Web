import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages 部署需要设置 base（通常是 /<repo>/）。
  // 本地开发保持 "./" 即可；CI/CD 可通过环境变量 BASE_URL 覆盖。
  base: process.env.BASE_URL || "./",
});
