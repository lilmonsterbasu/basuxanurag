/**
 * OWNER: PART A
 *
 * Wrap window.speechSynthesis.
 *
 * Two known traps, budget for both:
 *   1. getVoices() is empty on first call in Chrome — you must also listen for
 *      the 'voiceschanged' event.
 *   2. Chrome silently stops long utterances after ~15s. Either chunk the text
 *      by sentence, or run the usual pause()/resume() keepalive timer.
 *
 * DONE WHEN:
 *   - speak() resolves/notifies when playback actually ends.
 *   - cancel() stops audio immediately, mid-word.
 *   - A 60-second reply plays all the way through in Chrome.
 */
import type { Settings } from '@/types'

export interface SpeechSynthesisHandle {
  isSpeaking: boolean
  voices: SpeechSynthesisVoice[]
  speak: (text: string, onEnd?: () => void) => void
  cancel: () => void
}

export function useSpeechSynthesis(_settings: Settings): SpeechSynthesisHandle {
  // TODO(Part A)
  return {
    isSpeaking: false,
    voices: [],
    speak: (_t, onEnd) => onEnd?.(),
    cancel: () => {},
  }
}
