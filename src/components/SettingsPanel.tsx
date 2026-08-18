/**
 * OWNER: PART B
 *
 * Slide-over or modal. Every field maps to one key of `Settings` and is applied
 * through `updateSettings` — never keep a second copy of the state here.
 *
 * Fields: model, systemPrompt, voice (from the browser's voice list),
 * speechRate, speechPitch, language, autoSpeak.
 *
 * DONE WHEN:
 *   - Changing a setting takes effect on the very next turn.
 *   - Esc and a click on the backdrop both close it; focus is trapped while open.
 *   - The voice dropdown is populated from the real SpeechSynthesis voice list.
 */
import type { Settings } from '@/types'

export interface SettingsPanelProps {
  open: boolean
  settings: Settings
  voices: SpeechSynthesisVoice[]
  onChange: (patch: Partial<Settings>) => void
  onClose: () => void
}

export function SettingsPanel({ open, settings, onChange, onClose }: SettingsPanelProps) {
  // TODO(Part B)
  if (!open) return null
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/60" onClick={onClose}>
      <div className="rounded-xl bg-neutral-900 p-6 text-white" onClick={(e) => e.stopPropagation()}>
        Settings — not implemented yet
      </div>
    </div>
  )
}
