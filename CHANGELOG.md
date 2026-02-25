# Changelog

## 0.1.0 (2026-02-26)

Initial release.

- `generate` command: text-to-image generation
- `edit` command: image editing with text instructions
- `providers` command: list available providers
- `capabilities` command: show provider capabilities
- Gemini provider with 7 capabilities (generate, edit, aspect ratio, resolution, multi-output, reference images, person control)
- Capability-based provider abstraction (model-independent core + model-dependent providers)
- JSON output for scripting and tool integration
- Single-file esbuild bundle
- Claude Code Skill included (`skills/image-generation/SKILL.md`)
