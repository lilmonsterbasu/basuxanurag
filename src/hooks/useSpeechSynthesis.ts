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
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Settings } from '@/types'

export interface SpeechSynthesisHandle {
  isSpeaking: boolean
  voices: SpeechSynthesisVoice[]
  speak: (text: string, onEnd?: () => void) => void
  cancel: () => void
}

const KEEPALIVE_MS = 12_000

// Split on sentence-ish boundaries so each utterance stays well under
// Chrome's ~15s cutoff, and so cancel() can interrupt between sentences too.
function splitIntoChunks(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*(\s+|$)/g)
  const chunks = (sentences ?? [text]).map((s) => s.trim()).filter(Boolean)
  return chunks.length > 0 ? chunks : [text]
}

export function useSpeechSynthesis(settings: Settings): SpeechSynthesisHandle {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const queueRef = useRef<string[]>([])
  const onEndRef = useRef<(() => void) | undefined>(undefined)
  const keepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!isSupported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [isSupported])

  const clearKeepalive = useCallback(() => {
    if (keepaliveRef.current !== null) {
      clearInterval(keepaliveRef.current)
      keepaliveRef.current = null
    }
  }, [])

  const startKeepalive = useCallback(() => {
    clearKeepalive()
    // Chrome pauses/garbles speech synthesis after ~15s of silence in the
    // event loop; nudging pause()/resume() periodically keeps it alive.
    keepaliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }
    }, KEEPALIVE_MS)
  }, [clearKeepalive])

  const speakNextChunk = useCallback(() => {
    const next = queueRef.current.shift()
    if (next === undefined) {
      setIsSpeaking(false)
      clearKeepalive()
      if (!cancelledRef.current) onEndRef.current?.()
      return
    }

    const s = settingsRef.current
    const utterance = new SpeechSynthesisUtterance(next)
    utterance.rate = s.speechRate
    utterance.pitch = s.speechPitch
    utterance.lang = s.language
    if (s.voiceURI) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === s.voiceURI)
      if (voice) utterance.voice = voice
    }

    utterance.onend = () => {
      if (!cancelledRef.current) speakNextChunk()
    }
    utterance.onerror = () => {
      if (!cancelledRef.current) speakNextChunk()
    }

    window.speechSynthesis.speak(utterance)
  }, [clearKeepalive])

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported || !text.trim()) {
        onEnd?.()
        return
      }
      window.speechSynthesis.cancel()
      cancelledRef.current = false
      onEndRef.current = onEnd
      queueRef.current = splitIntoChunks(text)
      setIsSpeaking(true)
      startKeepalive()
      speakNextChunk()
    },
    [isSupported, speakNextChunk, startKeepalive],
  )

  const cancel = useCallback(() => {
    cancelledRef.current = true
    queueRef.current = []
    clearKeepalive()
    if (isSupported) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [clearKeepalive, isSupported])

  useEffect(() => cancel, [cancel])

  return { isSpeaking, voices, speak, cancel }
}
