import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: {
        emitter: resolve(__dirname, "src/emitter.ts"),
      },
      name: "Emitter",
      formats: ["es"],
    },
  },
});
