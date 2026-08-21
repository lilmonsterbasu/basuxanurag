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
import { useState, useEffect, useRef } from 'react'
import type { AgentState } from '@/types'

export interface LiveTranscriptProps {
  text: string
  state: AgentState
}

export function LiveTranscript({ text, state }: LiveTranscriptProps) {
  const [displayText, setDisplayText] = useState('')
  const [showCaret, setShowCaret] = useState(false)
  const prevTextRef = useRef(text)
  const prevStateRef = useRef(state)

  useEffect(() => {
    if (text !== prevTextRef.current || state !== prevStateRef.current) {
      setDisplayText(text)
      prevTextRef.current = text
      prevStateRef.current = state
    }
  }, [text, state])

  useEffect(() => {
    if (state === 'listening' || state === 'thinking') {
      const interval = setInterval(() => setShowCaret((c) => !c), 530)
      return () => clearInterval(interval)
    } else {
      setShowCaret(false)
    }
  }, [state])

  const isActive = state === 'listening' || state === 'thinking' || state === 'speaking'

  return (
    <div
      className={cn(
        'min-h-16 max-w-2xl w-full px-4 text-center transition-opacity duration-300',
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <p
        className={cn(
          'text-xl font-light text-white/70 leading-relaxed break-words',
          'transition-colors duration-300',
          state === 'listening' && 'text-emerald-300',
          state === 'thinking' && 'text-amber-300',
          state === 'speaking' && 'text-violet-300',
        )}
      >
        {displayText}
        {(state === 'listening' || state === 'thinking') && showCaret && (
          <span className="ml-1 inline-block animate-pulse text-white/50" aria-hidden="true">
            |
          </span>
        )}
      </p>
    </div>
  )
}