import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  preflight: false,
  globalCss: {
    body: {
      bg: "#ffffff",
      color: "#4a4a4a",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-heebo), 'Segoe UI', sans-serif" },
        body: { value: "var(--font-heebo), 'Segoe UI', sans-serif" },
      },
      colors: {
        bnb: {
          red: { value: "#a6193c" },
          redDark: { value: "#8a1533" },
          orange: { value: "#f68b1f" },
          gray: { value: "#727c81" },
          border: { value: "#ebebeb" },
        },
      },
    },
  },
});

export const sistema = createSystem(defaultConfig, config);
