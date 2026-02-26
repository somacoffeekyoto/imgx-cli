# Changelog

## 0.5.1 (2026-02-26)

### Added

- Published to npm (`npm install -g imgx-cli` / `npx imgx`)
- `mcpName` field for MCP Registry integration
- `server.json` for MCP Registry publishing

### Changed

- README: added Google AI Studio link for API key setup, MCP env section note

## 0.5.0 (2026-02-26)

### Added

- `edit_last` MCP tool — edit the last generated/edited image via MCP without specifying input path
- `imgx init` command — create `.imgxrc` project config template in current directory
- MCP server now tracks last output (shared with CLI `--last` flag)

## 0.4.0 (2026-02-26)

### Added

- `--last` (`-l`) flag for `edit` command — use the previous output as input automatically
  - Works with both `generate` and `edit` outputs
  - Enables iterative editing without manually specifying file paths
- `.imgxrc` project config — place in project directory for project-level defaults
  - Supports `defaults.model`, `defaults.outputDir`, `defaults.aspectRatio`, `defaults.resolution`, `defaults.provider`
  - Shared via Git (no API keys — use `imgx config set api-key` or env vars)

### Changed

- Settings resolution expanded to 5 layers: CLI flags → env vars → `.imgxrc` → user config → provider defaults

## 0.3.0 (2026-02-26)

### Added

- `imgx config` command — manage API keys and default settings via config file
  - `config set api-key <key>` — save Gemini API key (no more manual environment variable setup)
  - `config set model|provider|output-dir|aspect-ratio|resolution <value>` — set defaults
  - `config list` — show all settings
  - `config get <key>` — show a specific setting (API key is masked)
  - `config path` — show config file location
- Config file at `~/.config/imgx/config.json` (Linux/macOS) or `%APPDATA%\imgx\config.json` (Windows)
- Settings resolution: CLI flags → environment variables → config file → provider defaults
- Uninstall instructions in README (plugin, npm, MCP, config cleanup)

### Changed

- API key resolution: environment variable → config file (env var still takes precedence)
- Default model, provider, output-dir, aspect-ratio, resolution are now configurable via `imgx config set`

## 0.2.0 (2026-02-26)

### Added

- MCP server (`dist/mcp.bundle.js`) — exposes `generate_image`, `edit_image`, `list_providers` tools via Model Context Protocol stdio transport
- Works with Gemini CLI, Codex CLI, Antigravity, Cursor, Windsurf, Continue.dev, Cline, Zed, and any MCP-compatible tool
- `.mcp.json` updated with actual server config for Claude Code plugin auto-registration
- `imgx-mcp` bin command for direct MCP server execution

## 0.1.0 (2026-02-26)

Initial release.

### Features

- `generate` command: text-to-image generation
- `edit` command: image editing with text instructions
- `providers` command: list available providers
- `capabilities` command: show provider capabilities
- Gemini provider with 7 capabilities (generate, edit, aspect ratio, resolution, multi-output, reference images, person control)
- Capability-based provider abstraction (model-independent core + model-dependent providers)
- JSON output for scripting and tool integration
- Single-file esbuild bundle

### Distribution

- Claude Code plugin: `somacoffeekyoto/imgx-cli` marketplace with `image-generation` skill
- npm package name reserved: `imgx-cli` (publish pending)
