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

Marble centers, legal target rings, hit zones, and calibration dots all call this function.

## Enable calibration mode

Set **one** of these in `.env.local` (never commit enabled values to production):

```env
VITE_ENABLE_BOARD_CALIBRATION=true
# or
VITE_BOARD_CALIBRATION=1
```

Restart the dev server, then open a **game** or lobby with the board visible.

When disabled (default), there is **zero** calibration UI, no console logs, and no click handlers.

## Workflow

1. Enable calibration (see above).
2. Open the app and navigate to an active **gameplay** board (not a cropped screenshot).
3. Click the center of each hole that needs tuning.
4. Copy the logged `{ x, y }` values from the browser console or the floating dev panel.
5. Paste into `src/lib/board/imageBoardCoordinates.ts`:
   - Per-point override: `IMAGE_COORDINATE_OVERRIDES` keyed by `"color:type:index"`.
   - Or fill `IMAGE_EXACT_POINTS` sections when ready for full image-based mapping.
6. Refresh and verify marbles, rings, and hit zones align.
7. Test on desktop (1280+), laptop, iPad/tablet width, and mobile landscape if supported.
8. **Disable calibration** before production deploy.

## Where to paste coordinates

### Per-point overrides (recommended while tuning)

```ts
const IMAGE_COORDINATE_OVERRIDES: Partial<Record<string, BoardImagePoint>> = {
  "black:track:0": { x: 52.34, y: 18.92 },
  "green:start_gate:0": { x: 75.10, y: 50.00 },
};
```

Key format: `boardPositionImageKey(position)` → `"color:type:index"`.

### Full exact map (future)

`IMAGE_EXACT_POINTS` holds arrays per color for track, home, base, and gate points. Procedural fallback remains active until every slot is filled.

## Lookup order

`getImagePointForBoardPosition` resolves in this order:

1. `IMAGE_COORDINATE_OVERRIDES` (exact key match)
2. `IMAGE_EXACT_POINTS` (when that category is fully populated)
3. Home lane manual points (`IMAGE_HOME_LANE_POINTS`)
4. Procedural geometry + `IMAGE_BOARD_CALIBRATION.boardInset`

## Using the click helper

Click anywhere on the board stage. The console prints:

```ts
{ x: 52.34, y: 18.92 }
```

And a ready-to-paste line:

```ts
{ x: 52.34, y: 18.92 },
```

Clicking a mapped hit zone also logs the logical position key and override snippet.

A floating dev panel (top-right) shows live cursor `x`/`y` and the last click.

## Visual debug (calibration on)

| Position type | Dot color |
|---------------|-----------|
| Track         | Gold      |
| Start gate    | Cyan      |
| Home          | Blue      |
| Base          | Green     |

Labels appear on hover or when a point is selected. Demo/game marbles render above the dots.

## Lobby preview

The lobby mini-board uses the same `ImageMappedBoardVisual` component but is **not** the source of truth for calibration. Always tune on the full gameplay board first.

## Testing checklist

See [RESCUE_QA.md](./RESCUE_QA.md) — Board calibration checklist.
