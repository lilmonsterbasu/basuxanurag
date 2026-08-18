# Voice Operator — Free AI Voice Agent

Talk to a locally-running LLM by voice, entirely free, entirely local. No Vapi,
Retell, ElevenLabs, Twilio, or OpenAI API — speech recognition and speech
synthesis come from the browser (Web Speech API), and the model runs on your
machine via [Ollama](https://ollama.com).

## Stack

React + TypeScript + Vite + Tailwind CSS, Web Speech API, browser
`speechSynthesis`, LocalStorage for persistence, Ollama for the LLM.

## One-time setup

```bash
# 1. Install Ollama: https://ollama.com/download
ollama pull llama3.2

# 2. Install app dependencies
npm install
```

## Running it

```bash
# terminal 1
ollama serve

# terminal 2
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/ollama/*` to
`http://127.0.0.1:11434`, so the browser never needs Ollama's CORS
(`OLLAMA_ORIGINS`) configured — same-origin the whole way.

## How the project is scaffolded

Everything either of you needs to agree on up front lives in two files:

- [`src/types/index.ts`](src/types/index.ts) — the `ConversationController`
  interface. This is the seam: Part A implements it (via `useConversation`),
  Part B's components only ever consume it as props. Change it together, not
  unilaterally.
- [`src/llm/types.ts`](src/llm/types.ts) — the `LLMProvider` interface, so the
  model backend can be swapped later without touching a single component.

Every other file under `src/` has a header comment: `OWNER: PART A` or
`OWNER: PART B`, plus a "DONE WHEN" checklist. [`src/App.tsx`](src/App.tsx) is
the shared wiring — it's already finished and shouldn't need much editing by
either of you; if you find yourself changing it a lot, that usually means the
`ConversationController` contract is missing a field, so raise it with the
other person first.

The whole thing currently builds, typechecks, and renders a static placeholder
UI (screenshot-verified) — run `npm run dev` right now and you'll see the orb,
state label, mic button, and settings/clear buttons, all inert until each
`TODO(Part A/B)` is filled in.

## Part A — Voice + Brain (logic layer)

Owns everything that makes the app actually *work*, no UI concerns.

| File | What it does |
|---|---|
| [`src/llm/OllamaProvider.ts`](src/llm/OllamaProvider.ts) | Streams chat completions from Ollama's `/api/chat` |
| [`src/llm/index.ts`](src/llm/index.ts) | The one-line swap point for the active `LLMProvider` |
| [`src/hooks/useSpeechRecognition.ts`](src/hooks/useSpeechRecognition.ts) | Wraps `webkitSpeechRecognition`: interim + final transcripts, mic permission errors |
| [`src/hooks/useSpeechSynthesis.ts`](src/hooks/useSpeechSynthesis.ts) | Wraps `speechSynthesis`: voice list, speak/cancel, the Chrome 15s-cutoff workaround |
| [`src/hooks/useAudioLevel.ts`](src/hooks/useAudioLevel.ts) | `getUserMedia` → `AnalyserNode` → smoothed 0..1 level for the orb to react to |
| [`src/hooks/useConversation.ts`](src/hooks/useConversation.ts) | **The centerpiece.** The idle → listening → thinking → speaking state machine that composes everything above into the `ConversationController` |
| [`src/lib/storage.ts`](src/lib/storage.ts) | LocalStorage persistence for messages + settings, fails soft |

**Definition of done:** open the app, click the orb, speak, watch your words
become text, watch the reply stream in, hear it read aloud, refresh the page
and the conversation is still there. Killing `ollama serve` mid-conversation
shows an error and returns to idle instead of hanging on "Thinking...".

## Part B — Interface + Feel (visual layer)

Owns everything the user looks at. Every component takes plain props/callbacks
— none of them import `useConversation` or touch Ollama directly.

| File | What it does |
|---|---|
| [`src/components/VoiceOrb.tsx`](src/components/VoiceOrb.tsx) | **The centerpiece.** The big animated orb, four distinct states, reacts to `audioLevel` |
| [`src/components/MicButton.tsx`](src/components/MicButton.tsx) | Explicit mic control below the orb |
| [`src/components/StateIndicator.tsx`](src/components/StateIndicator.tsx) | "Click to talk" / "Listening..." / "Thinking..." / "Speaking..." |
| [`src/components/LiveTranscript.tsx`](src/components/LiveTranscript.tsx) | In-flight interim speech / streaming reply |
| [`src/components/ConversationHistory.tsx`](src/components/ConversationHistory.tsx) | Settled transcript, auto-scroll that doesn't fight the reader |
| [`src/components/SettingsPanel.tsx`](src/components/SettingsPanel.tsx) | Model, system prompt, voice, rate, pitch, language, auto-speak |
| [`src/components/ErrorBanner.tsx`](src/components/ErrorBanner.tsx) | Dismissible, actionable error copy |

Keyframes `breathe`, `ripple`, `drift` are pre-registered in
[`tailwind.config.js`](tailwind.config.js) as a starting vocabulary for the
orb — add more there as needed.

**Definition of done:** with Part A's stubs left as-is (they return inert
defaults), the app should still look and feel finished — every state visually
distinct, no layout jumps, works down to keyboard-only navigation. Swapping in
Part A's real `useConversation` should require zero changes on this side.

## Integrating

Once both sides are done, `npm run dev` should need nothing else — `App.tsx`
already wires `useConversation()`'s return value into every component. If it
doesn't just work, the mismatch is almost certainly a drift from
`src/types/index.ts`; fix the contract first, not the call site.
