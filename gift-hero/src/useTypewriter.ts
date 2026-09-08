import { useEffect, useState } from 'react'

export default function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    setDisplayed('')
    setDone(false)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplayed(text); setDone(true); return }
    const timeout = setTimeout(() => {
      let index = 0
      interval = setInterval(() => {
        index += 1
        setDisplayed(text.slice(0, index))
        if (index >= text.length) { clearInterval(interval); setDone(true) }
      }, speed)
    }, startDelay)
    return () => { clearTimeout(timeout); clearInterval(interval) }
  }, [text, speed, startDelay])
  return { displayed, done }
}
