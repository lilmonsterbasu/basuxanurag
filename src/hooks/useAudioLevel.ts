/**
 * OWNER: PART A
 *
 * Feed the orb's reaction to the user's voice.
 *
 * getUserMedia -> AudioContext -> AnalyserNode -> RMS over the time-domain
 * buffer, smoothed, normalised to 0..1, sampled on requestAnimationFrame.
 *
 * DONE WHEN:
 *   - Returns a steady 0 when `active` is false.
 *   - Releases the mic track and closes the AudioContext when it stops (check
 *     the browser tab's recording dot actually goes away).
 *   - The value is smooth enough to drive an animation without jitter.
 */
import { useEffect, useRef, useState } from 'react'

const SMOOTHING = 0.75 // higher = smoother/slower to react

export function useAudioLevel(active: boolean): number {
  const [level, setLevel] = useState(0)
  const smoothedRef = useRef(0)

  useEffect(() => {
    if (!active) {
      setLevel(0)
      smoothedRef.current = 0
      return
    }

    let cancelled = false
    let stream: MediaStream | null = null
    let audioCtx: AudioContext | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let analyser: AnalyserNode | null = null
    let rafId: number | null = null

    async function setup() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        audioCtx = new AudioContext()
        source = audioCtx.createMediaStreamSource(stream)
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)

        const buffer = new Uint8Array(analyser.fftSize)

        const tick = () => {
          if (cancelled || !analyser) return
          analyser.getByteTimeDomainData(buffer)

          let sumSquares = 0
          for (let i = 0; i < buffer.length; i++) {
            const centered = (buffer[i] - 128) / 128
            sumSquares += centered * centered
          }
          const rms = Math.sqrt(sumSquares / buffer.length)
          const normalized = Math.min(1, rms * 4) // RMS from voice rarely nears 1; boost sensitivity

          smoothedRef.current = smoothedRef.current * SMOOTHING + normalized * (1 - SMOOTHING)
          setLevel(smoothedRef.current)

          rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)
      } catch {
        // Mic permission denied or unavailable — level just stays 0.
      }
    }

    setup()

    return () => {
      cancelled = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      source?.disconnect()
      analyser?.disconnect()
      stream?.getTracks().forEach((t) => t.stop())
      if (audioCtx && audioCtx.state !== 'closed') void audioCtx.close()
      smoothedRef.current = 0
      setLevel(0)
    }
  }, [active])

  return level
}
