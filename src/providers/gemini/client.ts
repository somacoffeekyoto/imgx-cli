import { GoogleGenAI } from "@google/genai";
import type { ImageProvider } from "../../core/provider.js";
import type {
  GenerateInput,
  EditInput,
  ImageResult,
  GeneratedImage,
} from "../../core/types.js";
import { readImageAsBase64 } from "../../core/storage.js";
import { GEMINI_PROVIDER_INFO } from "./capabilities.js";

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export class GeminiProvider implements ImageProvider {
  info = GEMINI_PROVIDER_INFO;
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generate(input: GenerateInput, model?: string): Promise<ImageResult> {
    return this.callApi([{ text: input.prompt }], input, model);
  }

  async edit(input: EditInput, model?: string): Promise<ImageResult> {
    const img = readImageAsBase64(input.inputImage);
    const parts: ContentPart[] = [
      { text: input.prompt },
      { inlineData: { mimeType: img.mimeType, data: img.data } },
    ];
    return this.callApi(parts, input, model);
  }

  private async callApi(
    parts: ContentPart[],
    input: GenerateInput,
    model?: string
  ): Promise<ImageResult> {
    const modelName = model || this.info.defaultModel;

    const config: Record<string, unknown> = {
      responseModalities: ["TEXT", "IMAGE"],
    };

    const imageConfig: Record<string, unknown> = {};
    if (input.aspectRatio) {
      imageConfig.aspectRatio = input.aspectRatio;
    }
    if (input.resolution) {
      const sizeMap: Record<string, string> = {
        "1K": "1024",
        "2K": "2048",
        "4K": "4096",
      };
      if (sizeMap[input.resolution]) {
        imageConfig.imageSize = sizeMap[input.resolution];
      }
    }
    if (Object.keys(imageConfig).length > 0) {
      config.imageConfig = imageConfig;
    }

    if (input.count && input.count > 1) {
      config.candidateCount = input.count;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: parts,
        config,
      });

      const images = this.extractImages(response);
      if (images.length === 0) {
        return { success: false, images: [], error: "No image data in response" };
      }

      return { success: true, images };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, images: [], error: msg };
    }
  }

  private extractImages(response: unknown): GeneratedImage[] {
    const images: GeneratedImage[] = [];
    const resp = response as {
      candidates?: Array<{
        content?: { parts?: Array<Record<string, unknown>> };
      }>;
    };

    const candidates = resp.candidates;
    if (!candidates) return images;

    for (const candidate of candidates) {
      const parts = candidate.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if ("inlineData" in part && part.inlineData) {
          const inline = part.inlineData as {
            data: string;
            mimeType?: string;
          };
          images.push({
            data: Buffer.from(inline.data, "base64"),
            mimeType: inline.mimeType || "image/png",
          });
        }
      }
    }

    return images;
  }
}
