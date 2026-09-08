import { useEffect, useRef, useState } from 'react'
import { MotionCache } from './motion-cache'

const POSES = [
  [0, 0.35], [0.125, 1.3], [0.25, 2.5], [0.375, 3.8],
  [0.5, 5.2], [0.625, 6.3], [0.75, 7.25], [0.875, 8.5], [1, 9.55],
]
const REST_PHASE = 0.1184
const WIDTH = 576
const HEIGHT = 502
interface PoseManifest {
  width: number; height: number; frameCount: number; duration: number
  frames: [number, number][]
}

export function poseTime(phase: number) {
  const p = ((phase % 1) + 1) % 1
  for (let i = 1; i < POSES.length; i += 1) {
    if (p <= POSES[i][0]) {
      const [start, startTime] = POSES[i - 1]
      const [end, endTime] = POSES[i]
      return startTime + ((p - start) / (end - start)) * (endTime - startTime)
    }
  }
  return 1.25
}

export default function Character({ paused }: { paused: boolean }) {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const pausedRef = useRef(paused)
  const wakeRef = useRef<() => void>(() => {})
  // Every page load starts with the still image, including returning visitors.
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  pausedRef.current = paused

  useEffect(() => { if (!paused) wakeRef.current() }, [paused])

  useEffect(() => {
    setReady(false)
    if (!enabled) return
    const surface = canvas.current!
    const container = stage.current!
    const context = surface.getContext('2d', { alpha: true })
    if (!context || typeof createImageBitmap !== 'function') {
      setUnavailable(true)
      setEnabled(false)
      return
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const abort = new AbortController()
    let disposed = false
    let visible = true
    let frameRequest = 0
    let phase = REST_PHASE
    let targetPhase = REST_PHASE
    let lastTime = 0
    let lastPaintAt = 0
    let paintedFrame = -1
    let hasFrame = false
    let decodeErrors = 0
    let slowFrames = 0
    let fps = coarse ? 18 : 24
    let bounds = container.getBoundingClientRect()
    let manifest: PoseManifest | undefined
    let pool: MotionCache<ImageBitmap> | undefined

    const stop = () => { cancelAnimationFrame(frameRequest); frameRequest = 0; lastTime = 0 }
    const mayAnimate = () => !disposed && visible && !document.hidden && !pausedRef.current
    const wake = () => {
      if (!frameRequest && mayAnimate()) frameRequest = requestAnimationFrame(tick)
    }
    const fail = () => {
      if (disposed) return
      stop()
      setUnavailable(true)
      setEnabled(false)
    }
    const updateBounds = () => { bounds = container.getBoundingClientRect() }
    const rest = () => { targetPhase = REST_PHASE; wake() }
    const onPointer = (event: PointerEvent) => {
      if (!mayAnimate() || (event.pointerType === 'touch' && event.buttons === 0)) return
      const dx = event.clientX - (bounds.left + bounds.width * 0.53)
      const dy = event.clientY - (bounds.top + bounds.height * 0.29)
      targetPhase = Math.hypot(dx, dy) < 38 ? REST_PHASE : (Math.atan2(-dy, dx) / (Math.PI * 2) + 1) % 1
      wake()
    }
    const onTouchDown = (event: PointerEvent) => { if (event.pointerType === 'touch') onPointer(event) }
    const onTouchEnd = (event: PointerEvent) => { if (event.pointerType === 'touch') rest() }
    const onVisibility = () => {
      if (document.hidden) stop()
      else { updateBounds(); rest() }
    }
    const onMotionPreference = () => { if (reduced.matches) setEnabled(false) }
    const tick = (now: number) => {
      frameRequest = 0
      if (!mayAnimate() || !pool || !manifest) { lastTime = 0; return }
      const elapsed = lastTime ? now - lastTime : 16.7
      lastTime = now
      if (elapsed > 100) { slowFrames += 1; fps = 12 }
      else slowFrames = Math.max(0, slowFrames - 1)
      if (slowFrames >= 8) { fail(); return }
      const difference = ((targetPhase - phase + 1.5) % 1) - 0.5
      const moving = Math.abs(difference) > 0.0015
      phase = moving ? (phase + difference * (1 - Math.exp(-Math.min(elapsed, 70) / 1000 * 13)) + 1) % 1 : targetPhase
      const index = Math.max(0, Math.min(manifest.frameCount - 1, Math.round(poseTime(phase) / manifest.duration * (manifest.frameCount - 1))))
      const direction = difference < 0 ? -1 : 1
      pool.request([index, index + direction, index + direction * 2, index - direction].filter(i => i >= 0 && i < manifest!.frameCount))
      const frame = pool.get(index)
      if (frame && index !== paintedFrame && now - lastPaintAt >= 1000 / fps) {
        try {
          context.clearRect(0, 0, WIDTH, HEIGHT)
          context.drawImage(frame, 0, 0, WIDTH, HEIGHT)
          paintedFrame = index
          lastPaintAt = now
          if (!hasFrame) { hasFrame = true; setReady(true) }
        } catch { fail(); return }
      }
      // Sleep at rest. Missing frames wake us on decode completion.
      if (moving || (frame && paintedFrame !== index)) wake()
      else lastTime = 0
    }
    wakeRef.current = wake
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      if (visible) { updateBounds(); wake() }
      else { stop(); pool?.request([]) }
    })
    intersection.observe(container)
    const resize = new ResizeObserver(updateBounds)
    resize.observe(container)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onTouchDown, { passive: true })
    window.addEventListener('pointerup', onTouchEnd, { passive: true })
    window.addEventListener('pointercancel', onTouchEnd, { passive: true })
    window.addEventListener('scroll', updateBounds, { passive: true })
    document.documentElement.addEventListener('pointerleave', rest)
    document.addEventListener('visibilitychange', onVisibility)
    reduced.addEventListener('change', onMotionPreference)

    void (async () => {
      // No motion assets, canvas context, or video decoder are loaded before opt-in.
      const [description, response] = await Promise.all([
        fetch('/media/aria-poses/manifest.json', { signal: abort.signal }),
        fetch('/media/aria-poses/poses.bin', { signal: abort.signal }),
      ])
      if (!description.ok || !response.ok) throw new Error('Motion asset unavailable')
      const parsed = await description.json() as PoseManifest
      const bytes = await response.arrayBuffer()
      if (disposed) return
      if (bytes.byteLength > 4 * 1024 * 1024 || parsed.width !== WIDTH || parsed.height !== HEIGHT || parsed.frameCount !== 96 || parsed.frames.length !== parsed.frameCount) throw new Error('Unexpected motion asset')
      manifest = parsed
      pool = new MotionCache<ImageBitmap>(async (index, signal) => {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
        const [offset, length] = parsed.frames[index]
        if (offset < 0 || length < 1 || offset + length > bytes.byteLength) throw new Error('Invalid pose')
        const frame = await createImageBitmap(new Blob([bytes.slice(offset, offset + length)], { type: 'image/webp' }))
        if (signal.aborted) { frame.close(); throw new DOMException('Aborted', 'AbortError') }
        return frame
      }, wake, () => { decodeErrors += 1; if (decodeErrors >= 3) fail() }, 12, 2)
      wake()
    })().catch(() => { if (!disposed) fail() })

    return () => {
      disposed = true
      wakeRef.current = () => {}
      abort.abort()
      stop()
      pool?.dispose()
      intersection.disconnect()
      resize.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onTouchDown)
      window.removeEventListener('pointerup', onTouchEnd)
      window.removeEventListener('pointercancel', onTouchEnd)
      window.removeEventListener('scroll', updateBounds)
      document.documentElement.removeEventListener('pointerleave', rest)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', onMotionPreference)
      context.clearRect(0, 0, WIDTH, HEIGHT)
    }
  }, [enabled])

  return (
    <>
      <div ref={stage} className={`character-stage ${enabled && ready ? 'is-ready' : ''}`}>
        <img className="character-poster" src="/media/aria-poster.png" alt="アイボリーのレトロなパソコンの頭に、ネイビーのスーツを着たキャラクター、A.R.I.A。" width="848" height="738" fetchPriority="high" />
        <canvas ref={canvas} className="character-canvas" width={WIDTH} height={HEIGHT} aria-hidden="true" />
      </div>
      <div className="motion-controls">
        <button className="motion-toggle" type="button" aria-pressed={enabled} onClick={() => setEnabled(value => !value)} disabled={unavailable}>
          {enabled ? <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2v8M9 2v8" stroke="currentColor" strokeWidth="2" /></svg> : <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 1 7 5-7 5Z" fill="currentColor" /></svg>}
          <span>{unavailable ? '静止画で表示中' : enabled ? ready ? '動きを止める' : '読み込みを止める' : 'キャラクターを動かす'}</span>
        </button>
        {enabled && ready && <span className="motion-instruction"><span className="desktop-hint">マウスを動かしてみてください。</span><span className="touch-hint">ドラッグしてみてください。</span></span>}
        <span className="sr-only" role="status">{unavailable ? '動きを停止し、静止画で表示しています。' : enabled && !ready ? 'アニメーションを読み込み中です。' : ''}</span>
      </div>
    </>
  )
}
