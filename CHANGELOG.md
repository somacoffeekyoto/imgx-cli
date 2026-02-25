# Changelog

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
