# imgx-mcp

AI image generation and editing MCP server. Works with Claude Code, Gemini CLI, Cursor, Windsurf, and any MCP-compatible tool.

Generate images from text, edit existing images with text instructions, iterate on results — all from your AI coding environment.

## Quick start

Add to your tool's MCP config (`.mcp.json`, `settings.json`, etc.):

```json
{
  "mcpServers": {
    "imgx": {
      "command": "npx",
      "args": ["--package=imgx-mcp", "-y", "imgx-mcp"],
      "env": { "GEMINI_API_KEY": "your-key" }
    }
  }
}
```

That's it. Your AI agent can now generate and edit images.

> **Windows**: Replace `"command": "npx"` with `"command": "cmd"` and prepend `"/c"` to the args array.

## MCP tools

| Tool | Description |
|------|-------------|
| `generate_image` | Generate an image from a text prompt |
| `edit_image` | Edit an existing image with text instructions |
| `edit_last` | Edit the last generated/edited image (no input path needed) |
| `list_providers` | List available providers and capabilities |

Images are saved to `~/Pictures/imgx/` by default. File paths are returned in the response. Inline image preview is included in MCP responses (base64).

### Iterative editing

The `edit_last` tool uses the output of the previous `generate_image` or `edit_image` call as input. This enables a conversational workflow:

```
"Generate a coffee shop interior" → generate_image
"Make the lighting warmer"        → edit_last
"Add a person reading a book"     → edit_last
```

No need to specify file paths between steps.

## Skill (Claude Code)

For Claude Code users, imgx-mcp provides an `image-generation` skill — a guided prompt that helps Claude Code use the MCP tools effectively.

### Option A: Install as a plugin (includes MCP + Skill)

```
/plugin marketplace add somacoffeekyoto/imgx-mcp
/plugin install imgx-mcp@somacoffeekyoto-imgx-mcp
```

This registers the MCP server and installs the skill in one step.

### Option B: MCP server + standalone skill

If you already have imgx-mcp configured as an MCP server, you can add the skill separately. Copy the skill directory to your project:

```
your-project/
  .mcp.json                         ← imgx-mcp MCP server config
  skills/
    image-generation/
      SKILL.md                      ← skill prompt file
      references/
        providers.md                ← provider reference
```

The skill file content is available in [`skills/image-generation/SKILL.md`](skills/image-generation/SKILL.md) in this repository.

### MCP server vs Plugin vs Skill

| | MCP server | Skill | Plugin |
|---|---|---|---|
| What it does | Exposes image tools to AI agents | Guided prompt for using the tools | Bundles MCP + Skill together |
| Works with | Any MCP-compatible tool | Claude Code only | Claude Code only |
| Install | Add to `.mcp.json` | Copy skill directory to project | `/plugin install` |
| Team sharing | Commit `.mcp.json` to repo | Commit `skills/` to repo | Each member installs |

**Recommended**: Use MCP server setup (Quick start above). Add the skill if you use Claude Code.

## API key setup

Set up at least one provider:

**Gemini** — get a key from [Google AI Studio](https://aistudio.google.com/apikey) (free tier available):

```bash
imgx config set api-key YOUR_GEMINI_API_KEY --provider gemini
```

**OpenAI** — get a key from [OpenAI Platform](https://platform.openai.com/api-keys):

```bash
imgx config set api-key YOUR_OPENAI_API_KEY --provider openai
```

Keys are stored in `~/.config/imgx/config.json` (Linux/macOS) or `%APPDATA%\imgx\config.json` (Windows). Alternatively, pass keys via the `env` section in your MCP config, or set environment variables:

```bash
export GEMINI_API_KEY="your-api-key"
export OPENAI_API_KEY="your-api-key"
```

Only include the API keys for providers you want to use. At least one is required.

## MCP configuration by tool

### Claude Code

`.mcp.json` in your project root:

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

Or install as a [plugin](#option-a-install-as-a-plugin-includes-mcp--skill) for automatic MCP registration + skill.

### Gemini CLI

`~/.gemini/settings.json`:

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

### Claude Desktop

`claude_desktop_config.json`:

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

> **Note:** Claude Desktop runs the MCP server from its own app directory. To control image output location, add `"IMGX_OUTPUT_DIR": "C:\\Users\\you\\Pictures"` to the `env` section, or run `imgx config set output-dir <path>` beforehand.

### Codex CLI

`.codex/config.toml`:

```toml
[mcp_servers.imgx]
command = "npx"
args = ["--package=imgx-mcp", "-y", "imgx-mcp"]
env = { GEMINI_API_KEY = "your-key", OPENAI_API_KEY = "your-key" }
```

### Other tools

The same `npx` pattern works with Cursor, Windsurf, Continue.dev, Cline, Zed, and other MCP-compatible tools. On Windows, use `cmd /c npx` instead of `npx` directly.

## Providers

| Provider | Models | Capabilities |
|----------|--------|-------------|
| Gemini | `gemini-3-pro-image-preview`, `gemini-2.5-flash-image` | Generate, edit, aspect ratio, resolution, reference images, person control |
| OpenAI | `gpt-image-1` | Generate, edit, aspect ratio, multi-output, output format (PNG/JPEG/WebP) |

## Architecture

imgx separates **model-independent** and **model-dependent** concerns:

```
MCP server (tool definitions, stdio transport)    CLI (argument parsing, output formatting)
 ↓                                                 ↓
Core (Capability enum, ImageProvider interface, provider registry, file I/O)
 ↓
Provider (model-specific API calls, capability declarations)
```

MCP server and CLI are two entry points into the same core. Both call the same provider functions.

Each provider declares its supported capabilities. Adding a new provider means implementing the `ImageProvider` interface and registering it — no changes to the MCP or CLI layer.

### Capability system

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

## CLI (alternative)

imgx-mcp also works as a standalone command-line tool.

### Install

```bash
npm install -g imgx-mcp
```

Requires Node.js 18+.

### Usage

```bash
# Generate
imgx generate -p "A coffee cup on a wooden table, morning light" -o output.png

# Edit
imgx edit -i photo.png -p "Change the background to sunset" -o edited.png

# Iterative editing
imgx edit -i photo.png -p "Make the background darker"
imgx edit --last -p "Add warm lighting"
imgx edit --last -p "Crop to 16:9" -o final.png

# Provider management
imgx providers          # List providers and capabilities
imgx capabilities       # Detailed capabilities of current provider
```

### CLI options

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

Or create manually:

```json
{
  "defaults": {
    "model": "gemini-2.5-flash-image",
    "outputDir": "./assets/images",
    "aspectRatio": "16:9"
  }
}
```

Project config is shared via Git. Do not put API keys in `.imgxrc`.

### Settings resolution

1. CLI flags (`--model`, `--output-dir`, etc.)
2. Environment variables (`IMGX_MODEL`, `IMGX_OUTPUT_DIR`, etc.)
3. Project config (`.imgxrc` in current directory)
4. User config (`~/.config/imgx/config.json` or `%APPDATA%\imgx\config.json`)
5. Provider defaults

### Output format

All CLI commands output JSON:

```json
{"success": true, "filePaths": ["./output.png"]}
```

## Claude Code plugin (alternative)

The plugin bundles MCP server + skill in one step. Convenient for Claude Code users who don't want to configure `.mcp.json` manually.

### Install

```
/plugin marketplace add somacoffeekyoto/imgx-mcp
/plugin install imgx-mcp@somacoffeekyoto-imgx-mcp
```

### Update

```
/plugin update → select "installed" → imgx-mcp → update
```

If the update shows no changes, uninstall and reinstall:

```
/plugin uninstall imgx-mcp@somacoffeekyoto-imgx-mcp
/plugin install imgx-mcp@somacoffeekyoto-imgx-mcp
```

### Uninstall

```
/plugin uninstall imgx-mcp@somacoffeekyoto-imgx-mcp
/plugin marketplace remove somacoffeekyoto-imgx-mcp
```

## Development

```bash
git clone https://github.com/somacoffeekyoto/imgx-mcp.git
cd imgx-mcp
npm install
npm run bundle    # TypeScript compile + esbuild bundle
```

The build produces two bundles:

- `dist/mcp.bundle.js` — MCP server entry point
- `dist/cli.bundle.js` — CLI entry point

## Uninstall

### MCP server

Remove the `imgx` entry from your tool's MCP configuration file.

### CLI

```bash
npm uninstall -g imgx-mcp
```

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
- [npm](https://www.npmjs.com/package/imgx-mcp)
- [MCP Registry](https://registry.modelcontextprotocol.io)
- [SOMA COFFEE KYOTO](https://somacoffee.net)
- [X (@somacoffeekyoto)](https://x.com/somacoffeekyoto)
