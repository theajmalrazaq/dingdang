import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.svg",
        "favicon-32x32.png",
        "favicon-16x16.png",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "maskable-icon-512x512.png",
        "screenshots/desktop.png",
        "screenshots/mobile.png",
      ],
      manifest: {
        id: "/",
        name: "Dingdang | Truth or Dare",
        short_name: "Dingdang",
        description:
          "Dingdang - Real-time Truth or Dare party game with live chat & custom prompts",
        theme_color: "#0B0C0E",
        background_color: "#0B0C0E",
        display: "standalone",
        display_override: ["standalone", "window-controls-overlay", "minimal-ui"],
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        dir: "ltr",
        lang: "en",
        categories: ["games", "entertainment", "social"],
        prefer_related_applications: false,
        related_applications: [],
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Dingdang Gameplay Desktop View",
          },
          {
            src: "/screenshots/mobile.png",
            sizes: "1080x2340",
            type: "image/png",
            form_factor: "narrow",
            label: "Dingdang Gameplay Mobile View",
          },
        ],
        shortcuts: [
          {
            name: "Play Game",
            short_name: "Play",
            description: "Start or join a Truth or Dare game",
            url: "/",
            icons: [
              {
                src: "/pwa-192x192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
          {
            name: "Custom Prompts",
            short_name: "Prompts",
            description: "Access custom prompts",
            url: "/?action=prompts",
            icons: [
              {
                src: "/pwa-192x192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,json}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    port: 3000,
    host: true,
  },
});
