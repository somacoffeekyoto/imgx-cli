# imgx-mcp

AI image generation and editing for Claude Code, Codex CLI, and MCP-compatible AI agents. Provider-agnostic design with capability-based abstraction.

## Install

### As a Claude Code plugin

```
/plugin marketplace add somacoffeekyoto/imgx-mcp
/plugin install imgx-mcp@somacoffeekyoto-imgx-mcp
```

After installation, restart Claude Code. The `image-generation` skill becomes available — Claude Code can generate and edit images via natural language instructions.

### Update

#### Claude Code plugin

You can try updating via the plugin manager:

```
/plugin update → select "installed" → imgx-mcp → update
```

If the update shows no changes or the plugin doesn't reflect the latest version, uninstall and reinstall:

```
/plugin uninstall imgx-mcp@somacoffeekyoto-imgx-mcp
/plugin install imgx-mcp@somacoffeekyoto-imgx-mcp
```

Then restart Claude Code.

#### Standalone CLI

```bash
npm update -g imgx-mcp
```

### As a standalone CLI

```bash
npm install -g imgx-mcp
```

Requires Node.js 18+.

## Setup

Set up at least one provider:

**Gemini** — get a key from [Google AI Studio](https://aistudio.google.com/apikey) (free tier available):

```bash
imgx config set api-key YOUR_GEMINI_API_KEY --provider gemini
```

**OpenAI** — get a key from [OpenAI Platform](https://platform.openai.com/api-keys):

```bash
imgx config set api-key YOUR_OPENAI_API_KEY --provider openai
```

Keys are stored in `~/.config/imgx/config.json` (Linux/macOS) or `%APPDATA%\imgx\config.json` (Windows). Alternatively, set environment variables:

```bash
export GEMINI_API_KEY="your-api-key"
export OPENAI_API_KEY="your-api-key"
```

Environment variables take precedence over the config file.

## Usage

### Generate an image from text

```bash
imgx generate -p "A coffee cup on a wooden table, morning light" -o output.png
```

### Edit an existing image

```bash
imgx edit -i photo.png -p "Change the background to sunset" -o edited.png
```

### Iterative editing with `--last`

```bash
imgx edit -i photo.png -p "Make the background darker"
# → {"success": true, "filePaths": ["./imgx-a1b2c3d4.png"]}

imgx edit --last -p "Add warm lighting"
# Uses the previous output as input automatically

imgx edit --last -p "Crop to 16:9" -o final.png
```

### Options

| Flag | Short | Description |
|------|-------|-------------|
| `--prompt` | `-p` | Image description or edit instruction (required) |
| `--output` | `-o` | Output file path (auto-generated if omitted) |
| `--input` | `-i` | Input image to edit (`edit` command only) |
| `--last` | `-l` | Use last output as input (`edit` command only) |
| `--aspect-ratio` | `-a` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2:3`, `3:2` |
| `--resolution` | `-r` | `1K`, `2K`, `4K` |
| `--count` | `-n` | Number of images to generate |
| `--format` | `-f` | Output format: `png`, `jpeg`, `webp` (OpenAI only) |
| `--model` | `-m` | Model name |
| `--provider` | | Provider name (default: `gemini`) |
| `--output-dir` | `-d` | Output directory |

### Configuration

```bash
imgx config set api-key <key> --provider gemini   # Save Gemini API key
imgx config set api-key <key> --provider openai   # Save OpenAI API key
imgx config set model <name>      # Set default model
imgx config set output-dir <dir>  # Set default output directory
imgx config set aspect-ratio 16:9 # Set default aspect ratio
imgx config set resolution 2K     # Set default resolution
imgx config list                  # Show all settings
imgx config get api-key           # Show a specific setting (API key is masked)
imgx config path                  # Show config file location
```

### Project config (`.imgxrc`)

Generate a template with `imgx init`:

```bash
imgx init
# → creates .imgxrc in current directory
```

Or create manually. Place a `.imgxrc` file in your project directory to set project-level defaults:

```json
{
  "defaults": {
    "model": "gemini-2.5-flash-image",
    "outputDir": "./assets/images",
    "aspectRatio": "16:9"
  }
}
```

Project config is shared via Git. Do not put API keys in `.imgxrc` — use `imgx config set api-key` or environment variables instead.

### Settings resolution

Settings are resolved in this order (first match wins):

1. CLI flags (`--model`, `--output-dir`, etc.)
2. Environment variables (`IMGX_MODEL`, `IMGX_OUTPUT_DIR`, etc.)
3. Project config (`.imgxrc` in current directory)
4. User config (`~/.config/imgx/config.json` or `%APPDATA%\imgx\config.json`)
5. Provider defaults

### Other commands

```bash
imgx providers      # List available providers and their capabilities
imgx capabilities   # Show detailed capabilities of current provider
```

### Environment variables

Environment variables override config file settings.

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key |
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

## MCP server

imgx includes an MCP (Model Context Protocol) server, making it available to any MCP-compatible AI coding tool.

### Exposed tools

| Tool | Description |
|------|-------------|
| `generate_image` | Generate an image from a text prompt |
| `edit_image` | Edit an existing image with text instructions |
| `edit_last` | Edit the last generated/edited image (no input path needed) |
| `list_providers` | List available providers and capabilities |

### Configuration

Add to your tool's MCP config. The `env` section is optional if you have already run `imgx config set api-key`.

**Claude Code** (`.mcp.json` / `claude mcp add`):

```json
{
  "mcpServers": {
    "imgx": {
      "command": "npx",
      "args": ["--package=imgx-mcp", "-y", "imgx-mcp"],
      "env": { "GEMINI_API_KEY": "your-key", "OPENAI_API_KEY": "your-key" }
    }
  }
}
```

On Windows, replace `"command": "npx"` with `"command": "cmd"` and prepend `"/c"` to the args array.

Or install as a [Claude Code plugin](#install) for automatic MCP registration.

**Gemini CLI** (`~/.gemini/settings.json`):

```json
{
  "mcpServers": {
    "imgx": {
      "command": "npx",
      "args": ["--package=imgx-mcp", "-y", "imgx-mcp"],
      "env": { "GEMINI_API_KEY": "your-key", "OPENAI_API_KEY": "your-key" }
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):

macOS / Linux:

```json
{
  "mcpServers": {
    "imgx": {
      "command": "npx",
      "args": ["--package=imgx-mcp", "-y", "imgx-mcp"],
      "env": { "GEMINI_API_KEY": "your-key", "OPENAI_API_KEY": "your-key" }
    }
  }
}
```

Windows:

```json
{
  "mcpServers": {
    "imgx": {
      "command": "cmd",
      "args": ["/c", "npx", "--package=imgx-mcp", "-y", "imgx-mcp"],
      "env": { "GEMINI_API_KEY": "your-key", "OPENAI_API_KEY": "your-key" }
    }
  }
}
```

Config file location: `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS). After editing, restart Claude Desktop.

> **Note:** Claude Desktop runs the MCP server from its own app directory. Images will be saved there by default. To control the output location, add `"IMGX_OUTPUT_DIR": "C:\\Users\\you\\Pictures"` to the `env` section, or run `imgx config set output-dir <path>` beforehand.

**Codex CLI** (`.codex/config.toml`):

```toml
[mcp_servers.imgx]
command = "npx"
args = ["--package=imgx-mcp", "-y", "imgx-mcp"]
env = { GEMINI_API_KEY = "your-key", OPENAI_API_KEY = "your-key" }
```

The same `npx` pattern works with Cursor, Windsurf, Continue.dev, Cline, Zed, and other MCP-compatible tools. On Windows, use `cmd /c npx` instead of `npx` directly.

Only include the API keys for providers you want to use. At least one is required.

## Architecture

imgx separates **model-independent** and **model-dependent** concerns:

```
CLI (argument parsing, output formatting)    MCP server (tool definitions, stdio transport)
 ↓                                            ↓
Core (Capability enum, ImageProvider interface, provider registry, file I/O)
 ↓
Provider (model-specific API calls, capability declarations)
```

CLI and MCP server are two entry points into the same core. Both call the same provider functions.

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
| `OUTPUT_FORMAT` | Choose output format (PNG, JPEG, WebP) |

### Current providers

| Provider | Models | Capabilities |
|----------|--------|-------------|
| Gemini | `gemini-3-pro-image-preview`, `gemini-2.5-flash-image` | All 7 base capabilities |
| OpenAI | `gpt-image-1` | Generate, edit, aspect ratio, multi-output, output format |

## Development

```bash
git clone https://github.com/somacoffeekyoto/imgx-mcp.git
cd imgx-mcp
npm install
npm run bundle    # TypeScript compile + esbuild bundle
```

The build produces two bundles:

- `dist/cli.bundle.js` — CLI entry point
- `dist/mcp.bundle.js` — MCP server entry point

## Uninstall

### Claude Code plugin

```
/plugin uninstall imgx-mcp@somacoffeekyoto-imgx-mcp
/plugin marketplace remove somacoffeekyoto-imgx-mcp
```

### Standalone CLI

```bash
npm uninstall -g imgx-mcp
```

### MCP server

Remove the `imgx` entry from your tool's MCP configuration file.

### Clean up configuration (optional)

```bash
# Linux / macOS
rm -rf ~/.config/imgx/

# Windows (PowerShell)
Remove-Item -Recurse -Force "$env:APPDATA\imgx"
```

## License

MIT — [SOMA COFFEE KYOTO](https://github.com/somacoffeekyoto)

## Links

- [GitHub](https://github.com/somacoffeekyoto/imgx-mcp)
- [SOMA COFFEE KYOTO](https://somacoffee.net)
- [X (@somacoffeekyoto)](https://x.com/somacoffeekyoto)
