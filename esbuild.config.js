import { build } from "esbuild";

const commonOptions = {
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  external: [],
};

// CLI bundle
await build({
  ...commonOptions,
  entryPoints: ["build/cli/index.js"],
  outfile: "dist/cli.bundle.js",
  banner: {
    js: "#!/usr/bin/env node\n" + commonOptions.banner.js,
  },
});
console.log("Bundle created: dist/cli.bundle.js");

// MCP server bundle
await build({
  ...commonOptions,
  entryPoints: ["build/mcp/server.js"],
  outfile: "dist/mcp.bundle.js",
  banner: {
    js: "#!/usr/bin/env node\n" + commonOptions.banner.js,
  },
});
console.log("Bundle created: dist/mcp.bundle.js");
