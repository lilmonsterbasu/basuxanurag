/**
 * OWNER: PART B
 *
 * Dismissible banner for AgentError. Copy should tell the user what to DO:
 *   llm-unreachable -> "Start Ollama, then try again."
 *   mic-permission  -> "Allow microphone access in your browser settings."
 *
 * DONE WHEN it never covers the orb or the mic button.
 */
import type { AgentError } from '@/types'

export function ErrorBanner({ error, onDismiss }: { error: AgentError | null; onDismiss: () => void }) {
  // TODO(Part B)
  if (!error) return null
  return (
    <div className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-200">
      {error.message}
    </div>
  )
}
