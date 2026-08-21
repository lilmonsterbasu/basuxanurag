/**
 * OWNER: PART B
 *
 * The explicit microphone control below the orb (the orb is clickable too, but
 * this is the discoverable affordance).
 *
 * DONE WHEN:
 *   - Icon and label reflect the state (mic / stop / disabled while thinking).
 *   - Keyboard reachable, with a visible focus ring.
 *   - Disabled with a tooltip when `isSupported` is false.
 */
import { cn } from '@/lib/cn'
import type { AgentState } from '@/types'

export interface MicButtonProps {
  state: AgentState
  isSupported: boolean
  onToggle: () => void
}

export function MicButton({ state, isSupported, onToggle }: MicButtonProps) {
  const disabled = !isSupported || state === 'thinking'
  const isListening = state === 'listening'

  return (
    <div className="relative flex flex-col items-center gap-2">
      <button
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'relative flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          isListening && 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30',
          !isListening && state !== 'thinking' && 'hover:bg-white/5',
          state === 'thinking' && 'cursor-wait',
        )}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
        aria-pressed={isListening}
      >
        {isListening ? (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h.01M17 20h.01" />
            </svg>
            <span>Stop</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Talk</span>
          </>
        )}
      </button>

      {!isSupported && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white bg-neutral-900 rounded shadow-lg whitespace-nowrap opacity-90">
          Speech recognition not supported in this browser
        </div>
      )}
    </div>
  )
}