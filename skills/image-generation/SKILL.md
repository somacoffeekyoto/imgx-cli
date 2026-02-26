---
name: image-generation
description: Generates and edits AI images using Google Gemini. Use when images need to be created or modified.
tools: Bash
---

# Image Generation & Editing Skill

Generate and edit AI images using imgx CLI.

## When to use this skill

- User asks to create, generate, or make an image
- User asks to edit, modify, or change an existing image
- User needs a cover image, diagram, screenshot, or visual asset
- User says "generate an image of..." or "edit this image to..."

Do NOT use this skill for non-image tasks (text generation, code generation, etc.).

## Generate image from text

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.bundle.js" generate \
  --prompt "Your detailed image description" \
  --output "./path/to/output.png" \
  --aspect-ratio "16:9" \
  --model "gemini-3-pro-image-preview"
```

## Edit existing image

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.bundle.js" edit \
  --input "./path/to/source.png" \
  --prompt "Change the background to cream color" \
  --output "./path/to/edited.png"
```

## Edit last output (iterative editing)

Use `--last` to automatically use the previous output as input:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.bundle.js" edit \
  --last \
  --prompt "Make the text larger" \
  --output "./final.png"
```

This works after any `generate` or `edit` command. Useful for refining results step by step.

## Examples

**Blog cover image:**
```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.bundle.js" generate \
  -p "A developer's desk with a laptop showing terminal output, coffee cup beside it, warm morning light, earth tones" \
  -o "./covers/blog-post-cover.png" -a "16:9" -r "2K"
```

**Edit to change style:**
```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.bundle.js" edit \
  -i "./covers/blog-post-cover.png" \
  -p "Make the color palette warmer, add slight vignette" \
  -o "./covers/blog-post-cover-v2.png"
```

**Generate multiple variants:**
```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.bundle.js" generate \
  -p "Minimalist coffee bean icon on white background" \
  -o "./icons/bean.png" -a "1:1" -n 3
```

## Parameters

| Flag | Short | Required | Description |
|------|-------|----------|-------------|
| --prompt | -p | Yes | Image description or edit instruction |
| --output | -o | No | Output file path (auto-generated if omitted) |
| --input | -i | edit only | Input image to edit |
| --last | -l | No | Use last output as input (edit only) |
| --aspect-ratio | -a | No | 1:1, 16:9, 9:16, 4:3, 3:4, 2:3, 3:2 |
| --resolution | -r | No | 1K, 2K, 4K |
| --count | -n | No | Number of images to generate |
| --model | -m | No | Model (default: gemini-3-pro-image-preview) |
| --provider | | No | Provider (default: gemini) |
| --output-dir | -d | No | Output directory |

## Other commands

```bash
# List providers and capabilities
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.bundle.js" providers
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.bundle.js" capabilities
```

## Output

JSON format:
```json
{"success": true, "filePaths": ["./output.png"]}
```

On error:
```json
{"success": false, "error": "error message"}
```

Always check the `success` field. If `false`, show the error message to the user.

## MCP tools

This plugin also registers an MCP server with the following tools. These are available to Claude Code directly without using Bash:

| Tool | Description |
|------|-------------|
| `generate_image` | Generate an image from a text prompt |
| `edit_image` | Edit an existing image with text instructions |
| `edit_last` | Edit the last generated/edited image (no input path needed) |
| `list_providers` | List available providers and capabilities |

The MCP tools accept the same parameters as the CLI. Use MCP tools when available; fall back to CLI via Bash if MCP is not connected.

## Environment

Requires `GEMINI_API_KEY`. Set via environment variable or `imgx config set api-key`.
