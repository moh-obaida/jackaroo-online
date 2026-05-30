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

`IMAGE_EXACT_POINTS` in `src/lib/board/imageBoardCoordinates.ts` holds **108 visual coordinates**:

| Category | Count |
|----------|------:|
| Base/nest per color (×4 colors) | 16 |
| Start/gate per color | 4 |
| Track per color (18 × 4) | 72 |
| Home per color (4 × 4) | 16 |
| **Total** | **108** |

### Track order warning

Track arrays **must match engine order**, not arbitrary visual clockwise clicking.

- Order follows `BoardPosition { color, type: "track", index }` and `getGlobalTrackIndex()` in `src/lib/game/board.ts`.
- Geometry builds clockwise from black’s gate along `boardGeometry.ts` outer track (`buildOuterTrackFromWaypoints`).
- `black:track:0` is the first track spot after black’s start gate in engine order; `black:track:17` is the last spot before green’s section.
- Use calibration overlay labels (`B T1`, `G T1`, …) to verify index ↔ hole before pasting coordinates.
- **Do not reorder track arrays visually** unless `boardGeometry` / engine order changes.

**Current map (2026-05-30):** 108 live-clicked coordinates, classified into `IMAGE_EXACT_POINTS`. Base/nest clusters (clicks 80–83, 92–107) are **mathematically normalized** to balanced NW/NE/SW/SE squares around each cluster center (see comments in `imageBoardCoordinates.ts`). Green home (104–107) is linearized along its diagonal; black/blue/white V-shaped home paths keep clicked shape with engine order. Marbles use reduced radii so hole rims stay visible.

**Board display:** gameplay stage uses `width: min(100%, max-height)` + `aspect-ratio: 1` so the square board is not cropped by overflow. Image and SVG overlay share the same box (`object-fit: contain`). Re-verify after any board image change; disable calibration in production.

Optional hole-assisted draft: `node scripts/extract-image-exact-points.mjs` (review only; do not paste blindly over live clicks).

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
3. Click exact center of each hole; copy `{ x, y }` from console or dev panel.
4. Paste into `IMAGE_EXACT_POINTS` (or `IMAGE_COORDINATE_OVERRIDES` for emergency single-point fixes).
5. Refresh and verify marbles, rings, and hit zones.
6. Test desktop, tablet, mobile widths.
7. **Disable calibration before production.**

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
