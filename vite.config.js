import { resolve } from "node:path";
import { defineConfig } from "vite";
import stripComments from "vite-plugin-strip-comments";

export default defineConfig({
  plugins: [stripComments({ type: "none" })],
  build: {
    sourcemap: true,
    lib: {
      entry: {
        emitter: resolve(__dirname, "src/emitter.ts"),
      },
      name: "Emitter",
      formats: ["cjs", "es"],
    },
  },
});
