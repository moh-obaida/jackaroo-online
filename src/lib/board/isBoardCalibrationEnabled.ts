/** Dev-only board calibration — hidden unless explicitly enabled via env. */
export function isBoardCalibrationEnabled(): boolean {
  return (
    import.meta.env.VITE_BOARD_CALIBRATION === '1' ||
    import.meta.env.VITE_ENABLE_BOARD_CALIBRATION === 'true'
  );
}
