import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { initGemini } from "../providers/gemini/index.js";
import { getProvider, listProviders } from "../core/registry.js";
import { saveImage } from "../core/storage.js";
import { saveLastOutput, loadLastOutput } from "../core/config.js";
import type { GenerateInput, EditInput } from "../core/types.js";

const server = new McpServer({
  name: "imgx",
  version: "0.5.0",
});

// プロバイダ初期化
initGemini();

function resolveProvider(providerName?: string) {
  const name = providerName || process.env.IMGX_PROVIDER || "gemini";
  const provider = getProvider(name);
  if (!provider) {
    const available = listProviders().map((p) => p.info.name).join(", ");
    throw new Error(
      `Provider "${name}" not available.` +
        (available ? ` Available: ${available}` : " Set GEMINI_API_KEY to enable Gemini.")
    );
  }
  return provider;
}

// --- generate_image ---

server.tool(
  "generate_image",
  "Generate an image from a text prompt",
  {
    prompt: z.string().describe("Image description"),
    output: z.string().optional().describe("Output file path"),
    output_dir: z.string().optional().describe("Output directory"),
    aspect_ratio: z
      .enum(["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9"])
      .optional()
      .describe("Aspect ratio"),
    resolution: z.enum(["1K", "2K", "4K"]).optional().describe("Output resolution"),
    count: z.number().int().min(1).max(4).optional().describe("Number of images"),
    model: z.string().optional().describe("Model name"),
    provider: z.string().optional().describe("Provider name"),
  },
  async (args) => {
    try {
      const prov = resolveProvider(args.provider);
      const input: GenerateInput = {
        prompt: args.prompt,
        aspectRatio: args.aspect_ratio,
        resolution: args.resolution,
        count: args.count,
      };

      const result = await prov.generate(input, args.model);
      if (!result.success || result.images.length === 0) {
        return { content: [{ type: "text", text: `Error: ${result.error || "Generation failed"}` }] };
      }

      const paths: string[] = [];
      for (let i = 0; i < result.images.length; i++) {
        const outputPath =
          result.images.length === 1
            ? args.output
            : args.output?.replace(/\.(\w+)$/, `-${i + 1}.$1`);
        const saved = saveImage(result.images[i], outputPath, args.output_dir);
        paths.push(saved);
      }

      saveLastOutput(paths);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, filePaths: paths }) }],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${msg}` }] };
    }
  }
);

// --- edit_image ---

server.tool(
  "edit_image",
  "Edit an existing image with text instructions",
  {
    input: z.string().describe("Input image file path"),
    prompt: z.string().describe("Edit instruction"),
    output: z.string().optional().describe("Output file path"),
    output_dir: z.string().optional().describe("Output directory"),
    aspect_ratio: z
      .enum(["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9"])
      .optional()
      .describe("Aspect ratio"),
    resolution: z.enum(["1K", "2K", "4K"]).optional().describe("Output resolution"),
    model: z.string().optional().describe("Model name"),
    provider: z.string().optional().describe("Provider name"),
  },
  async (args) => {
    try {
      const prov = resolveProvider(args.provider);
      if (!prov.edit) {
        return {
          content: [{ type: "text", text: `Error: Provider "${prov.info.name}" does not support image editing` }],
        };
      }

      const input: EditInput = {
        prompt: args.prompt,
        inputImage: args.input,
        aspectRatio: args.aspect_ratio,
        resolution: args.resolution,
      };

      const result = await prov.edit(input, args.model);
      if (!result.success || result.images.length === 0) {
        return { content: [{ type: "text", text: `Error: ${result.error || "Edit failed"}` }] };
      }

      const saved = saveImage(result.images[0], args.output, args.output_dir);
      saveLastOutput([saved]);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, filePaths: [saved] }) }],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${msg}` }] };
    }
  }
);

// --- edit_last ---

server.tool(
  "edit_last",
  "Edit the last generated/edited image with new text instructions. Uses the output of the previous generate_image or edit_image call as input.",
  {
    prompt: z.string().describe("Edit instruction"),
    output: z.string().optional().describe("Output file path"),
    output_dir: z.string().optional().describe("Output directory"),
    aspect_ratio: z
      .enum(["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9"])
      .optional()
      .describe("Aspect ratio"),
    resolution: z.enum(["1K", "2K", "4K"]).optional().describe("Output resolution"),
    model: z.string().optional().describe("Model name"),
    provider: z.string().optional().describe("Provider name"),
  },
  async (args) => {
    try {
      const lastPaths = loadLastOutput();
      if (!lastPaths || lastPaths.length === 0) {
        return {
          content: [{ type: "text", text: "Error: No previous output found. Run generate_image or edit_image first." }],
        };
      }

      const prov = resolveProvider(args.provider);
      if (!prov.edit) {
        return {
          content: [{ type: "text", text: `Error: Provider "${prov.info.name}" does not support image editing` }],
        };
      }

      const input: EditInput = {
        prompt: args.prompt,
        inputImage: lastPaths[0],
        aspectRatio: args.aspect_ratio,
        resolution: args.resolution,
      };

      const result = await prov.edit(input, args.model);
      if (!result.success || result.images.length === 0) {
        return { content: [{ type: "text", text: `Error: ${result.error || "Edit failed"}` }] };
      }

      const saved = saveImage(result.images[0], args.output, args.output_dir);
      saveLastOutput([saved]);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, filePaths: [saved], inputUsed: lastPaths[0] }) }],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${msg}` }] };
    }
  }
);

// --- list_providers ---

server.tool(
  "list_providers",
  "List available image providers and their capabilities",
  {},
  async () => {
    const all = listProviders();
    const data = all.map((p) => ({
      name: p.info.name,
      models: p.info.models,
      defaultModel: p.info.defaultModel,
      capabilities: Array.from(p.info.capabilities),
      aspectRatios: p.info.aspectRatios,
      resolutions: p.info.resolutions || [],
    }));
    return {
      content: [{ type: "text", text: JSON.stringify({ providers: data }) }],
    };
  }
);

// --- 起動 ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});
