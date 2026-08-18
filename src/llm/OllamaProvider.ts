/**
 * OWNER: PART A
 *
 * Talk to a local Ollama server through the Vite proxy at /api/ollama.
 * (Do not hardcode http://localhost:11434 — the proxy in vite.config.ts exists
 * so the browser never hits a cross-origin request.)
 *
 * Endpoints you need:
 *   GET  /api/ollama/api/tags   -> { models: [{ name: "llama3.2:latest", ... }] }
 *   POST /api/ollama/api/chat   -> newline-delimited JSON stream
 *        body: { model, messages, stream: true }
 *        each line: { message: { content: "..." }, done: false }
 *
 * DONE WHEN:
 *   - isAvailable() resolves false (never throws) when Ollama is not running.
 *   - chat() yields partial chunks as they arrive, not one blob at the end.
 *   - Aborting `signal` mid-stream stops the loop and does not leak the reader.
 */
import type { ChatRequest, LLMProvider } from './types'

const BASE = '/api/ollama'

export class OllamaProvider implements LLMProvider {
  readonly id = 'ollama'
  readonly name = 'Ollama (local)'

  async isAvailable(): Promise<boolean> {
    // TODO(Part A): GET `${BASE}/api/tags`, return res.ok, swallow network errors.
    throw new Error('OllamaProvider.isAvailable not implemented')
  }

  async listModels(): Promise<string[]> {
    // TODO(Part A): GET `${BASE}/api/tags`, map to model names.
    throw new Error('OllamaProvider.listModels not implemented')
  }

  async *chat(_req: ChatRequest): AsyncIterable<string> {
    // TODO(Part A): POST `${BASE}/api/chat` with stream: true, read the body
    // with a ReadableStream reader, split on "\n", JSON.parse each line, and
    // `yield json.message.content`.
    throw new Error('OllamaProvider.chat not implemented')
  }
}
