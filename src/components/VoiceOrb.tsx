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
  // TODO(Part B): replace this placeholder with the real thing.
  return (
    <button
      onClick={onClick}
      aria-label="Toggle microphone"
      className={cn(
        'relative h-56 w-56 rounded-full transition-colors duration-500',
        'bg-gradient-to-br from-indigo-500 to-fuchsia-600',
        state === 'idle' && 'animate-breathe',
        state === 'listening' && 'from-emerald-400 to-cyan-500',
        state === 'thinking' && 'from-amber-400 to-orange-500',
        state === 'speaking' && 'from-violet-500 to-pink-500',
      )}
      style={{ transform: `scale(${1 + audioLevel * 0.25})` }}
    />
  )
}
