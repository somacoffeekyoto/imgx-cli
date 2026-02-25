import { build } from "esbuild";
import { builtinModules } from "node:module";

const nodeExternals = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
];

await build({
  entryPoints: ["build/cli/index.js"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/cli.bundle.js",
  banner: {
    js: "#!/usr/bin/env node\nimport { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  external: [],
});

console.log("Bundle created: dist/cli.bundle.js");
