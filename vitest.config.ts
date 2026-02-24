import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: [
      [
        "default",
        {
          summary: false,
        },
      ],
    ],
    coverage: {
      enabled: false,
    },
    hookTimeout: 4000,
    testTimeout: 4000
  },
});
