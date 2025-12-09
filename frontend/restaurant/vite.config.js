// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables .env, .env.development, .env.production, etc.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        // utile si tu utilises des libs qui injectent du JSX automatiquement
        jsxRuntime: "automatic",
      }),
    ],

    server: {
      port: 5176,   // port dédié restaurant
      open: true,
      strictPort: true, // si occupé => erreur plutôt que changer de port

      proxy: {
        /**
         * Proxy API:
         * - VITE_API_TARGET dans .env (ex: http://localhost:3000)
         * - fallback sur localhost:3000
         */
        "/api": {
          target: env.VITE_API_TARGET || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
          // Si ton backend n'a pas /api, décommente:
          // rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },

    preview: {
      // même port que server, pratique en recette
      port: 5176,
      strictPort: true,
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    define: {
      /**
       * Évite les erreurs de libs qui attendent process.env
       * MAIS préfère import.meta.env côté app.
       */
      "process.env": {},
      __APP_ENV__: env.APP_ENV, // exemple: variable custom non "VITE_"
    },

    build: {
      outDir: "dist",
      sourcemap: mode !== "production", // sourcemap seulement hors prod by default
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          /**
           * Code splitting:
           * - vendors séparés
           * - chunks par feature possible
           */
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) return "react-vendor";
              if (id.includes("ethers")) return "web3-vendor";
              if (id.includes("chart.js") || id.includes("react-chartjs-2"))
                return "charts-vendor";
              return "vendor";
            }
          },
        },
      },
    },

    optimizeDeps: {
      /**
       * Pré-bundle pour accélérer le dev server
       * (mets ici les deps lourdes si besoin)
       */
      include: ["react", "react-dom", "react-router-dom"],
    },
  };
});
