/**
 * Validates src/lib/board/board-coordinates.json bucket classification.
 * Run: node scripts/validate-board-coordinates.mjs
 */

import { buildImageExactPointsFromCalibration, validateCalibrationBuckets, CALIBRATION_CLICK_MAP } from '../src/lib/board/buildImageExactPointsFromCalibration.ts';

const points = buildImageExactPointsFromCalibration();
const result = validateCalibrationBuckets(points);

if (result.warnings.length > 0) {
  console.warn('Warnings:');
  for (const w of result.warnings) console.warn(' -', w);
}

if (!result.ok) {
  console.error('Board coordinate validation failed:');
  for (const e of result.errors) console.error(' -', e);
  process.exit(1);
}

console.log('Board coordinates OK — 108 clicks classified.');
console.log('Track lengths:', Object.fromEntries(
  Object.entries(CALIBRATION_CLICK_MAP.track).map(([c, idxs]) => [c, idxs.length])
));
