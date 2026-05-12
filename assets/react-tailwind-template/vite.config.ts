import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/*
 * Vite 配置只负责连接 React 与 Tailwind v4 插件，业务代码保持在 src 目录内。
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
