/**
 * OWNER: PART A  —  this is the centrepiece of Part A.
 *
 * The state machine that ties everything together:
 *
 *   idle --startListening--> listening --(final transcript)--> thinking
 *     ^                                                           |
 *     |                                                  (reply fully streamed)
 *     |                                                           v
 *     `-----------(playback ends / cancelSpeaking)----------- speaking
 *
 * "thinking" covers the whole LLM generation — liveTranscript fills in as
 * tokens stream so the user sees the reply arrive, same as the spec's
 * "watch the reply stream in, hear it read aloud". Only once the full reply
 * is in hand does state move to "speaking" and speechSynthesis starts.
 *
 * Responsibilities:
 *   - own `messages`, append the user turn on final transcript
 *   - build the request: system prompt + prior turns + the new user turn
 *   - stream from `llm.chat(...)` into `liveTranscript`
 *   - on stream end, commit the assistant Message and hand the text to
 *     useSpeechSynthesis (only when settings.autoSpeak)
 *   - persist through src/lib/storage on every change
 *   - map thrown errors onto AgentError
 *
 * DONE WHEN:
 *   - The full loop runs end to end with Ollama on: speak -> see text ->
 *     see reply stream -> hear reply -> back to idle.
 *   - Killing Ollama mid-conversation produces the 'llm-unreachable' banner and
 *     returns the machine to idle, never a stuck 'thinking'.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { llm, LLMUnreachableError } from '@/llm'
import { clearAll, loadMessages, loadSettings, saveMessages, saveSettings } from '@/lib/storage'
import type { AgentError, AgentState, ConversationController, Message, Settings } from '@/types'
import { useAudioLevel } from './useAudioLevel'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useSpeechSynthesis } from './useSpeechSynthesis'

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function mapError(err: unknown): AgentError {
  if (err instanceof LLMUnreachableError) {
    return {
      kind: 'llm-unreachable',
      message: 'Could not reach Ollama. Make sure `ollama serve` is running, then try again.',
    }
  }
  if (err instanceof Error) {
    return { kind: 'llm-error', message: err.message }
  }
  return { kind: 'unknown', message: 'Something went wrong.' }
}

export function useConversation(): ConversationController {
  const [state, setState] = useState<AgentState>('idle')
  const [messages, setMessages] = useState<Message[]>(() => loadMessages())
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [liveReply, setLiveReply] = useState('')
  const [error, setError] = useState<AgentError | null>(null)

  const messagesRef = useRef(messages)
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // Declared before runAssistantTurn because that callback needs `speak`.
  // `speak`/`cancel` are stable useCallbacks, so depending on them directly
  // doesn't recreate the turn handler on every render.
  const synthesis = useSpeechSynthesis(settings)
  const { speak, cancel: cancelSynthesis } = synthesis

  const runAssistantTurn = useCallback(async (history: Message[]) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const s = settingsRef.current
    setLiveReply('')

    try {
      let full = ''
      for await (const chunk of llm.chat({
        model: s.model,
        signal: controller.signal,
        messages: [
          { role: 'system', content: s.systemPrompt },
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ],
      })) {
        full += chunk
        setLiveReply(full)
      }

      if (controller.signal.aborted) return

      const trimmed = full.trim()
      const assistantMessage: Message = {
        id: newId(),
        role: 'assistant',
        content: trimmed,
        timestamp: Date.now(),
      }
      const finalMessages = [...history, assistantMessage]
      messagesRef.current = finalMessages
      setMessages(finalMessages)
      setLiveReply('')

      if (s.autoSpeak && trimmed) {
        setState('speaking')
        speak(trimmed, () => setState('idle'))
      } else {
        setState('idle')
      }
    } catch (err) {
      if (controller.signal.aborted) return
      setError(mapError(err))
      setLiveReply('')
      setState('idle')
    }
  }, [speak])

  const handleFinal = useCallback(
    (text: string) => {
      if (!text.trim()) return
      const userMessage: Message = {
        id: newId(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      }
      const nextMessages = [...messagesRef.current, userMessage]
      messagesRef.current = nextMessages
      setMessages(nextMessages)
      setError(null)
      setState('thinking')
      void runAssistantTurn(nextMessages)
    },
    [runAssistantTurn],
  )

  const recognition = useSpeechRecognition({
    language: settings.language,
    onFinal: handleFinal,
  })
  const audioLevel = useAudioLevel(state === 'listening')

  // If the recognizer stops on its own (silence timeout) without ever
  // producing a final transcript, fall back to idle instead of hanging.
  useEffect(() => {
    if (!recognition.isListening) {
      setState((prev) => (prev === 'listening' ? 'idle' : prev))
    }
  }, [recognition.isListening])

  useEffect(() => {
    if (recognition.error) {
      setError(recognition.error)
      setState((prev) => (prev === 'listening' ? 'idle' : prev))
    }
  }, [recognition.error])

  const startListening = useCallback(() => {
    if (state !== 'idle') return
    if (!recognition.isSupported) {
      setError({ kind: 'no-speech-support', message: 'Speech recognition is not supported in this browser.' })
      return
    }
    setError(null)
    setState('listening')
    recognition.start()
  }, [state, recognition])

  const stopListening = useCallback(() => {
    if (state !== 'listening') return
    recognition.stop()
  }, [state, recognition])

  const toggleListening = useCallback(() => {
    if (state === 'idle') startListening()
    else if (state === 'listening') stopListening()
  }, [state, startListening, stopListening])

  const cancelSpeaking = useCallback(() => {
    cancelSynthesis()
    abortRef.current?.abort()
    setLiveReply('')
    setState('idle')
  }, [cancelSynthesis])

  const clearConversation = useCallback(() => {
    abortRef.current?.abort()
    cancelSynthesis()
    recognition.stop()
    clearAll()
    messagesRef.current = []
    setMessages([])
    setLiveReply('')
    setError(null)
    setState('idle')
  }, [cancelSynthesis, recognition])

  const sendText = useCallback(
    (text: string) => {
      if (!text.trim()) return
      abortRef.current?.abort()
      cancelSynthesis()
      setError(null)
      handleFinal(text)
    },
    [handleFinal, cancelSynthesis],
  )

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const liveTranscript = state === 'listening' ? recognition.interim : liveReply

  return {
    state,
    messages,
    liveTranscript,
    audioLevel,
    error,
    isSupported: recognition.isSupported,
    startListening,
    stopListening,
    toggleListening,
    cancelSpeaking,
    clearConversation,
    sendText,
    settings,
    updateSettings,
  }
}
