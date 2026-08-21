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
import { cn } from '@/lib/cn'
import type { Message } from '@/types'

export interface ConversationHistoryProps {
  messages: Message[]
  onClear: () => void
}

function getTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { minute: '2-digit', hour: '2-digit' })
}

export function ConversationHistory({ messages, onClear }: ConversationHistoryProps) {
  const [isAtBottom, setIsAtBottom] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const bottom = container.scrollHeight - container.clientHeight
    const scrollTop = container.scrollTop
    const atBottom = Math.abs(bottom - scrollTop) < 50

    if (atBottom !== isAtBottom) {
      setIsAtBottom(atBottom)
    }
  }, [messages.length, isAtBottom])

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const bottom = container.scrollHeight - container.clientHeight
    const scrollTop = container.scrollTop
    const atBottom = Math.abs(bottom - scrollTop) < 50
    setIsAtBottom(atBottom)
  }, [])

  // Count messages per role for empty state
  const userCount = messages.filter((m) => m.role === 'user').length
  const assistantCount = messages.filter((m) => m.role === 'assistant').length

  return (
    <div
      ref={containerRef}
      className="w-full flex-1 overflow-y-auto space-y-2 pt-2"
      onScroll={handleScroll}
      aria-label="Conversation history"
    >
      {messages.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <svg
            className="mx-auto mb-3 h-12 w-12 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="No messages"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2m12 5h.01M19.5 13.5l3 3m0 0l-3-3m3 3H15" />
          </svg>
          <p className="text-white/50 text-sm">No messages yet. Start by clicking the orb.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((m, i) => (
            <div
              key={m.id}
              className={cn(
                'flex',
                m.role === 'user' && 'justify-end',
                m.role === 'assistant' && 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] px-3 py-1.5 rounded text-sm',
                  m.role === 'user' && 'bg-indigo-600 text-white',
                  m.role === 'assistant' && 'bg-neutral-700 text-white',
                )}
              >
                <p className="break-words">{m.content}</p>
                {m.timestamp && (
                  <p className="text-xs text-white/60 mt-0.5">
                    {getTimestamp(m.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}