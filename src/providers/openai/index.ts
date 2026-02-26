import { registerProvider } from "../../core/registry.js";
import { resolveApiKey } from "../../core/config.js";
import { OpenAIProvider } from "./client.js";

export function initOpenAI(): void {
  const apiKey = resolveApiKey("openai");
  if (!apiKey) return; // API キーがなければ登録しない
  registerProvider(new OpenAIProvider(apiKey));
}
