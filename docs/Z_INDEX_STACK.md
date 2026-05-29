# Z-index stack (10000+ and negative depths)

Jakaroo uses a **fixed depth stack** (inspired by Knowledge Connect overlay discipline, adapted for a board game). Components must use **CSS classes** from `src/styles/index.css`, not ad-hoc `z-index` or Tailwind `z-*`.

## Negative (under the table)

| Token | Value | Class | Use |
|-------|------:|-------|-----|
| `--jkr-z-deep-bg` | **-10000** | `.jkr-layer-deep-bg` | Page ambient, shell `::before` gradients |
| `--jkr-z-page-glow` | **-1000** | `.jkr-layer-page-glow` | Hero glow, decorative board preview |
| `--jkr-z-under-felt` | **-2** | `.jkr-layer-under-felt` | Felt shadow under play surface |

## Play surface (0 – 5000)

| Token | Value | Class | Use |
|-------|------:|-------|-----|
| `--jkr-z-felt` | 0 | `.jkr-layer-felt` | Fullscreen table root |
| `--jkr-z-board` | 10 | `.jkr-layer-board` | Wood rim, SVG board |
| `--jkr-z-seat` | 100 | `.jkr-layer-seat` | Opponent chips, lobby seat ring code |
| `--jkr-z-hand` | 1000 | `.jkr-layer-hand` | Hand dock, bottom rail |
| `--jkr-z-hand-top` | 1001 | `.jkr-layer-hand-top` | Selected / raised card |
| `--jkr-z-hud` | 5000 | `.jkr-layer-hud` | Turn cue, table HUD |
| `--jkr-z-site-chrome` | 5500 | `.jkr-layer-site-chrome` | Site header, connection bar |

## 10000+ (overlays only)

| Token | Value | Class | Use |
|-------|------:|-------|-----|
| `--jkr-z-scrim` | **9999** | `.jkr-layer-scrim` | Dim behind modal (optional) |
| `--jkr-z-modal` | **10000** | `.jkr-layer-modal` | Card guide, dialogs |
| `--jkr-z-toast` | **10001** | `.jkr-layer-toast` | Last event banner, transient hints |
| `--jkr-z-blocking` | **10002** | `.jkr-layer-blocking` | Win overlay |
| `--jkr-z-critical` | **10003** | `.jkr-layer-critical` | Error boundary fallback |

TypeScript: `import { JKR_LAYERS } from '../lib/ui/layers'`.

## What we do **not** copy from Knowledge Connect

- KC quiz UI, hex board, teacher host panels (`knowledge-connect-original-main`)
- KC’s `z-index: 99999` toast hack — we use the table above instead

## Related docs

- [CARDS_AND_RULES_REFERENCE.md](./CARDS_AND_RULES_REFERENCE.md) — Manus §8 + physical deck
- [ARCHITECTURE_REFERENCES.md](./ARCHITECTURE_REFERENCES.md) — Manus + KC session patterns
- [RESCUE_QA.md](./RESCUE_QA.md) — leave / Firebase QA
