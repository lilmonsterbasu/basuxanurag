/**
 * OWNER: PART B
 *
 * The line of copy under the orb. Use STATE_LABEL from @/types verbatim — the
 * exact strings are part of the spec.
 *
 * DONE WHEN:
 *   - Text cross-fades on change rather than snapping.
 *   - It is an aria-live region so screen readers announce state changes.
 */
import { STATE_LABEL, type AgentState } from '@/types'

export function StateIndicator({ state }: { state: AgentState }) {
  // TODO(Part B)
  return (
    <p aria-live="polite" className="text-lg text-white/70">
      {STATE_LABEL[state]}
    </p>
  )
}
