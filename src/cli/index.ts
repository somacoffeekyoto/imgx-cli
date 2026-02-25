import { parseArgs } from "node:util";
import { initGemini } from "../providers/gemini/index.js";
import { getProvider, listProviders } from "../core/registry.js";
import { Capability } from "../core/types.js";
import { runGenerate } from "./commands/generate.js";
import { runEdit } from "./commands/edit.js";
import * as out from "./output.js";

const VERSION = "0.2.0";

const HELP = `imgx v${VERSION} — AI image generation and editing CLI

Commands:
  generate    Generate image from text prompt
  edit        Edit existing image with text instructions
  providers   List available providers
  capabilities Show capabilities of current provider

Usage:
  imgx generate -p "prompt" -o "./output.png"
  imgx edit -i "./input.png" -p "change background" -o "./output.png"

Options:
  -p, --prompt <text>        Image description (required)
  -o, --output <path>        Output file path
  -i, --input <path>         Input image for editing (edit command)
  -a, --aspect-ratio <ratio> Aspect ratio (e.g., 16:9, 1:1)
  -n, --count <number>       Number of images to generate
  -r, --resolution <size>    Resolution: 1K, 2K, 4K
  -m, --model <model>        Model name
  --provider <name>          Provider (default: gemini)
  -d, --output-dir <dir>     Output directory
  -h, --help                 Show help
  -v, --version              Show version

Environment:
  GEMINI_API_KEY             Gemini API key
  IMGX_PROVIDER              Default provider
  IMGX_MODEL                 Default model
  IMGX_OUTPUT_DIR            Default output directory
`;

function main(): void {
  // プロバイダ初期化
  initGemini();

  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "-h" || command === "--help") {
    console.log(HELP);
    process.exit(0);
  }

  if (command === "-v" || command === "--version") {
    console.log(VERSION);
    process.exit(0);
  }

  if (command === "providers") {
    const all = listProviders();
    if (all.length === 0) {
      out.fail("No providers configured. Set GEMINI_API_KEY to enable Gemini.");
    }
    const data = all.map((p) => ({
      name: p.info.name,
      models: p.info.models,
      defaultModel: p.info.defaultModel,
      capabilities: Array.from(p.info.capabilities),
    }));
    out.success({ providers: data });
  }

  // コマンド引数をパース（command の後ろだけ）
  const cmdArgs = args.slice(1);

  const { values } = parseArgs({
    args: cmdArgs,
    options: {
      prompt: { type: "string", short: "p" },
      output: { type: "string", short: "o" },
      input: { type: "string", short: "i" },
      "aspect-ratio": { type: "string", short: "a" },
      count: { type: "string", short: "n" },
      resolution: { type: "string", short: "r" },
      model: { type: "string", short: "m" },
      provider: { type: "string" },
      "output-dir": { type: "string", short: "d" },
    },
    strict: false,
  });

  // プロバイダ解決
  const providerName =
    (values.provider as string) ||
    process.env.IMGX_PROVIDER ||
    "gemini";

  const provider = getProvider(providerName);
  if (!provider) {
    const available = listProviders().map((p) => p.info.name).join(", ");
    out.fail(
      `Provider "${providerName}" not available.` +
        (available ? ` Available: ${available}` : " Set GEMINI_API_KEY to enable Gemini.")
    );
  }

  // モデル解決
  const model =
    (values.model as string) ||
    process.env.IMGX_MODEL ||
    undefined;

  // capabilities コマンド
  if (command === "capabilities") {
    out.success({
      provider: provider.info.name,
      models: provider.info.models,
      defaultModel: provider.info.defaultModel,
      capabilities: Array.from(provider.info.capabilities),
      aspectRatios: provider.info.aspectRatios,
      resolutions: provider.info.resolutions || [],
    });
  }

  // prompt 必須チェック
  const prompt = values.prompt as string | undefined;
  if (!prompt) {
    out.fail("--prompt (-p) is required");
  }

  const commonArgs = {
    prompt,
    output: values.output as string | undefined,
    outputDir:
      (values["output-dir"] as string) ||
      process.env.IMGX_OUTPUT_DIR ||
      undefined,
    aspectRatio: values["aspect-ratio"] as string | undefined,
    resolution: values.resolution as string | undefined,
    model,
    count: values.count ? parseInt(values.count as string, 10) : undefined,
  };

  if (command === "generate") {
    runGenerate(provider, commonArgs);
    return;
  }

  if (command === "edit") {
    const inputImage = values.input as string | undefined;
    if (!inputImage) {
      out.fail("--input (-i) is required for edit command");
    }
    runEdit(provider, { ...commonArgs, inputImage });
    return;
  }

  out.fail(`Unknown command: ${command}. Run "imgx --help" for usage.`);
}

main();
