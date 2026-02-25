import { loadConfig, saveConfig, getConfigPath } from "../../core/config.js";
import * as out from "../output.js";

export function runConfig(args: string[]): void {
  const sub = args[0];

  if (!sub || sub === "list") {
    showAll();
    return;
  }

  if (sub === "set") {
    const key = args[1];
    const value = args[2];
    if (!key || !value) {
      out.fail('Usage: imgx config set <key> <value>\n  Keys: api-key, provider, model, output-dir, aspect-ratio, resolution');
    }
    setKey(key, value);
    return;
  }

  if (sub === "get") {
    const key = args[1];
    if (!key) {
      out.fail("Usage: imgx config get <key>");
    }
    getKey(key);
    return;
  }

  if (sub === "path") {
    out.success({ path: getConfigPath() });
    return;
  }

  out.fail(`Unknown config subcommand: ${sub}. Use: list, set, get, path`);
}

function setKey(key: string, value: string): void {
  const config = loadConfig();

  switch (key) {
    case "api-key": {
      if (!config.providers) config.providers = {};
      if (!config.providers.gemini) config.providers.gemini = {};
      config.providers.gemini.apiKey = value;
      break;
    }
    case "provider": {
      if (!config.defaults) config.defaults = {};
      config.defaults.provider = value;
      break;
    }
    case "model": {
      if (!config.defaults) config.defaults = {};
      config.defaults.model = value;
      break;
    }
    case "output-dir": {
      if (!config.defaults) config.defaults = {};
      config.defaults.outputDir = value;
      break;
    }
    case "aspect-ratio": {
      if (!config.defaults) config.defaults = {};
      config.defaults.aspectRatio = value;
      break;
    }
    case "resolution": {
      if (!config.defaults) config.defaults = {};
      config.defaults.resolution = value;
      break;
    }
    default:
      out.fail(`Unknown key: ${key}. Valid keys: api-key, provider, model, output-dir, aspect-ratio, resolution`);
  }

  saveConfig(config);
  out.success({ key, status: "saved" });
}

function getKey(key: string): void {
  const config = loadConfig();

  switch (key) {
    case "api-key": {
      const val = config.providers?.gemini?.apiKey;
      // Mask the API key for safety
      const masked = val ? val.slice(0, 6) + "..." + val.slice(-4) : undefined;
      out.success({ key, value: masked ?? null });
      return;
    }
    case "provider":
      out.success({ key, value: config.defaults?.provider ?? null });
      return;
    case "model":
      out.success({ key, value: config.defaults?.model ?? null });
      return;
    case "output-dir":
      out.success({ key, value: config.defaults?.outputDir ?? null });
      return;
    case "aspect-ratio":
      out.success({ key, value: config.defaults?.aspectRatio ?? null });
      return;
    case "resolution":
      out.success({ key, value: config.defaults?.resolution ?? null });
      return;
    default:
      out.fail(`Unknown key: ${key}. Valid keys: api-key, provider, model, output-dir, aspect-ratio, resolution`);
  }
}

function showAll(): void {
  const config = loadConfig();
  const hasApiKey = !!config.providers?.gemini?.apiKey;
  out.success({
    configPath: getConfigPath(),
    apiKey: hasApiKey ? "(set)" : "(not set)",
    defaults: config.defaults ?? {},
  });
}
