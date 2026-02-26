# Provider Reference

## Gemini (default)

| Item | Value |
|------|-------|
| Provider name | `gemini` |
| Default model | `gemini-3-pro-image-preview` |
| Alternative model | `gemini-2.5-flash-image` |
| API key env var | `GEMINI_API_KEY` |

### Model comparison

| Feature | gemini-3-pro-image-preview | gemini-2.5-flash-image |
|---------|---------------------------|------------------------|
| Quality | Higher | Good |
| Speed | Slower | Faster |
| Cost | ~$0.134/image | Lower |
| Resolution | 1K, 2K, 4K | 1K, 2K |

### Capabilities

All 7 capabilities supported:

| Capability | Description | CLI flag |
|------------|-------------|----------|
| TEXT_TO_IMAGE | Generate from text | (default behavior) |
| IMAGE_EDITING | Edit with text instructions | `edit` command |
| ASPECT_RATIO | Control aspect ratio | `--aspect-ratio` |
| RESOLUTION_CONTROL | Control output resolution | `--resolution` |
| MULTIPLE_OUTPUTS | Generate multiple images | `--count` |
| REFERENCE_IMAGES | Use reference images | `--reference` (future) |
| PERSON_CONTROL | Control person generation | `--person` (future) |

### Aspect ratios

`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`

### Resolutions

| Value | Approximate size |
|-------|-----------------|
| `1K` | ~1024px on longest side |
| `2K` | ~2048px on longest side |
| `4K` | ~4096px on longest side |

## Adding new providers (future)

Providers implement the `ImageProvider` interface and register via the provider registry. Each provider declares its supported capabilities. The CLI dynamically enables/disables options based on the active provider's capabilities.

Planned providers: DALL-E, Stable Diffusion.
