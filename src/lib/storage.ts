/**
 * OWNER: PART A
 *
 * LocalStorage persistence. Must never throw — a corrupt or full store should
 * degrade to "no history" rather than white-screening the app.
 *
 * DONE WHEN:
 *   - Reload restores the conversation and the settings.
 *   - Hand-corrupting the localStorage value still boots the app cleanly.
 */
import { DEFAULT_SETTINGS, type Message, type Settings } from '@/types'

const KEY_MESSAGES = 'voice-operator:messages'
const KEY_SETTINGS = 'voice-operator:settings'

function isMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false
  const m = value as Record<string, unknown>
  return (
    typeof m.id === 'string' &&
    (m.role === 'user' || m.role === 'assistant') &&
    typeof m.content === 'string' &&
    typeof m.timestamp === 'number'
  )
}

export function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(KEY_MESSAGES)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isMessage)
  } catch {
    return []
  }
}

export function saveMessages(messages: Message[]): void {
  try {
    localStorage.setItem(KEY_MESSAGES, JSON.stringify(messages))
  } catch {
    // Quota exceeded or storage disabled — conversation just won't persist.
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...(parsed as Partial<Settings>) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings))
  } catch {
    // Quota exceeded or storage disabled — settings just won't persist.
  }
}

export function clearAll(): void {
  try {
    localStorage.removeItem(KEY_MESSAGES)
    localStorage.removeItem(KEY_SETTINGS)
  } catch {
    // Nothing we can do if storage itself is unavailable.
  }
}
