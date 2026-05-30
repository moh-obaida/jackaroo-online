# Board coordinate calibration

Developer-only tool for aligning marbles, legal target rings, hit zones, and calibration dots with the holes on the premium gameplay board image.

**Do not calibrate from screenshots.** Calibrate inside the running app on the rendered board image. Screenshots may include browser scaling, device pixel ratio, and layout shifts that do not match the live coordinate system.

## Coordinate system

- Values are **percentages from 0 to 100** in the SVG overlay `viewBox="0 0 100 100"`.
- `(0, 0)` is the top-left of the board stage; `(100, 100)` is the bottom-right.
- The overlay and board image share the same rendered box (`object-fit: contain`, no distortion).
- Asset: `public/assets/board/jakaroo-board-game-empty.png` (1024×1024, square).

All gameplay visuals must use the same lookup:

```ts
getImagePointForBoardPosition(position)
// or
getBoardVisualPoint(position)
```

## Full exact map (primary source)

`IMAGE_EXACT_POINTS` in `src/lib/board/imageBoardCoordinates.ts` holds **108 visual coordinates** (inline, manually recalibrated):

| Category | Count |
|----------|------:|
| Base/nest per color (×4 colors) | 16 |
| Start/gate per color | 4 |
| Track per color (18 × 4) | 72 |
| Home per color (4 × 4) | 16 |
| **Total** | **108** |

### Capture order (nest-first)

Click holes in this order when recalibrating:

1. **Base/nest clusters** — black, green, blue, white (4 each)
2. **Home/scoring paths** — black, green, blue, white (4 each)
3. **Playable perimeter** — starting at black gate, continuing around the board (excluding home paths already clicked)

### Click index → bucket map

| Click indices | Bucket |
|---------------|--------|
| 0–3 | `base.black` |
| 4–7 | `base.green` |
| 8–11 | `base.blue` |
| 12–15 | `base.white` |
| 16–19 | `home.black` |
| 20–23 | `home.green` |
| 24–27 | `home.blue` |
| 28–31 | `home.white` |
| 32 | `gates.black` |
| 33–50 | `track.black` (18 spaces) |
| 51 | `gates.green` |
| 52–69 | `track.green` (18 spaces) |
| 70 | `gates.blue` |
| 71–88 | `track.blue` (18 spaces) |
| 89 | `gates.white` |
| 90–107 | `track.white` (18 spaces) |

**Removed stray point:** `{ x: 32.15, y: 71.24 }` was an accidental 5th white-home click. Drop it before mapping or gate/track indices shift by one.

See `CALIBRATION_CLICK_MAP` in `imageBoardCoordinates.ts` for the same index table.

### Track order warning

Track arrays **must match engine order**, not arbitrary visual clockwise clicking.

- Order follows `BoardPosition { color, type: "track", index }` and `getGlobalTrackIndex()` in `src/lib/game/board.ts`.
- Geometry builds clockwise from black’s gate along `boardGeometry.ts` outer track (`buildOuterTrackFromWaypoints`).
- `black:track:0` is the first track spot after black’s start gate in engine order; `black:track:17` is the last spot before green’s section.
- Use calibration overlay labels (`B T1`, `G T1`, …) to verify index ↔ hole before pasting coordinates.
- **Do not reorder track arrays visually** unless `boardGeometry` / engine order changes.

### Mathematical cleanup (2026-05-30 recalibration)

Applied after manual clicks:

- **Base nests:** top/bottom pairs share x; left/right pairs share y per color cluster.
- **Home paths:** straight diagonals with equal spacing between start and end per color.
- **Track straights:** top row ~y 25.45; right column ~x 71.68; bottom row y 74.21; left column ~x 28.26; diagonals lightly cleaned while preserving path shape.

**Board display:** gameplay stage uses `width: min(100%, max-height)` + `aspect-ratio: 1` so the square board is not cropped by overflow. Image and SVG overlay share the same box (`object-fit: contain`). Re-verify after any board image change; disable calibration in production.

Optional hole-assisted draft: `node scripts/extract-image-exact-points.mjs` (review only; do not paste blindly over live clicks).

Legacy JSON pipeline (`board-coordinates.json` + `buildImageExactPointsFromCalibration.ts`) is not the gameplay source of truth for this revision.

## Enable calibration mode

```env
VITE_ENABLE_BOARD_CALIBRATION=true
# or
VITE_BOARD_CALIBRATION=1
```

Restart dev server. Open the **gameplay** board (not lobby preview alone). When disabled, zero calibration UI.

## Workflow

1. Enable calibration.
2. Open gameplay board in the running app.
3. Click exact center of each hole in nest-first order; copy `{ x, y }` from console or dev panel.
4. Remove any accidental extra clicks (see stray-point note above).
5. Paste values into `IMAGE_EXACT_POINTS` in `src/lib/board/imageBoardCoordinates.ts`, or use `IMAGE_COORDINATE_OVERRIDES` for single-point fixes.
6. Refresh and verify marbles, rings, and hit zones.
7. Test desktop, tablet, mobile widths.
8. **Disable calibration before production.**

## Lookup order

1. `IMAGE_COORDINATE_OVERRIDES[boardPositionImageKey(position)]`
2. `IMAGE_EXACT_POINTS` (type / color / index)
3. `IMAGE_HOME_LANE_FALLBACK` (home only, emergency)
4. Procedural geometry + `boardInset` (emergency)

## Key format

```ts
boardPositionImageKey(position) // "black:track:0", "green:start_gate:0", …
```

Types match `BoardPosition.type`: `base`, `start_gate`, `track`, `home`.

## Click helper

Stage click logs `{ x, y }` and a paste-ready line. Hit-zone click also logs position key and override snippet. Floating panel shows cursor and last click.

## Visual debug (calibration on)

| Type | Dot color |
|------|-----------|
| Track | Gold |
| Start gate | Cyan |
| Home | Blue |
| Base | Green |

## Lobby preview

Same component, but **not** the calibration source of truth. Always verify on full gameplay board.

## Testing

See [RESCUE_QA.md](./RESCUE_QA.md) — Board map QA checklist.

Dev validation helper: `validateImageExactPointCounts()` in `imageBoardCoordinates.ts`.
