import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Build do widget de busca por veículo, isolado, para uso via shortcode
// [awr_busca_bateria] em qualquer página WordPress.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  base: "/wp-content/themes/awr-baterias/widget/",
  build: {
    outDir: "wp-theme/awr-baterias/widget",
    emptyOutDir: true,
    assetsDir: ".",
    rollupOptions: {
      input: path.resolve(__dirname, "src/widget/main.tsx"),
      output: {
        entryFileNames: "awr-busca.js",
        assetFileNames: (info) =>
          info.name?.endsWith(".css") ? "awr-busca.css" : "[name]-[hash][extname]",
        inlineDynamicImports: true,
      },
    },
  },
});
