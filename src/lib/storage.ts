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

export function loadMessages(): Message[] {
  // TODO(Part A): parse KEY_MESSAGES, validate it is an array, return [] on any failure.
  return []
}

export function saveMessages(_messages: Message[]): void {
  // TODO(Part A): write KEY_MESSAGES inside a try/catch (quota errors are real).
}

export function loadSettings(): Settings {
  // TODO(Part A): merge stored partial over DEFAULT_SETTINGS so new fields we add
  // later do not come back undefined for existing users.
  return DEFAULT_SETTINGS
}

export function saveSettings(_settings: Settings): void {
  // TODO(Part A)
}

export function clearAll(): void {
  // TODO(Part A): remove both keys.
}
