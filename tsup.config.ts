import path from "path";
import dedent from "dedent";
import { default as fs } from "fs-extra";
import { defineConfig } from "tsup";

import { dependencies } from "./package.json";

const entry = [
  "src/index.ts",
  "src/connectors.ts",
  "src/chains.ts",
  "src/providers.ts",
  "src/utils.ts",
];

const noExport: string[] = [];

export default defineConfig({
  bundle: true,
  clean: true,
  dts: true,
  format: "esm",
  splitting: true,
  target: "es2021",
  async onSuccess() {
    const exports = await generateExports(entry, noExport);
    await generateProxyPackages(exports);
  },
  entry,
  external: Object.keys(dependencies),
});

type Exports = {
  [key: string]: string | { types?: string; default: string };
};

/**
 * Generate exports from entry files
 */
async function generateExports(entry: string[], noExport?: string[]) {
  const exports: Exports = {};
  for (const file of entry) {
    if (noExport?.includes(file)) continue;
    const extension = path.extname(file);
    const fileWithoutExtension = file.replace(extension, "");
    const name = fileWithoutExtension.replace(/^src\//g, "./").replace(/\/index$/, "");
    const distSourceFile = `${fileWithoutExtension.replace(/^src\//g, "./dist/")}.js`;
    const distTypesFile = `${fileWithoutExtension.replace(/^src\//g, "./dist/")}.d.ts`;
    exports[name] = {
      types: distTypesFile,
      default: distSourceFile,
    };
  }

  exports["./package.json"] = "./package.json";

  const packageJson = await fs.readJSON("package.json");
  packageJson.exports = exports;
  await fs.writeFile("package.json", JSON.stringify(packageJson, null, 2) + "\n");

  return exports;
}

/**
 * Generate proxy packages files for each export
 */
async function generateProxyPackages(exports: Exports) {
  const ignorePaths = [];
  const files = new Set<string>();
  for (const [key, value] of Object.entries(exports)) {
    if (typeof value === "string") continue;
    if (key === ".") continue;
    if (!value.default) continue;
    await fs.ensureDir(key);
    const entrypoint = path.relative(key, value.default);
    const fileExists = await fs.pathExists(value.default);
    if (!fileExists)
      throw new Error(`Proxy package "${key}" entrypoint "${entrypoint}" does not exist.`);

    await fs.outputFile(
      `${key}/package.json`,
      dedent`{
        "type": "module",
        "main": "${entrypoint}"
      }`
    );
    ignorePaths.push(key.replace(/^\.\//g, ""));

    const file = key.replace(/^\.\//g, "").split("/")[0];
    if (!file || files.has(file)) continue;
    files.add(`/${file}`);
  }

  files.add("/dist");
  const packageJson = await fs.readJSON("package.json");
  packageJson.files = [...files.values()];
  await fs.writeFile("package.json", JSON.stringify(packageJson, null, 2) + "\n");

  if (ignorePaths.length === 0) return;
  await fs.outputFile(
    ".gitignore",
    dedent`
    # Generated file. Do not edit directly, edit within tsup.config.ts
    dist/
    node_modules/
    yarn-error.log
    ${ignorePaths.join("/\n")}/
  `
  );
}
