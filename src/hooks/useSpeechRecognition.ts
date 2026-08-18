/**
 * OWNER: PART A
 *
 * Wrap the Web Speech API (webkitSpeechRecognition on Chrome/Edge/Safari).
 * Chrome and Edge are the target browsers; Firefox has no support, so
 * `isSupported` must come back false there rather than crashing.
 *
 * DONE WHEN:
 *   - Interim results stream into `interim` while the user is still talking.
 *   - A finished phrase fires onFinal(text) exactly once.
 *   - Denying the mic permission surfaces a 'mic-permission' error, not a crash.
 *   - Rapid start/stop/start does not leave a dangling recognition instance.
 */
import type { AgentError } from '@/types'

export interface SpeechRecognitionHandle {
  isSupported: boolean
  isListening: boolean
  /** Partial text while speaking. */
  interim: string
  start: () => void
  stop: () => void
  error: AgentError | null
}

export interface UseSpeechRecognitionOptions {
  language: string
  onFinal: (text: string) => void
}

export function useSpeechRecognition(
  _opts: UseSpeechRecognitionOptions,
): SpeechRecognitionHandle {
  // TODO(Part A)
  // Note: keep the recognition object in a ref, not state — recreating it on
  // every render is the classic bug here.
  return {
    isSupported: false,
    isListening: false,
    interim: '',
    start: () => {},
    stop: () => {},
    error: null,
  }
}
