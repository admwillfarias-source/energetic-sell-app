import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Build do app React empacotado como tema WordPress.
// Os assets vão para wp-theme/awr-baterias/assets/ com nomes determinísticos
// para o functions.php enfileirar via wp_enqueue_script/style.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query"],
  },
  base: "/wp-content/themes/awr-baterias/assets/",
  build: {
    outDir: "wp-theme/awr-baterias/assets",
    emptyOutDir: true,
    assetsDir: ".",
    rollupOptions: {
      input: path.resolve(__dirname, "src/wp-entry.tsx"),
      output: {
        entryFileNames: "app.js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (info) => {
          if (info.name?.endsWith(".css")) return "app.css";
          return "media/[name]-[hash][extname]";
        },
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/react-dom/") || id.includes("/react/") || id.includes("react-router"))
            return "react-vendor";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("@radix-ui")) return "ui-radix";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("lucide-react")) return "icons";
        },
      },
    },
  },
});
