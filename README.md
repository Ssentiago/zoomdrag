# Zoomdrag

[![Downloads](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json&query=$.diagram-zoom-drag.downloads&label=downloads&style=for-the-badge)](https://obsidian.md/plugins?id=diagram-zoom-drag)
[![Release](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/Ssentiago/image-zoom-drag/main/manifest.json&query=$.version&label=release&style=for-the-badge)](https://github.com/Ssentiago/image-zoom-drag/releases/latest)

Interactive image viewer for Obsidian with zoom, drag, and multiple viewing modes.

## Before/After

[Before](https://github.com/user-attachments/assets/87fd24ae-dcc9-463d-a800-db006ab89154)

[After](https://github.com/user-attachments/assets/44ef62c1-32a5-4c78-b3ed-0169610524cb)

## Features

- Two viewing modes: Integrated and Popup
- Universal support for any SVG and IMG images
- Zoom in/out with mouse wheel or control buttons
- Drag images with mouse or arrow keys
- Fullscreen mode for better viewing
- Touch support for mobile devices
- Supports Mermaid, PlantUML, Graphviz, custom diagrams, and any images

## Installation

**Community Plugins:**
Settings → Community plugins → Browse → "Zoomdrag" → Install

**Manual installation:**

1. Download the latest release from [releases page](https://github.com/Ssentiago/image-zoom-drag/releases)
2. Extract to `VaultFolder/.obsidian/plugins/image-zoom-drag/`
3. Settings → Community plugins → Enable "Zoomdrag"

## Quick Start

After installation, images in your notes will automatically become interactive. Access the help guide via Settings → About → Help for detailed instructions.

## Development

**Quick setup:**

```bash
git clone https://github.com/Ssentiago/image-zoom-drag.git
cd image-zoom-drag
bun install
bun run dev  # Start development mode
```

**Commands:**

- `bun run dev` - Development → `test-vault/`
- `bun run build` - Production build → `dist/`

## Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

Want to help translate? Check out [TRANSLATION_GUIDE.md](docs/TRANSLATION_GUIDE.md).

## Documentation

Full documentation: [DOCS.md](docs/DOCS.md)

## Credits

Original idea by [@gitcpy](https://github.com/gitcpy)
