import type { ImageProvider } from "../../core/provider.js";
import { Capability } from "../../core/types.js";
import { saveImage } from "../../core/storage.js";
import { findProviderWith } from "../../core/registry.js";
import { saveLastOutput } from "../../core/config.js";
import * as out from "../output.js";

interface EditArgs {
  inputImage: string;
  prompt: string;
  output?: string;
  outputDir?: string;
  aspectRatio?: string;
  resolution?: string;
  outputFormat?: "png" | "jpeg" | "webp";
  model?: string;
}

export async function runEdit(
  provider: ImageProvider,
  args: EditArgs
): Promise<void> {
  if (!provider.info.capabilities.has(Capability.IMAGE_EDITING)) {
    const supported = findProviderWith(Capability.IMAGE_EDITING)
      .map((p) => p.info.name)
      .join(", ");
    out.fail(
      `Provider "${provider.info.name}" does not support IMAGE_EDITING.` +
        (supported ? ` Supported: ${supported}` : "")
    );
  }

  if (!provider.edit) {
    out.fail(`Provider "${provider.info.name}" has no edit implementation`);
  }

  const result = await provider.edit(
    {
      inputImage: args.inputImage,
      prompt: args.prompt,
      aspectRatio: args.aspectRatio,
      resolution: args.resolution,
      outputFormat: args.outputFormat,
    },
    args.model
  );

  if (!result.success || result.images.length === 0) {
    out.fail(result.error || "Edit failed");
  }

  const paths: string[] = [];
  for (const image of result.images) {
    const saved = saveImage(image, args.output, args.outputDir);
    paths.push(saved);
  }

  saveLastOutput(paths);
  out.success({ filePaths: paths });
}
