import { registerProvider } from "../../core/registry.js";
import { resolveApiKey } from "../../core/config.js";
import { GeminiProvider } from "./client.js";

export function initGemini(): void {
  const apiKey = resolveApiKey("gemini");
  if (!apiKey) return; // API キーがなければ登録しない
  registerProvider(new GeminiProvider(apiKey));
}
