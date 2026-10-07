import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  preflight: false,
  globalCss: {
    body: {
      bg: "#E6E7EB",
      color: "#2C3138",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-fraunces), Georgia, serif" },
        body: { value: "var(--font-manrope), 'Segoe UI', sans-serif" },
      },
    },
  },
});

export const sistema = createSystem(defaultConfig, config);
