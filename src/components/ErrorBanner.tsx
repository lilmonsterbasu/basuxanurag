/**
 * OWNER: PART B
 *
 * Dismissible banner for AgentError. Copy should tell the user what to DO:
 *   llm-unreachable -> "Start Ollama, then try again."
 *   mic-permission  -> "Allow microphone access in your browser settings."
 *
 * DONE WHEN it never covers the orb or the mic button.
 */
import { cn } from '@/lib/cn'
import type { AgentError } from '@/types'

export function ErrorBanner({ error, onDismiss }: { error: AgentError | null; onDismiss: () => void }) {
  if (!error) return null

  const kindToCopy: Record<AgentError['kind'], string> = {
    'llm-unreachable': 'Start Ollama, then try again.',
    'mic-permission': 'Allow microphone access in your browser settings.',
    'llm-error': 'Check the connection to Ollama and try again.',
    'unknown': 'Something went wrong. Try refreshing the page.',
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-200 transition-all duration-300',
        'flex items-center gap-2',
        'mb-4 animate-in fade-in-0',
        'data-state="entered" &&:not([data-state="exiting"])',
      )}
      role="alert"
    >
      <span className="flex shrink-0 items-center justify-center w-6 h-6 rounded bg-red-500 text-white flex items-center justify-center">
        {error.kind === 'llm-unreachable' && (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 9v2m0-3v2m6-3v2m6-3v2m-6 3v2m-6-3v2M4.324 6.324a7.962 7.962 0 01-1.407-1.407l1.818 1.818m-2.177-7.243a7.962 7.962 0 101.407 1.407L12 3.956l4.626-4.626a7.962 7.962 0 011.407 1.407l-1.818 1.818m7.828 3.196l-1.818-1.818a7.962 7.962 0 00-1.407-1.407l1.818-1.818m-7.828 3.196l1.818 1.818a7.962 7.962 0 001.407 1.407l-1.818 1.818m7.828-3.196l1.818 1.818a7.962 7.962 0 001.407 1.407l-1.818 1.818m-7.828-3.196l-1.818-1.818a7.962 7.962 0 00-1.407-1.407l1.818 1.818" />
          </svg>
        )}
      </span>
      <span>{kindToCopy[error.kind]}</span>

      <button
        onClick={onDismiss}
        className="ml-auto opacity-70 hover:text-white transition-colors duration-200"
        aria-label="Dismiss error"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}