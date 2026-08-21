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
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Settings } from '@/types'

export interface SpeechSynthesisVoice & {
  voiceURI: string
}

export interface SettingsPanelProps {
  open: boolean
  settings: Settings
  voices: SpeechSynthesisVoice[]
  onChange: (patch: Partial<Settings>) => void
  onClose: () => void
}

export function SettingsPanel({ open, settings, voices, onChange, onClose }: SettingsPanelProps) {
  const [focusTrapped, setFocusTrapped] = useState(false)

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  const trapFocus = useCallback((e: FocusEvent) => {
    const focusedElement = document.activeElement as HTMLElement
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('focusin', trapFocus, { capture: true })
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('focusin', trapFocus, { capture: true })
    }
  }, [open, handleEscape, trapFocus])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as Element).closest('.settings-panel-content') === null) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleChange =
    useCallback(
      (key: keyof Settings, value: Settings[keyof Settings]) => {
        onChange({ [key]: value })
      },
      [onChange]
    )

  return (
    !open ? null : (
      <div
        className="fixed inset-0 z-50"
        onClick={(e) => {
          if ((e.target as Element).closest('.settings-panel-wrapper') === null) {
            onClose()
          }
        }}
      >
        <div
          className="fixed inset-0 bg-black/60" onClick={(e) => e.stopPropagation()}
        >
          <div
            className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-neutral-900 rounded-xl p-6 text-white transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-panel-title"
          >
            <h2 id="settings-panel-title" className="text-xl font-semibold mb-6 text-center">
              Settings
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm mb-2 display:block">Model</label>
                <select
                  value={settings.model}
                  onChange={(e) => handleChange('model', e.target.value as Settings['model'])}
                  className="w-full px-3 py-2 border rounded text-white"
                >
                  <option value="llama3.2">llama3.2</option>
                  <option value="mixtral">mixtral</option>
                  <option value="phi">phi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 display:block">
                  System Prompt
                </label>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) =>
                    handleChange('systemPrompt', e.target.value as Settings['systemPrompt'])
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded text-white resize-none"
                >
                  You are a friendly voice assistant. Your replies are read aloud, so keep them short and conversational — two or three sentences at most. Never use markdown, lists, or emoji.
                </textarea>
              </div>

              <div>
                <label className="block text-sm mb-2 display:block">Voice</label>
                <select
                  value={settings.voiceURI ?? ''}
                  onChange={(e) => handleChange('voiceURI', e.target.value as Settings['voiceURI']) }
                  className="w-full px-3 py-2 border rounded text-white"
                  disabled={!voices.length}
                >
                  <option value="">Browser default</option>
                  {voices.map((voice) => (
                    <option
                      key={voice.voiceURI}
                      value={voice.voiceURI}
                    >
                      {voice.name || voice.voiceURI}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm mb-2 display:block">
                  Speech Rate
                  <span className="ml-4 text-white/60 capitalize">
                    {settings.speechRate.toFixed(1)}
                  </span>
                </label>
                <div className="w-full bg-neutral-800 rounded h-2">
                  <div
                    className="h-full bg-indigo-600 rounded transition-colors duration-300"
                    style={{ width: `${settings.speechRate * 100}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => handleChange('speechRate', Math.min(settings.speechRate + 0.1, 2))}
                  className="text-xs text-white/60 hover:text-white mt-1"
                  disabled={settings.speechRate >= 2}
                >
                  +
                </button>
                <button
                  onClick={() => handleChange('speechRate', Math.max(settings.speechRate - 0.1, 0.5))}
                  className="text-xs text-white/60 hover:text-white mt-1"
                  disabled={settings.speechRate <= 0.5}
                >
                  -
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm mb-2 display:block">
                  Speech Pitch
                  <span className="ml-4 text-white/60 capitalize">
                    {settings.speechPitch.toFixed(1)}
                  </span>
                </label>
                <div className="w-full bg-neutral-800 rounded h-2">
                  <div
                    className="h-full bg-indigo-600 rounded transition-colors duration-300"
                    style={{ width: `${settings.speechPitch * 100}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => handleChange('speechPitch', Math.min(settings.speechPitch + 0.1, 2))}
                  className="text-xs text-white/60 hover:text-white mt-1"
                  disabled={settings.speechPitch >= 2}
                >
                  +
                </button>
                <button
                  onClick={() => handleChange('speechPitch', Math.max(settings.speechPitch - 0.1, 0.5))}
                  className="text-xs text-white/60 hover:text-white mt-1"
                  disabled={settings.speechPitch <= 0.5}
                >
                  -
                </button>
              </div>

              <div>
                <label className="block text-sm mb-2 display:block">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleChange('language', e.target.value as Settings['language'])
                  }
                  className="w-full px-3 py-2 border rounded text-white"
                >
                  <option value="en-US">English (en-US)</option>
                  <option value="es-ES">Spanish (es-ES)</option>
                  <option value="fr-FR">French (fr-FR)</option>
                  <option value="de-DE">German (de-DE)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">
                  <span className="mr-2">Auto-speak</span>
                  <span className="text-white/60">{settings.autoSpeak ? 'On' : 'Off'}</span>
                </label>
                <label className="relative w-14 h-7 rounded-full bg-neutral-800 px-2">
                  <input
                    type="checkbox"
                    checked={settings.autoSpeak}
                    onChange={(e) =>
                      handleChange('autoSpeak', e.target.checked as Settings['autoSpeak'])
                    }
                    className="absolute w-full h-full cursor-pointer opacity-0"
                  />
                  <span className="absolute left-1 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                    style={{ transform: settings.autoSpeak ? 'translateX(7px)' : 'translateX(0)' }}
                  ></span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="flex-1 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  )
}