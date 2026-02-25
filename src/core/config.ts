import { readFileSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir, platform } from "node:os";

export interface ImgxConfig {
  providers?: {
    gemini?: { apiKey?: string };
    [key: string]: { apiKey?: string } | undefined;
  };
  defaults?: {
    provider?: string;
    model?: string;
    outputDir?: string;
    aspectRatio?: string;
    resolution?: string;
  };
}

function configDir(): string {
  if (platform() === "win32") {
    return join(process.env.APPDATA || join(homedir(), "AppData", "Roaming"), "imgx");
  }
  return join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "imgx");
}

function configPath(): string {
  return join(configDir(), "config.json");
}

export function loadConfig(): ImgxConfig {
  try {
    const raw = readFileSync(configPath(), "utf-8");
    return JSON.parse(raw) as ImgxConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: ImgxConfig): void {
  const dir = configDir();
  mkdirSync(dir, { recursive: true });
  const path = configPath();
  writeFileSync(path, JSON.stringify(config, null, 2) + "\n", "utf-8");
  // Set file permissions to owner-only on non-Windows
  if (platform() !== "win32") {
    try { chmodSync(path, 0o600); } catch { /* ignore */ }
  }
}

/** Resolve a provider API key: env var → config file */
export function resolveApiKey(providerName: string): string | undefined {
  // Environment variable takes precedence
  if (providerName === "gemini" && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  // Fall back to config file
  const config = loadConfig();
  return config.providers?.[providerName]?.apiKey;
}

/** Load .imgxrc from current directory (project-level config, no API keys) */
export function loadProjectConfig(): ImgxConfig {
  try {
    const raw = readFileSync(resolve(".imgxrc"), "utf-8");
    return JSON.parse(raw) as ImgxConfig;
  } catch {
    return {};
  }
}

/** Resolve a default setting: env var → .imgxrc → config file → undefined */
export function resolveDefault(key: "provider" | "model" | "outputDir" | "aspectRatio" | "resolution"): string | undefined {
  const envMap: Record<string, string | undefined> = {
    provider: process.env.IMGX_PROVIDER,
    model: process.env.IMGX_MODEL,
    outputDir: process.env.IMGX_OUTPUT_DIR,
  };
  if (envMap[key]) return envMap[key];
  // Project config (.imgxrc) takes precedence over user config
  const project = loadProjectConfig();
  if (project.defaults?.[key]) return project.defaults[key];
  const config = loadConfig();
  return config.defaults?.[key];
}

/** Save the last output file paths for --last flag */
export function saveLastOutput(filePaths: string[]): void {
  const dir = configDir();
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "last-output.json");
  writeFileSync(path, JSON.stringify({ filePaths, timestamp: Date.now() }) + "\n", "utf-8");
}

/** Load the last output file paths */
export function loadLastOutput(): string[] | undefined {
  try {
    const raw = readFileSync(join(configDir(), "last-output.json"), "utf-8");
    const data = JSON.parse(raw) as { filePaths?: string[] };
    return data.filePaths;
  } catch {
    return undefined;
  }
}

export function getConfigPath(): string {
  return configPath();
}
