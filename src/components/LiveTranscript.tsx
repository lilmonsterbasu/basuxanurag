/**
 * OWNER: PART B
 *
 * The in-flight text: interim speech while listening, streaming reply while
 * thinking/speaking. Distinct from the settled history below it.
 *
 * DONE WHEN:
 *   - Reserves its own height so the layout does not jump when text appears.
 *   - Reads as provisional (lighter weight, caret, or similar).
 *   - Long text wraps and stays inside the column.
 */
import type { AgentState } from '@/types'

export interface LiveTranscriptProps {
  text: string
  state: AgentState
}

export function LiveTranscript({ text, state }: LiveTranscriptProps) {
  // TODO(Part B)
  return (
    <div className="min-h-16 max-w-2xl text-center text-xl text-white/90">
      {text}
    </div>
  )
}
