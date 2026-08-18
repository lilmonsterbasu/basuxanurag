/**
 * ============================================================================
 *  SHARED CONTRACT — the LLM abstraction.
 * ============================================================================
 *
 *   LLMProvider
 *       |-- OllamaProvider     (Part A builds this)
 *       `-- FutureProvider     (drop-in later: llama.cpp, LM Studio, WebLLM...)
 *
 *  Swapping providers must never require touching a component or a hook other
 *  than the one line in src/llm/index.ts that picks the active provider.
 * ============================================================================
 */

export interface ChatTurn {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatTurn[]
  model: string
  /** Abort mid-stream when the user interrupts. */
  signal?: AbortSignal
}

export interface LLMProvider {
  /** Stable id, e.g. "ollama". */
  readonly id: string
  /** Human label for the settings panel. */
  readonly name: string

  /** Is the backend reachable right now? Used for the connection indicator. */
  isAvailable(): Promise<boolean>

  /** Model tags the backend currently has pulled. Empty array if unknown. */
  listModels(): Promise<string[]>

  /**
   * Stream a reply token-by-token.
   * Implementations MUST yield incremental chunks (not the whole reply at the
   * end) so the UI can show text arriving while the model is still writing.
   */
  chat(req: ChatRequest): AsyncIterable<string>
}

/** Thrown by providers so the UI can distinguish "not running" from "broke". */
export class LLMUnreachableError extends Error {
  constructor(message = 'Could not reach the local model server.') {
    super(message)
    this.name = 'LLMUnreachableError'
  }
}
