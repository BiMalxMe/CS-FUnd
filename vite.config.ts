import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      util: "util",
    },
  },
  define: {
    global: 'globalThis',
    process: { env: {} },
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'util',
      '@solana/web3.js',
      '@coral-xyz/anchor',
      'bn.js',
      'elliptic'
    ],
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {
          buffer: 'Buffer',
        },
      },
    },
  },
}));
