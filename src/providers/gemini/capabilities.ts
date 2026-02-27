import { Capability, type ProviderInfo } from "../../core/types.js";

export const GEMINI_PROVIDER_INFO: ProviderInfo = {
  name: "gemini",
  models: ["gemini-3-pro-image-preview", "gemini-2.5-flash-image"],
  defaultModel: "gemini-3-pro-image-preview",
  capabilities: new Set([
    Capability.TEXT_TO_IMAGE,
    Capability.ASPECT_RATIO,
    Capability.IMAGE_EDITING,
    Capability.RESOLUTION_CONTROL,
    Capability.REFERENCE_IMAGES,
    Capability.PERSON_CONTROL,
  ]),
  aspectRatios: [
    "1:1",
    "2:3",
    "3:2",
    "3:4",
    "4:3",
    "9:16",
    "16:9",
  ],
  resolutions: ["1K", "2K", "4K"],
};
