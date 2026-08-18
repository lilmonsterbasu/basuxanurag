/**
 * ============================================================================
 *  SHARED CONTRACT — do not change without agreeing with the other half.
 * ============================================================================
 *  Part A implements `ConversationController`.
 *  Part B consumes `ConversationController`.
 *  Neither side needs to read the other's source as long as this file holds.
 * ============================================================================
 */

/** The four states the voice orb renders. */
export type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking'

/** Copy shown under the orb for each state. Part B renders these verbatim. */
export const STATE_LABEL: Record<AgentState, string> = {
  idle: 'Click to talk',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
}

export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  /** Final, committed text. Never a partial. */
  content: string
  /** Epoch milliseconds. */
  timestamp: number
}

export interface Settings {
  /** Ollama model tag, e.g. "llama3.2". */
  model: string
  /** System prompt prepended to every request. */
  systemPrompt: string
  /** SpeechSynthesis voice URI, or null for the browser default. */
  voiceURI: string | null
  /** 0.5 – 2.0 */
  speechRate: number
  /** 0 – 1 */
  speechPitch: number
  /** BCP-47 tag for SpeechRecognition, e.g. "en-US". */
  language: string
  /** Speak assistant replies aloud. */
  autoSpeak: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  model: 'llama3.2',
  systemPrompt:
    'You are a friendly voice assistant. Your replies are read aloud, so keep them short and conversational — two or three sentences at most. Never use markdown, lists, or emoji.',
  voiceURI: null,
  speechRate: 1,
  speechPitch: 1,
  language: 'en-US',
  autoSpeak: true,
}

/** Anything that went wrong, surfaced to the UI as a dismissible banner. */
export interface AgentError {
  kind: 'mic-permission' | 'no-speech-support' | 'llm-unreachable' | 'llm-error' | 'unknown'
  message: string
}

/**
 * ---------------------------------------------------------------------------
 *  THE SEAM.
 *  Part A returns exactly this from `useConversation()`.
 *  Part B's components receive exactly this (or slices of it) as props.
 * ---------------------------------------------------------------------------
 */
export interface ConversationController {
  /** Current orb state. */
  state: AgentState

  /** Committed conversation turns, oldest first. */
  messages: Message[]

  /**
   * Live, in-flight text.
   * While `listening`: the interim speech-recognition result.
   * While `thinking` / `speaking`: the assistant reply as it streams in.
   * Empty string when there is nothing in flight.
   */
  liveTranscript: string

  /**
   * Smoothed microphone loudness, 0..1. Drives the orb's reaction to voice.
   * Always 0 when not listening.
   */
  audioLevel: number

  /** Null when healthy. */
  error: AgentError | null

  /** True when the browser lacks SpeechRecognition (Part B shows a fallback). */
  isSupported: boolean

  /** Idle -> listening. No-op if already busy. */
  startListening: () => void
  /** Listening -> thinking. Commits whatever was heard. */
  stopListening: () => void
  /** Convenience for the mic button: start if idle, stop if listening. */
  toggleListening: () => void

  /** Stop speech playback immediately and return to idle. */
  cancelSpeaking: () => void

  /** Wipe messages and persisted history. */
  clearConversation: () => void

  /** Send text without using the microphone (keyboard fallback, debugging). */
  sendText: (text: string) => void

  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
}
