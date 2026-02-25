import { registerProvider } from "../../core/registry.js";
import { GeminiProvider } from "./client.js";

export function initGemini(): void {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return; // API キーがなければ登録しない
  registerProvider(new GeminiProvider(apiKey));
}
