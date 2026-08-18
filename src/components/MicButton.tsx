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
import type { AgentState } from '@/types'

export interface MicButtonProps {
  state: AgentState
  isSupported: boolean
  onToggle: () => void
}

export function MicButton({ state, isSupported, onToggle }: MicButtonProps) {
  // TODO(Part B)
  return (
    <button
      onClick={onToggle}
      disabled={!isSupported || state === 'thinking'}
      className="rounded-full border border-white/15 px-6 py-3 text-sm text-white/80 disabled:opacity-40"
    >
      {state === 'listening' ? 'Stop' : 'Talk'}
    </button>
  )
}
