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
import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { STATE_LABEL, type AgentState } from '@/types'

export function StateIndicator({ state }: { state: AgentState }) {
  const [displayLabel, setDisplayLabel] = useState(STATE_LABEL[state])
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    const newLabel = STATE_LABEL[state]
    if (newLabel !== displayLabel) {
      setIsFading(true)
      const timer = setTimeout(() => {
        setDisplayLabel(newLabel)
        setIsFading(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [state, displayLabel])

  return (
    <p
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'text-lg font-medium text-white/70 transition-opacity duration-150',
        isFading && 'opacity-0',
      )}
    >
      {displayLabel}
    </p>
  )
}