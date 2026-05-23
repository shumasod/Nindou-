import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.tsx"],
  format: ["esm"],
  target: "node18",
  banner: { js: "#!/usr/bin/env node" },
  sourcemap: true,
  clean: true,
  external: ["react", "ink"],
});
