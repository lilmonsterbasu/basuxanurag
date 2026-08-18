/**
 * OWNER: PART B
 *
 * The settled transcript. Bubbles or a clean two-column log — your call.
 *
 * DONE WHEN:
 *   - Auto-scrolls to the newest turn, but does NOT yank the view down if the
 *     user has scrolled up to read something.
 *   - Empty state is a designed moment, not a blank rectangle.
 *   - Timestamps are readable and not visually noisy.
 */
import type { Message } from '@/types'

export interface ConversationHistoryProps {
  messages: Message[]
  onClear: () => void
}

export function ConversationHistory({ messages, onClear }: ConversationHistoryProps) {
  // TODO(Part B)
  return (
    <div className="space-y-2">
      {messages.map((m) => (
        <div key={m.id} className="text-sm text-white/70">
          <span className="font-medium">{m.role}:</span> {m.content}
        </div>
      ))}
    </div>
  )
}
