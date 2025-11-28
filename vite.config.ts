import reboltOverlay from "@rebolt-ai/vite-plugin-overlay";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // @ts-ignore
    ...(process.env.NODE_ENV === "development" ? [reboltOverlay()] : []),
  ],
  resolve: {
    alias: {
      "@/convex": path.resolve(__dirname, "convex"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  envDir: path.resolve(__dirname),
  server: {
    port: 8080,
    host: "0.0.0.0",
    allowedHosts: true,
    strictPort: true,
    hmr: {
      overlay: false,
    },
    fs: {
      strict: true,
      allow: [__dirname],
      deny: ["**/.*"],
    },
  },
});
