/**
 * OWNER: PART B  —  this is the centrepiece of Part B.
 *
 * The large animated orb. One component, four visual states:
 *
 *   idle      slow breathing, low glow, invites a click
 *   listening scales/pulses with `audioLevel` (0..1) in real time
 *   thinking  indeterminate motion — orbit, shimmer, or particle drift
 *   speaking  rhythmic pulse while the reply plays
 *
 * Build it with layered divs + blur + gradients, or an SVG/canvas if you'd
 * rather. Keyframes `breathe`, `ripple`, and `drift` are already in
 * tailwind.config.js; add more there as needed.
 *
 * DONE WHEN:
 *   - All four states are visually distinct at a glance, with no hard cuts
 *     between them.
 *   - Talking louder visibly moves the orb.
 *   - It holds 60fps (animate transform/opacity only — never width/height).
 *   - It respects `prefers-reduced-motion`.
 */
import { cn } from '@/lib/cn'
import type { AgentState } from '@/types'

export interface VoiceOrbProps {
  state: AgentState
  /** 0..1, only meaningful while listening. */
  audioLevel: number
  onClick: () => void
}

export function VoiceOrb({ state, audioLevel, onClick }: VoiceOrbProps) {
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const scale = 1 + audioLevel * 0.25

  const baseClasses = cn(
    'relative h-56 w-56 rounded-full transition-colors duration-500',
    'flex items-center justify-center cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30',
    state === 'idle' && 'bg-gradient-to-br from-indigo-500 to-fuchsia-600',
    state === 'listening' && 'bg-gradient-to-br from-emerald-400 to-cyan-500',
    state === 'thinking' && 'bg-gradient-to-br from-amber-400 to-orange-500',
    state === 'speaking' && 'bg-gradient-to-br from-violet-500 to-pink-500',
  )

  return (
    <button
      onClick={onClick}
      aria-label={state === 'idle' ? 'Start listening' : 'Stop listening'}
      className={baseClasses}
      style={{ transform: prefersReducedMotion ? 'none' : `scale(${scale})` }}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full opacity-30 blur-2xl',
          'transition-opacity duration-500',
          state === 'idle' && 'bg-indigo-500',
          state === 'listening' && 'bg-emerald-400',
          state === 'thinking' && 'bg-amber-400',
          state === 'speaking' && 'bg-violet-500',
        )}
        aria-hidden="true"
      />

      {!prefersReducedMotion && (
        <>
          {state === 'idle' && (
            <div className="absolute inset-0 rounded-full animate-breathe bg-gradient-to-br from-indigo-500/40 to-fuchsia-600/40" aria-hidden="true" />
          )}
          {state === 'listening' && (
            <>
              <div className="absolute inset-0 rounded-full animate-ripple bg-emerald-400/30" aria-hidden="true" />
              <div className="absolute inset-0 rounded-full animate-ripple bg-cyan-500/20 animation-delay-500" aria-hidden="true" />
            </>
          )}
          {state === 'thinking' && (
            <div className="absolute inset-0 rounded-full animate-drift bg-gradient-to-tr from-amber-400/30 to-orange-500/30" aria-hidden="true" />
          )}
          {state === 'speaking' && (
            <>
              <div className="absolute inset-0 rounded-full animate-breathe bg-violet-500/40" style={{ animationDuration: '1.2s' }} aria-hidden="true" />
              <div className="absolute inset-0 rounded-full animate-ripple bg-pink-500/20" style={{ animationDuration: '2.4s' }} aria-hidden="true" />
            </>
          )}
        </>
      )}

      <div className="relative z-10 flex items-center justify-center">
        {state === 'listening' && (
          <svg
            className="h-14 w-14 text-white/90 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
        {state === 'thinking' && (
          <svg
            className="h-14 w-14 text-white/90 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {state === 'speaking' && (
          <svg
            className="h-14 w-14 text-white/90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
        {state === 'idle' && (
          <svg
            className="h-16 w-16 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </div>
    </button>
  )
}