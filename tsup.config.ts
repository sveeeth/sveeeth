import { defineConfig } from "tsup";

import { dependencies } from "./package.json";

export default defineConfig({
  entry: ["src/index.ts", "src/connectors.ts", "src/chains.ts", "src/providers.ts"],
  external: Object.keys(dependencies),
  platform: "neutral",
  format: "esm",
  clean: true,
});
