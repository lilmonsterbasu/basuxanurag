/**
 * OWNER: PART A
 *
 * Feed the orb's reaction to the user's voice.
 *
 * getUserMedia -> AudioContext -> AnalyserNode -> RMS over the time-domain
 * buffer, smoothed, normalised to 0..1, sampled on requestAnimationFrame.
 *
 * DONE WHEN:
 *   - Returns a steady 0 when `active` is false.
 *   - Releases the mic track and closes the AudioContext when it stops (check
 *     the browser tab's recording dot actually goes away).
 *   - The value is smooth enough to drive an animation without jitter.
 */
export function useAudioLevel(_active: boolean): number {
  // TODO(Part A)
  return 0
}
