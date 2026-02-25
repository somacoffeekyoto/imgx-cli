import type { ImageProvider } from "./provider.js";
import { Capability } from "./types.js";

const providers = new Map<string, ImageProvider>();

export function registerProvider(provider: ImageProvider): void {
  providers.set(provider.info.name, provider);
}

export function getProvider(name: string): ImageProvider | undefined {
  return providers.get(name);
}

export function listProviders(): ImageProvider[] {
  return Array.from(providers.values());
}

export function findProviderWith(capability: Capability): ImageProvider[] {
  return listProviders().filter((p) => p.info.capabilities.has(capability));
}
