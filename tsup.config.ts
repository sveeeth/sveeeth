import { defineConfig } from "tsup";

import { dependencies } from "./package.json";

export default defineConfig({
  bundle: true,
  clean: true,
  dts: true,
  format: "esm",
  splitting: true,
  target: "es2021",
  entry: ["src/index.ts", "src/connectors.ts", "src/chains.ts", "src/providers.ts", "src/utils.ts"],
  external: Object.keys(dependencies),
});
