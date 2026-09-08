import assert from 'node:assert/strict'
import { MotionCache } from '../src/motion-cache.ts'

const flush = () => new Promise<void>(resolve => setImmediate(resolve))
let live = 0
let peakLive = 0
let closed = 0
const image = () => {
  live += 1
  peakLive = Math.max(peakLive, live)
  let released = false
  return { close() { assert.equal(released, false, 'An image must only be released once'); released = true; live -= 1; closed += 1 } }
}
type Image = ReturnType<typeof image>
const pending = new Map<number, (frame: Image) => void>()
const started: number[] = []
let peakPending = 0
const pool = new MotionCache<Image>((index) => {
  started.push(index)
  return new Promise(resolve => { pending.set(index, resolve); peakPending = Math.max(peakPending, pending.size) })
}, () => {}, () => { throw new Error('Unexpected decoder error') }, 12, 2)
const complete = async (index: number) => {
  const resolve = pending.get(index)!
  pending.delete(index)
  resolve(image())
  await flush()
}

pool.request([0, 1, 2, 3])
for (let i = 4; i < 99; i += 1) pool.request([i, i + 1])
assert.equal(pool.pending, 2, 'Rapid pointer events must not start extra decoders')
await complete(0)
await complete(1)
assert.deepEqual(started, [0, 1, 98, 99], 'Obsolete queued poses must be discarded')
await complete(98)
await complete(99)
for (let index = 10; index < 50; index += 1) {
  pool.request([index])
  await complete(index)
  assert.ok(pool.size <= 12, 'Decoded frame cache must stay within its budget')
}
assert.equal(peakPending, 2)
assert.ok(peakLive <= 13, 'Evictions must release old decoded image resources')
pool.request([65, 66, 67])
pool.dispose()
assert.equal(pool.size, 0)
await complete(65)
await complete(66)
assert.ok(!started.includes(67), 'Disposal must discard queued work')
assert.equal(live, 0, 'Completed and late decoded images must all be released')
const count = started.length
pool.request([90])
await flush()
assert.equal(started.length, count, 'Disposed caches must never restart')

let attempts = 0
let failures = 0
const broken = new MotionCache<Image>(async () => { attempts += 1; throw new Error('Unsupported image') }, () => {}, () => { failures += 1 })
broken.request([0])
await flush()
for (let i = 0; i < 100; i += 1) broken.request([0])
await flush()
assert.equal(attempts, 1, 'Failed poses must not create a retry loop')
assert.equal(failures, 1)
broken.dispose()
console.log(JSON.stringify({ passed: true, peakConcurrentDecoders: peakPending, maxCachedFrames: 12, peakLiveFramesDuringInsertion: peakLive, imagesReleased: closed, retryLoopPrevented: true }))
