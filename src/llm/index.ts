/**
 * OWNER: PART A (one line; Part B never edits this file)
 *
 * The single swap point for the whole app. To move off Ollama later, implement
 * LLMProvider somewhere else and change the one assignment below.
 */
import { OllamaProvider } from './OllamaProvider'
import type { LLMProvider } from './types'

export const llm: LLMProvider = new OllamaProvider()

export * from './types'
