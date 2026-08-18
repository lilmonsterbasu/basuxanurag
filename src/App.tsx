/**
 * OWNED JOINTLY — this is the seam file.
 *
 * All state comes from Part A's `useConversation()`. Everything below it is
 * Part B's components consuming that single object. Neither half should need
 * to change this file much once the contract in src/types/index.ts is stable;
 * if you find yourself editing it a lot, that's a sign the contract needs a
 * field, not that this file needs cleverness.
 */
import { useState } from 'react'
import { useConversation } from '@/hooks/useConversation'
import { VoiceOrb } from '@/components/VoiceOrb'
import { MicButton } from '@/components/MicButton'
import { StateIndicator } from '@/components/StateIndicator'
import { LiveTranscript } from '@/components/LiveTranscript'
import { ConversationHistory } from '@/components/ConversationHistory'
import { SettingsPanel } from '@/components/SettingsPanel'
import { ErrorBanner } from '@/components/ErrorBanner'

export default function App() {
  const c = useConversation()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-6 px-4 py-10">
      <header className="flex w-full items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Voice Operator</h1>
        <div className="flex gap-2">
          <button
            onClick={c.clearConversation}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Clear
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Settings
          </button>
        </div>
      </header>

      <ErrorBanner error={c.error} onDismiss={() => {}} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <VoiceOrb state={c.state} audioLevel={c.audioLevel} onClick={c.toggleListening} />
        <StateIndicator state={c.state} />
        <MicButton state={c.state} isSupported={c.isSupported} onToggle={c.toggleListening} />
        <LiveTranscript text={c.liveTranscript} state={c.state} />
      </div>

      <div className="w-full flex-1 overflow-y-auto">
        <ConversationHistory messages={c.messages} onClear={c.clearConversation} />
      </div>

      <SettingsPanel
        open={settingsOpen}
        settings={c.settings}
        voices={[]}
        onChange={c.updateSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
