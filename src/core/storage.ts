import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { GeneratedImage } from "./types.js";

const MIME_TO_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export function readImageAsBase64(filePath: string): {
  data: string;
  mimeType: string;
} {
  const absPath = resolve(filePath);
  const buffer = readFileSync(absPath);
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mimeType =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "webp"
        ? "image/webp"
        : "image/png";

  return { data: buffer.toString("base64"), mimeType };
}

export function saveImage(
  image: GeneratedImage,
  outputPath?: string,
  outputDir?: string
): string {
  const ext = MIME_TO_EXT[image.mimeType] || ".png";

  const filePath = outputPath
    ? resolve(outputPath)
    : resolve(outputDir || ".", `imgx-${randomUUID().slice(0, 8)}${ext}`);

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, image.data);
  return filePath;
}
