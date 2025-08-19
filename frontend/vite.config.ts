import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8081,
    hmr: {
      port: 8081,
      host: "0.0.0.0"
    },
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "50180dd1-6bc9-48b4-afe1-083b2f3b9f96-00-qtmgnn85pjg4.pike.replit.dev", // Replit domain
    ],
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
