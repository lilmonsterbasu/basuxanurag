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
import { LLMUnreachableError, type ChatRequest, type LLMProvider } from './types'

const BASE = '/api/ollama'

interface OllamaTagsResponse {
  models: { name: string }[]
}

interface OllamaChatChunk {
  message?: { content?: string }
  done: boolean
  error?: string
}

export class OllamaProvider implements LLMProvider {
  readonly id = 'ollama'
  readonly name = 'Ollama (local)'

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE}/api/tags`)
      return res.ok
    } catch {
      return false
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const res = await fetch(`${BASE}/api/tags`)
      if (!res.ok) return []
      const data: OllamaTagsResponse = await res.json()
      return data.models?.map((m) => m.name) ?? []
    } catch {
      return []
    }
  }

  async *chat(req: ChatRequest): AsyncIterable<string> {
    let res: Response
    try {
      res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: req.model,
          messages: req.messages,
          stream: true,
        }),
        signal: req.signal,
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      throw new LLMUnreachableError()
    }

    if (!res.ok || !res.body) {
      throw new LLMUnreachableError(`Ollama responded with ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // Last element may be a partial line — keep it in the buffer.
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          let chunk: OllamaChatChunk
          try {
            chunk = JSON.parse(trimmed)
          } catch {
            continue
          }

          if (chunk.error) throw new Error(chunk.error)
          if (chunk.message?.content) yield chunk.message.content
          if (chunk.done) return
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      throw err
    } finally {
      reader.releaseLock()
    }
  }
}
