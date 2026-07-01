import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    globals: true,
    // Playwright'ın e2e/*.spec.ts dosyalarını Vitest'in almasını
    // engelliyoruz — ikisi de "test" global'ını kullanıyor ve
    // birbirine karışırsa anlaşılması zor hatalara yol açar.
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
