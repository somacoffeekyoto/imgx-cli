# imgx-cli

AI image generation and editing from the terminal. Provider-agnostic design with capability-based abstraction.

## Install

### As a Claude Code plugin

```
/plugin marketplace add somacoffeekyoto/imgx-cli
/plugin install imgx-cli@somacoffeekyoto-imgx-cli
```

After installation, restart Claude Code. The `image-generation` skill becomes available — Claude Code can generate and edit images via natural language instructions.

### As a standalone CLI

```bash
npm install -g imgx-cli
```

Requires Node.js 18+.

## Setup

Set your API key as an environment variable:

```bash
export GEMINI_API_KEY="your-api-key"
```

## Usage

### Generate an image from text

```bash
imgx generate -p "A coffee cup on a wooden table, morning light" -o output.png
```

### Edit an existing image

```bash
imgx edit -i photo.png -p "Change the background to sunset" -o edited.png
```

### Options

| Flag | Short | Description |
|------|-------|-------------|
| `--prompt` | `-p` | Image description or edit instruction (required) |
| `--output` | `-o` | Output file path (auto-generated if omitted) |
| `--input` | `-i` | Input image to edit (`edit` command only) |
| `--aspect-ratio` | `-a` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2:3`, `3:2` |
| `--resolution` | `-r` | `1K`, `2K`, `4K` |
| `--count` | `-n` | Number of images to generate |
| `--model` | `-m` | Model name |
| `--provider` | | Provider name (default: `gemini`) |
| `--output-dir` | `-d` | Output directory |

### Other commands

```bash
imgx providers      # List available providers and their capabilities
imgx capabilities   # Show detailed capabilities of current provider
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Gemini API key (required for Gemini provider) |
| `IMGX_PROVIDER` | Default provider |
| `IMGX_MODEL` | Default model |
| `IMGX_OUTPUT_DIR` | Default output directory |

## Output

All commands output JSON:

```json
{"success": true, "filePaths": ["./output.png"]}
```

```json
{"success": false, "error": "error message"}
```

This makes imgx suitable for scripting, CI pipelines, and integration with other tools.

## Architecture

imgx separates **model-independent** and **model-dependent** concerns:

```
CLI (argument parsing, file I/O, output formatting)
 ↓
Core (Capability enum, ImageProvider interface, provider registry)
 ↓
Provider (model-specific API calls, capability declarations)
```

Each provider declares its supported capabilities. The CLI dynamically enables or disables options based on what the active provider supports. Adding a new provider means implementing the `ImageProvider` interface and registering it — no changes to the CLI layer.

### Supported capabilities

| Capability | Description |
|------------|-------------|
| `TEXT_TO_IMAGE` | Generate images from text prompts |
| `IMAGE_EDITING` | Edit images with text instructions |
| `ASPECT_RATIO` | Control output aspect ratio |
| `RESOLUTION_CONTROL` | Control output resolution |
| `MULTIPLE_OUTPUTS` | Generate multiple images per request |
| `REFERENCE_IMAGES` | Use reference images for guidance |
| `PERSON_CONTROL` | Control person generation in output |

### Current providers

| Provider | Models | Capabilities |
|----------|--------|-------------|
| Gemini | `gemini-3-pro-image-preview`, `gemini-2.5-flash-image` | All 7 capabilities |

## Claude Code plugin structure

imgx-cli doubles as a Claude Code plugin. The repository contains:

```
.claude-plugin/
├── plugin.json          # Plugin manifest (name, version, author)
└── marketplace.json     # Marketplace definition for plugin discovery
skills/
└── image-generation/
    └── SKILL.md         # Skill instructions for Claude Code
dist/
└── cli.bundle.js        # Bundled CLI (tracked in git for plugin distribution)
```

When installed as a plugin, Claude Code clones this repository and registers the skill. The skill instructs Claude Code to execute `dist/cli.bundle.js` via bash when image generation or editing is requested.

### Plugin configuration files

**`.claude-plugin/plugin.json`** — Plugin identity. Fields: `name`, `description`, `version`, `author`. No `category` field (that belongs in `marketplace.json` only).

**`.claude-plugin/marketplace.json`** — Marketplace wrapper. The `source` field must use URL format for self-referencing repositories:

```json
"source": {
  "source": "url",
  "url": "https://github.com/somacoffeekyoto/imgx-cli.git"
}
```

**`skills/image-generation/SKILL.md`** — Uses `${CLAUDE_PLUGIN_ROOT}` variable for portable CLI paths. Frontmatter (`name`, `description`) is required for skill registration.

### Version updates

When releasing a new version, update the version string in all three locations:

1. `package.json` — npm package version
2. `src/cli/index.ts` — CLI `--version` output
3. `.claude-plugin/plugin.json` — Plugin manifest version
4. `.claude-plugin/marketplace.json` — Marketplace plugin entry version

Then rebuild (`npm run bundle`) and commit `dist/cli.bundle.js` since plugin distribution relies on the git repository.

## Development

```bash
git clone https://github.com/somacoffeekyoto/imgx-cli.git
cd imgx-cli
npm install
npm run bundle    # TypeScript compile + esbuild bundle
```

The build produces a single `dist/cli.bundle.js` file.

## License

MIT — [SOMA COFFEE KYOTO](https://github.com/somacoffeekyoto)
