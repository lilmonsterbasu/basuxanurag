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
import { useCallback, useEffect, useRef, useState } from 'react'
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

function getSpeechRecognitionCtor(): typeof SpeechRecognition | undefined {
  if (typeof window === 'undefined') return undefined
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

export function useSpeechRecognition(
  opts: UseSpeechRecognitionOptions,
): SpeechRecognitionHandle {
  const Ctor = getSpeechRecognitionCtor()
  const isSupported = Ctor != null

  const [isListening, setIsListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<AgentError | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  // Keep the latest callback/language without recreating the recognizer on every render.
  const onFinalRef = useRef(opts.onFinal)
  onFinalRef.current = opts.onFinal
  const languageRef = useRef(opts.language)
  languageRef.current = opts.language

  const teardown = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    rec.onresult = null
    rec.onerror = null
    rec.onend = null
    rec.onstart = null
    try {
      rec.abort()
    } catch {
      // Already stopped — fine.
    }
    recognitionRef.current = null
  }, [])

  useEffect(() => teardown, [teardown])

  const start = useCallback(() => {
    if (!isSupported || !Ctor) {
      setError({ kind: 'no-speech-support', message: 'Speech recognition is not supported in this browser.' })
      return
    }
    if (recognitionRef.current) return // already running

    setError(null)
    setInterim('')

    const rec = new Ctor()
    rec.lang = languageRef.current
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => setIsListening(true)

    rec.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0]?.transcript ?? ''
        if (result.isFinal) finalText += transcript
        else interimText += transcript
      }
      if (interimText) setInterim(interimText)
      if (finalText.trim()) {
        setInterim('')
        onFinalRef.current(finalText.trim())
      }
    }

    rec.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError({ kind: 'mic-permission', message: 'Microphone access was denied.' })
      } else if (event.error === 'no-speech') {
        // Not a real error — just nothing was heard before the recognizer gave up.
      } else {
        setError({ kind: 'unknown', message: `Speech recognition error: ${event.error}` })
      }
    }

    rec.onend = () => {
      setIsListening(false)
      setInterim('')
      recognitionRef.current = null
    }

    recognitionRef.current = rec
    try {
      rec.start()
    } catch {
      // start() throws if called while already started; safe to ignore.
    }
  }, [Ctor, isSupported])

  const stop = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    try {
      rec.stop()
    } catch {
      // Already stopped.
    }
  }, [])

  return { isSupported, isListening, interim, start, stop, error }
}
