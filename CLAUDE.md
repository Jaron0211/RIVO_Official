# CLAUDE.md

This file provides guidance for AI assistants working with the RIVO Landing project.

## Project Overview

**RIVO Landing** is the official website and documentation portal for RIVO - an IoT robot fleet management platform. The site is a static website built with vanilla HTML, CSS, and JavaScript (no build step required).

## Key Features

- **Landing Page** (`index.html`) - Product showcase with pricing tiers, features, testimonials, and contact form
- **Technical Documentation** (`docs/`) - Bilingual wiki (Chinese/English) using i18n system
- **RIVO Node Protocol Generator** - Visual node-based editor for sensor configuration

## Directory Structure

```
rivo_landing/
├── index.html               # Main landing page
├── style.css                # Global styles
├── CLAUDE.md                # This file - AI assistant guide
├── assets/                  # Images and logos
├── docs/                    # Documentation center (i18n-enabled)
│   ├── index.html           # Redirects to getting-started.html
│   ├── style.css            # Docs styles
│   ├── i18n.js              # Translation loader
│   ├── locales/             # Translation files
│   │   ├── en.json          # English translations
│   │   └── zh.json          # Chinese translations
│   ├── getting-started.html # Unified i18n page
│   ├── api-guide.html       # Unified i18n page
│   ├── custom-schemas.html  # Unified i18n page
│   ├── deployment-config.html
│   ├── advanced.html
│   ├── troubleshooting.html
│   └── protocol-creator.html
└── src/                     # JavaScript modules
    ├── simple-node-editor.js    # Visual node editor core
    ├── yaml-generator.js        # YAML output generation
    ├── property-editor.js       # Node property editing
    ├── template-manager.js      # Sensor template loader
    ├── template-browser.js      # Template browser UI
    ├── protocol-config.js       # Protocol configuration
    ├── decoder-builder.js       # Decoder construction
    └── sensor-templates/        # Sensor template YAMLs
```

## Quick Commands

```bash
# Start local development server
cd /home/jaron0211/workspace/KairoIO_master/rivo_landing
python3 -m http.server 8080

# View at http://127.0.0.1:8080
```

## Key Entry Points

| Page | Path | Description |
|------|------|-------------|
| Landing Page | `/index.html` | Main product page |
| Docs | `/docs/getting-started.html` | Documentation with i18n |
| Protocol Creator | `/docs/protocol-creator.html` | Visual editor with templates |

## i18n System

The documentation uses a lightweight i18n system:

**Files:**
- `docs/i18n.js` - Translation loader
- `docs/locales/en.json` - English translations
- `docs/locales/zh.json` - Chinese translations

**Usage in HTML:**
```html
<!-- Text content -->
<h1 data-i18n="gettingStarted.title">Getting Started</h1>

<!-- HTML content -->
<p data-i18n="gettingStarted.note" data-i18n-html>...</p>

<!-- Language switch buttons -->
<button onclick="setLang('en')" data-lang-switch="en">EN</button>
<button onclick="setLang('zh')" data-lang-switch="zh">繁中</button>
```

**Language Selection Priority:**
1. URL parameter: `?lang=zh`
2. localStorage: `rivo-docs-lang`
3. Browser language
4. Default: English

## Core Components

### SimpleNodeEditor (`src/simple-node-editor.js`)
Lightweight visual node editor with no external dependencies.

**Node Types:**
- `input/sensor`, `input/constant`
- `process/calibration`, `process/binary_op`, `process/bit_shift`, `process/bit_mask`
- `output/status`, `output/telemetry`

### TemplateManager (`src/template-manager.js`)
Manages sensor template loading and filtering.

## Design System

### Colors
| Purpose | Value |
|---------|-------|
| Primary | `#000000` |
| Background | `#FFFFFF`, `#F5F5F5`, `#FAFAFA` |
| Border | `#E5E5E5` |
| Text Secondary | `#737373` |
| Success | `#22C55E` |

### Typography
- **Headlines:** `Space Grotesk`, `Noto Sans TC`
- **Body:** `Public Sans`, `Noto Sans TC`
- **Code:** `Space Mono`

### Breakpoints
- Mobile: `max-width: 768px`
- Tablet: `max-width: 1024px`

## Available Workflows (`.agent/workflows/`)

| Workflow | Description |
|----------|-------------|
| `/local-dev` | Start local development server |
| `/project-structure` | Project structure overview |
| `/add-docs-page` | Add new documentation page (i18n) |
| `/add-node-type` | Add new node type to visual editor |
| `/add-sensor-template` | Add sensor template to database |

## Common Tasks

### Adding a New Documentation Page
1. Create `docs/new-page.html` with i18n attributes
2. Add translation keys to `docs/locales/en.json` and `zh.json`
3. Update sidebar links in all doc pages

### Adding Translations
1. Add keys to both `docs/locales/en.json` and `zh.json`
2. Use `data-i18n="key.path"` in HTML elements
3. Use `data-i18n-html` for HTML content

## Notes

- Static site, no build step required
- Refresh browser to see changes (use Ctrl+Shift+R for cache clear)
- Contact form uses Formspree (`https://formspree.io/f/mqakvjzd`)

## Sync Checklist

- If the node YAML protocol schema changes, update `src/protocol-config.js`, `src/yaml-generator.js`, and `src/protocol-schema-docs.md`, then sync with `RIVO_Node/RIVO_CUSTOM_PROTOCOL_SKILL.md`.
- If server REST payloads change, update the relevant docs pages in `docs/` and the root `CLAUDE.md`.
- If new node types or decoders are added, update `src/simple-node-editor.js`, `src/template-manager.js`, and `src/protocol-schema-docs.md`.
