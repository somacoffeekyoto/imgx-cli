import type {
  ProviderInfo,
  GenerateInput,
  EditInput,
  ImageResult,
} from "./types.js";

export interface ImageProvider {
  info: ProviderInfo;

  generate(input: GenerateInput, model?: string): Promise<ImageResult>;

  edit?(input: EditInput, model?: string): Promise<ImageResult>;
}
