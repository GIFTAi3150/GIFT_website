import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import Character from './Character'
import useTypewriter from './useTypewriter'

const CONTACT_URL = 'https://www.gift-inc.org/contact'
const PROMISE_PREFIX = 'ぜんぶ込みで、'
const PROMISE_PRICE = '月額3万円。'
const BENEFITS = [
  '御社専用デザイン（テンプレ不使用）で最大10ページ',
  'サーバー・ドメイン・SSLの管理費込み',
  '公開後の軽微な更新対応も込み',
]
const NAVIGATION = [
  { href: '#service', label: 'サービス' },
  { href: '#pricing', label: '料金・内容' },
]

const priceTypography = (text: string) => <><span className="price-word">{text.slice(0, 2)}</span><span className="price-number">{text.slice(2, 3)}</span><span className="price-word">{text.slice(3)}</span></>

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { displayed, done } = useTypewriter(PROMISE_PREFIX + PROMISE_PRICE, 62, 650)

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('[data-enter], [data-copy-enter], .hero-action, .character-stage, .page-note, .interaction-hint', { opacity: 1, y: 0 })
        return
      }
      gsap.fromTo('[data-enter]', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.065, ease: 'power2.out', delay: 0.1 })
      gsap.fromTo('[data-copy-enter]', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power2.out', delay: 0.2 })
      gsap.fromTo('.character-stage', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.25, ease: 'power2.out', delay: 0.05 })
      gsap.fromTo('.hero-action', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: 'power2.out' })
      gsap.fromTo('.page-note, .interaction-hint', { opacity: 0 }, { opacity: 1, duration: 0.9, delay: 1.1 })
    }, root)
    return () => context.revert()
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = new Lenis({ duration: reduced ? 0 : 1.05, smoothWheel: !reduced, anchors: !reduced })
    lenisRef.current = lenis
    let running = false
    let awakeUntil = 0
    let scrollClock = 0
    let previousTick = 0
    const stop = () => { gsap.ticker.remove(tick); running = false }
    const tick = (time: number) => {
      if (document.hidden) { stop(); return }
      scrollClock += Math.min(40, Math.max(0, (time - previousTick) * 1000))
      previousTick = time
      lenis.raf(scrollClock)
      if (performance.now() > awakeUntil && !lenis.isScrolling) stop()
    }
    const wake = () => {
      if (document.hidden || reduced) return
      awakeUntil = performance.now() + 1400
      if (!running) { running = true; previousTick = gsap.ticker.time; gsap.ticker.add(tick) }
    }
    const onVisibility = () => { if (document.hidden) stop() }
    window.addEventListener('wheel', wake, { passive: true })
    window.addEventListener('touchmove', wake, { passive: true })
    window.addEventListener('keydown', wake)
    window.addEventListener('click', wake)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      window.removeEventListener('wheel', wake)
      window.removeEventListener('touchmove', wake)
      window.removeEventListener('keydown', wake)
      window.removeEventListener('click', wake)
      document.removeEventListener('visibilitychange', onVisibility)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const onDesktop = () => { if (desktop.matches) setMenuOpen(false) }
    desktop.addEventListener('change', onDesktop)
    return () => desktop.removeEventListener('change', onDesktop)
  }, [])

  useEffect(() => {
    const lenis = lenisRef.current
    if (!menuOpen) { lenis?.start(); return }
    lenis?.stop()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() }
      if (event.key === 'Tab') {
        const controls = [menuButton.current, ...document.querySelectorAll<HTMLAnchorElement>('.mobile-overlay a')].filter(Boolean) as HTMLElement[]
        const index = controls.indexOf(document.activeElement as HTMLElement)
        if (event.shiftKey && index <= 0) { event.preventDefault(); controls.at(-1)?.focus() }
        else if (!event.shiftKey && index === controls.length - 1) { event.preventDefault(); controls[0]?.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); lenis?.start() }
  }, [menuOpen])

  const closeMenu = () => {
    lenisRef.current?.start()
    setMenuOpen(false)
    menuButton.current?.focus()
  }
  const links = (mobile = false) => NAVIGATION.map(({ href, label }) => (
    <a key={href} href={href} className={mobile ? 'mobile-link-row nav-link' : 'nav-link'} onClick={mobile ? closeMenu : undefined}>{label}</a>
  ))

  return (
    <div ref={root} className={`mainframe-shell ${menuOpen ? 'menu-open' : ''}`}>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <div className="ambient-light" aria-hidden="true" />
      <header className="site-header fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <a href="#service" className="brand" data-enter aria-label="株式会社GIFT ホーム"><span>GIFT<span className="brand-suffix"> INC.</span></span><span className="brand-star" aria-hidden="true">✳︎</span></a>
        <nav className="desktop-nav hidden md:flex" aria-label="メインメニュー" data-enter>{links()}</nav>
        <a href={CONTACT_URL} className="contact-link hidden md:inline-block" data-enter>お問い合わせ・ご相談</a>
        <button ref={menuButton} id="menu-toggle" type="button" className="menu-toggle md:hidden" aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'} aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      </header>
      <nav id="mobile-navigation" className={`mobile-overlay md:hidden ${menuOpen ? 'is-open' : ''}`} aria-label="モバイルメニュー" inert={!menuOpen}>
        {links(true)}
        <a href={CONTACT_URL} className="mobile-contact">お問い合わせ・ご相談</a>
        <span className="mobile-nav-note">株式会社GIFT｜ホームページ制作・保守</span>
      </nav>
      <main id="main-content" className="hero" inert={menuOpen}>
        <Character paused={menuOpen} />
        <div id="service" className="hero-copy">
          <p className="company-label" data-copy-enter><strong>株式会社GIFT｜ホームページ制作・保守</strong></p>
          <h1 className="hero-title" data-copy-enter>
            <span className="headline-line">ホームページの制作も、</span>
            <span className="headline-line">サーバーも、更新も。</span>
            <span className="promise-line">
              <span className="sr-only">{PROMISE_PREFIX}{PROMISE_PRICE}</span>
              <span className="promise-size" aria-hidden="true"><span className="promise-prefix">{PROMISE_PREFIX}</span><span className="price-accent">{priceTypography(PROMISE_PRICE)}</span></span>
              <span className="promise-typing" aria-hidden="true"><span className="promise-prefix">{displayed.slice(0, PROMISE_PREFIX.length)}</span><span className="price-accent">{priceTypography(displayed.slice(PROMISE_PREFIX.length))}</span>{!done && <span className="typing-cursor" />}</span>
            </span>
          </h1>
          <div className="offer-description" data-copy-enter>
            <p><strong>初期費用は0円。</strong>テンプレートではない、御社専用デザインのホームページを最大10ページ。</p>
            <p>公開したあとの管理と更新まで、まとめてお任せいただけます。</p>
          </div>
          <div id="pricing" className="offer-details" data-copy-enter>
            <p className="price-summary"><strong><span className="price-included">サーバー・更新対応 込み</span><span className="monthly-price">月額3万円／月<span className="tax-note">（税抜）</span></span></strong></p>
            <ul className="benefits">
              {BENEFITS.map(benefit => <li key={benefit}><span className="benefit-check" aria-hidden="true">✓</span><strong>{benefit}</strong></li>)}
            </ul>
          </div>
          <a className="hero-action consultation-button" href={CONTACT_URL}><span>お問い合わせ・ご相談はこちら</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
        </div>
      </main>
      <footer className="page-note" inert={menuOpen}><span>株式会社GIFT</span><span className="note-divider" aria-hidden="true">/</span><span>ホームページ制作・保守</span></footer>
    </div>
  )
}
