import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "antd", "@refinedev/core", "@refinedev/antd", "@tanstack/react-query"],
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],
    },
  },
});
