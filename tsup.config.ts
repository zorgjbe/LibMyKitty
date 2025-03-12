import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/libmykitty.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
});
