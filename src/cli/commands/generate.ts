import type { ImageProvider } from "../../core/provider.js";
import { saveImage } from "../../core/storage.js";
import { saveLastOutput } from "../../core/config.js";
import * as out from "../output.js";

interface GenerateArgs {
  prompt: string;
  output?: string;
  outputDir?: string;
  aspectRatio?: string;
  count?: number;
  resolution?: string;
  outputFormat?: "png" | "jpeg" | "webp";
  model?: string;
}

export async function runGenerate(
  provider: ImageProvider,
  args: GenerateArgs
): Promise<void> {
  const result = await provider.generate(
    {
      prompt: args.prompt,
      aspectRatio: args.aspectRatio,
      count: args.count,
      resolution: args.resolution,
      outputFormat: args.outputFormat,
    },
    args.model
  );

  if (!result.success || result.images.length === 0) {
    out.fail(result.error || "Generation failed");
  }

  const paths: string[] = [];
  for (let i = 0; i < result.images.length; i++) {
    const outputPath =
      result.images.length === 1
        ? args.output
        : args.output?.replace(/\.(\w+)$/, `-${i + 1}.$1`);

    const saved = saveImage(result.images[i], outputPath, args.outputDir);
    paths.push(saved);
  }

  saveLastOutput(paths);
  out.success({ filePaths: paths });
}
