/**
 * OWNER: PART A  —  this is the centrepiece of Part A.
 *
 * The state machine that ties everything together:
 *
 *   idle --startListening--> listening --(final transcript)--> thinking
 *     ^                                                           |
 *     |                                                    (first token)
 *     |                                                           v
 *     `-----------(playback ends / cancelSpeaking)----------- speaking
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
import { DEFAULT_SETTINGS, type ConversationController } from '@/types'

export function useConversation(): ConversationController {
  // TODO(Part A): compose useSpeechRecognition + useAudioLevel +
  // useSpeechSynthesis + llm.chat + storage into the object below.
  return {
    state: 'idle',
    messages: [],
    liveTranscript: '',
    audioLevel: 0,
    error: null,
    isSupported: true,
    startListening: () => {},
    stopListening: () => {},
    toggleListening: () => {},
    cancelSpeaking: () => {},
    clearConversation: () => {},
    sendText: () => {},
    settings: DEFAULT_SETTINGS,
    updateSettings: () => {},
  }
}
