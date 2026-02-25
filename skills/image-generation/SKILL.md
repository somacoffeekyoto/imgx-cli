# Image Generation & Editing Skill

Generate and edit AI images using imgx CLI.

## Generate image from text

```bash
node "IMGX_CLI_PATH/dist/cli.bundle.js" generate \
  --prompt "Your detailed image description" \
  --output "./path/to/output.png" \
  --aspect-ratio "16:9" \
  --model "gemini-3-pro-image-preview"
```

## Edit existing image

```bash
node "IMGX_CLI_PATH/dist/cli.bundle.js" edit \
  --input "./path/to/source.png" \
  --prompt "Change the background to cream color" \
  --output "./path/to/edited.png"
```

## Parameters

| Flag | Short | Required | Description |
|------|-------|----------|-------------|
| --prompt | -p | Yes | Image description or edit instruction |
| --output | -o | No | Output file path (auto-generated if omitted) |
| --input | -i | edit only | Input image to edit |
| --aspect-ratio | -a | No | 1:1, 16:9, 9:16, 4:3, 3:4, 2:3, 3:2 |
| --resolution | -r | No | 1K, 2K, 4K |
| --count | -n | No | Number of images to generate |
| --model | -m | No | Model (default: gemini-3-pro-image-preview) |
| --provider | | No | Provider (default: gemini) |
| --output-dir | -d | No | Output directory |

## Other commands

```bash
# List providers and capabilities
node "IMGX_CLI_PATH/dist/cli.bundle.js" providers
node "IMGX_CLI_PATH/dist/cli.bundle.js" capabilities
```

## Output

JSON format:
```json
{"success": true, "filePaths": ["./output.png"]}
```

## Environment

Requires `GEMINI_API_KEY` environment variable.
