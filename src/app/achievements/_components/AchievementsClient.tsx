'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '../achievements.css';

export default function AchievementsClient() {
  useEffect(() => {
    // Dispatch gift:logo-ready so the page-cover fade works
    window.dispatchEvent(new Event('gift:logo-ready'));

    // ---- Reveal observer ----
    const revealEls = document.querySelectorAll('.ach-rv');
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            revealIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    revealEls.forEach((el) => revealIO.observe(el));

    // ---- Counter animation ----
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const counterEls = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
    counterEls.forEach((el) => {
      el.textContent = el.dataset.count ?? '0';
    });
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const end = parseFloat(el.dataset.count ?? '0');
          const dur = 1700;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            el.textContent = String(
              end >= 100 ? Math.round(easeOut(p) * end) : Math.round(easeOut(p) * end),
            );
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = String(end);
          };
          requestAnimationFrame(tick);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.4 },
    );
    counterEls.forEach((el) => counterIO.observe(el));

    // ---- Lenis smooth scroll ----
    let lenisCleanup: (() => void) | undefined;
    import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      } as ConstructorParameters<typeof Lenis>[0]);
      let rafId: number;
      const raf = (t: number) => {
        lenis.raf(t);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      lenisCleanup = () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    });

    // ---- Accolades scroll-driven panner ----
    const accSection = document.getElementById('accolades');
    const accCards = document.getElementById('accCards');
    const accFill = document.getElementById('accMeterFill');
    const accLabel = document.getElementById('accMeterLabel');
    const accBgWord = document.getElementById('accBgWord');
    const accTrack = accSection?.querySelector<HTMLElement>('.acc-track');
    let accRafId: number;

    if (accSection && accCards && accTrack && accFill && accLabel && accBgWord) {
      const cardEls = Array.from(accCards.children) as HTMLElement[];
      const total = cardEls.length;

      if (window.innerWidth >= 820) {
        cardEls.forEach((el) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          el.style.transition =
            'opacity .5s var(--ease), transform .5s var(--ease), border-color .6s var(--ease), box-shadow .6s var(--ease)';
        });
      }

      const updateAcc = () => {
        if (window.innerWidth < 820) {
          accCards.style.transform = '';
          accBgWord.style.transform = '';
          return;
        }
        const rect = accSection.getBoundingClientRect();
        const range = accSection.offsetHeight - window.innerHeight;
        const passed = Math.max(0, -rect.top);
        const p = Math.min(1, range > 0 ? passed / range : 0);
        const distance = Math.max(0, accCards.scrollWidth - accTrack.clientWidth + 24);
        accCards.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
        accBgWord.style.transform = `translate3d(${p * distance * 0.4 - distance * 0.2}px, -50%, 0)`;
        accFill.style.transform = `scaleX(${p})`;
        const idx = Math.min(total, Math.max(1, Math.floor(p * total * 0.9999) + 1));
        accLabel.textContent =
          String(idx).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
        const trackRect = accTrack.getBoundingClientRect();
        const focalX = trackRect.left + trackRect.width * 0.5;
        cardEls.forEach((el) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const dist = Math.abs(cx - focalX) / window.innerWidth;
          if (dist < 0.65) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          } else {
            el.style.opacity = String(Math.max(0.25, 1 - (dist - 0.65) * 2));
            el.style.transform = 'translateY(0)';
          }
          el.classList.toggle('focal', dist < 0.18);
        });
      };

      const tickAcc = () => {
        updateAcc();
        accRafId = requestAnimationFrame(tickAcc);
      };
      accRafId = requestAnimationFrame(tickAcc);
    }

    // ---- Mascot scroll companion ----
    const mascotEl = document.querySelector<HTMLElement>('.hero-mascot');
    let mascotRaf: number;

    if (mascotEl) {
      // [progress, value] keyframe tables
      const xKeys =     [[0,0],[0.12,0],[0.35,-0.28],[0.52,-0.08],[0.68,-0.30],[0.84,0],[1,0]];
      const scaleKeys = [[0,1],[0.28,1],[0.42,1.35],[0.55,1.1],[0.70,1.28],[0.86,1],[1,1]];

      const interp = (keys: number[][], p: number) => {
        for (let i = 0; i < keys.length - 1; i++) {
          if (p <= keys[i + 1][0]) {
            const t = (p - keys[i][0]) / (keys[i + 1][0] - keys[i][0]);
            return keys[i][1] + (keys[i + 1][1] - keys[i][1]) * t;
          }
        }
        return keys[keys.length - 1][1];
      };

      let curX = 0, curScale = 1;

      const tickMascot = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0;

        const tgtX = interp(xKeys, progress) * window.innerWidth;
        const tgtScale = interp(scaleKeys, progress);
        const opacity = progress > 0.92 ? Math.max(0, 1 - (progress - 0.92) / 0.08) : 1;

        curX += (tgtX - curX) * 0.055;
        curScale += (tgtScale - curScale) * 0.055;

        mascotEl.style.transform = `translateX(${curX.toFixed(1)}px) scale(${curScale.toFixed(3)})`;
        mascotEl.style.opacity = opacity.toFixed(3);

        mascotRaf = requestAnimationFrame(tickMascot);
      };
      mascotRaf = requestAnimationFrame(tickMascot);
    }

    return () => {
      revealIO.disconnect();
      counterIO.disconnect();
      if (accRafId) cancelAnimationFrame(accRafId);
      if (mascotRaf) cancelAnimationFrame(mascotRaf);
      lenisCleanup?.();
    };
  }, []);

  return (
    <>
      <Header />
      <div className="achievements-page">
        <div className="ap-grain" aria-hidden />

        {/* ── Mascot — fixed scroll companion ── */}
        <div className="hero-mascot" aria-hidden>
          <img src="/achievements/GIFT_mascot_space_render.png" alt="" />
        </div>

        {/* ── Hero ── */}
        <section className="hero" id="hero">
          <div className="wrap">
            <h1>
              <span className="word">
                <span className="inner">築いてきた、</span>
              </span>
              <span className="word">
                <span className="inner">
                  <span className="gh">信頼</span>の
                </span>
              </span>
              <span className="word">
                <span className="inner">重み。</span>
              </span>
            </h1>
            <p className="sub lead">
              コールセンターから始まったGIFTは、8年で3事業・300名超の組織になりました。
              <br />
              数字の裏側には、声で動かしてきた人の物語があります。
              <br />
              その<span className="gh">軌跡</span>のすべてを、ここに記録します。
            </p>
            <div className="actions">
              <a href="#stats" className="btn primary">
                数字で見る <span className="arr">→</span>
              </a>
              <a href="#accolades" className="btn ghost">
                受賞・認定を見る <span className="arr">↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="stats" id="stats">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow ach-rv">By the Numbers · 数字でみるGIFT</span>
                <h2 className="ach-rv d1">
                  8年で
                  <br />
                  育てた、<span className="gh">芯のある</span>数字。
                </h2>
              </div>
              <p className="lead ach-rv d2" style={{ maxWidth: '32ch' }}>
                外向きの広告数字ではなく、
                <br />
                現場の手応えから積み上がった指標を並べました。
              </p>
            </div>
            <div className="tick ach-rv">
              <span>SECTION / 01</span>
              <span className="gh">— FIGURES</span>
              <span>UPDATED 2026 Q1</span>
              <span style={{ marginLeft: 'auto' }}>SOURCE / 社内KPI</span>
            </div>
            <div className="grid">
              <div className="tile ach-rv d1">
                <div className="label">
                  <span>STAFF</span>
                  <span className="idx">01</span>
                </div>
                <div className="num">
                  <span data-count="312">0</span>
                  <span className="unit">名+</span>
                </div>
                <p className="desc">
                  2018年の創業時5名から、コール・DX・財務の3事業を横断する大規模組織へ。離職率は業界平均の半分。
                </p>
                <svg className="spark" viewBox="0 0 60 24" preserveAspectRatio="none">
                  <polyline
                    points="0,20 8,18 16,15 24,16 32,11 40,8 48,4 60,2"
                    fill="none"
                    stroke="#E8B04C"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="tile ach-rv d2">
                <div className="label">
                  <span>BUSINESS LINES</span>
                  <span className="idx">02</span>
                </div>
                <div className="num">
                  <span data-count="3">0</span>
                  <span className="unit">事業</span>
                </div>
                <p className="desc">
                  コールセンター、DXコンサル、財務コンサル。横断的に活きるスキルを、ひとつの会社の中で育てます。
                </p>
                <svg className="spark" viewBox="0 0 60 24" preserveAspectRatio="none">
                  <polyline
                    points="0,16 12,16 20,8 32,8 40,2 60,2"
                    fill="none"
                    stroke="#E8B04C"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="tile ach-rv d3">
                <div className="label">
                  <span>CLIENT PROJECTS</span>
                  <span className="idx">03</span>
                </div>
                <div className="num">
                  <span data-count="184">0</span>
                  <span className="unit">件</span>
                </div>
                <p className="desc">
                  大手通信、金融、SaaS、不動産まで。継続率94%、平均パートナー年数3.7年。
                </p>
                <svg className="spark" viewBox="0 0 60 24" preserveAspectRatio="none">
                  <polyline
                    points="0,22 8,20 14,18 22,14 30,15 38,10 46,7 54,4 60,3"
                    fill="none"
                    stroke="#E8B04C"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="tile ach-rv d4">
                <div className="label">
                  <span>SATISFACTION</span>
                  <span className="idx">04</span>
                </div>
                <div className="num">
                  <span data-count="98">0</span>
                  <span className="unit">%</span>
                </div>
                <p className="desc">
                  研修完走率98%、社員満足度4.6/5。「働きやすさ」で選ばれる現場をつくり続けます。
                </p>
                <svg className="spark" viewBox="0 0 60 24" preserveAspectRatio="none">
                  <polyline
                    points="0,12 10,10 20,11 30,8 40,6 50,5 60,3"
                    fill="none"
                    stroke="#E8B04C"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ── Videos ── */}
        <section className="videos" id="videos">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow ach-rv">Film · 映像</span>
                <h2 className="ach-rv d1">
                  数字は語らない
                  <br />
                  ことを、<span className="gh">映像</span>で。
                </h2>
              </div>
            </div>
            <div className="tick ach-rv">
              <span>SECTION / 02</span>
            </div>
            <div className="v-feature ach-rv">
              <video autoPlay muted loop playsInline>
                <source src="/video/achievements-vid.mp4" type="video/mp4" />
              </video>
              <div className="veil" />
            </div>
          </div>
        </section>

        {/* ── Accolades ── */}
        <section className="accolades" id="accolades">
          <div className="acc-pin">
            <div className="acc-bg-grid" />
            <div className="acc-bg-word" id="accBgWord">
              RECOGNITION · 受賞 · CERTIFIED · 認定 · RECOGNITION · 受賞 · CERTIFIED · 認定
            </div>
            <div className="acc-header">
              <div>
                <span className="eyebrow ach-rv">Recognition · 受賞・認定</span>
                <h2 className="ach-rv d1">
                  外からの<span className="gh">評価</span>もまた、
                  <br />
                  燃料になる。
                </h2>
              </div>
              <p className="lead ach-rv d2 right">
                広告や寄稿ではなく、
                <br />
                第三者の審査と国の基準で受け取った評価だけを並べました。
              </p>
            </div>
            <div className="acc-track">
              <div className="acc-cards" id="accCards">
                <article className="acc-card">
                  <div className="top">
                    <span className="num">01 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-1"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-1">
                            HDI ★★★ · BENCHMARK · HDI ★★★ · BENCHMARK ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">★</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2023<span className="post">CERT</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">HDI 格付けベンチマーク — 三つ星評価</div>
                    <div className="org">HDI-Japan / Support Center Division</div>
                    <p className="body">
                      サポートセンター運営の総合品質で最高位「★★★」を獲得。応答品質・運営管理の両軸で業界トップ水準と認定。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">02 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-2"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-2">
                            BEST CALL CENTER · 業界大賞 · BEST CALL CENTER ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">▲</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2024<span className="post">AWARD</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">業界大賞 — Best Call Center Award 総合大賞</div>
                    <div className="org">月刊 コールセンター・ジャパン誌</div>
                    <p className="body">
                      「自社運営の質」が業界誌主催のオブザーバー賞で評価され、応募 187
                      社のなかから総合大賞を受賞。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">03 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-3"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-3">
                            DX CERTIFIED · DX認定事業者 · DX CERTIFIED ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">◆</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2024<span className="post">CERT</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">DX認定事業者 — 情報処理推進機構</div>
                    <div className="org">経済産業省 / IPA</div>
                    <p className="body">
                      経営ビジョンに基づくDX推進体制が国の基準に適合。受託案件のみならず、自社の業務基盤でも認定要件を達成。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">04 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-4"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-4">
                            GREAT PLACE TO WORK · 働きがいのある会社 ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">●</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2025<span className="post">RANK</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">働きがいのある会社 — 中規模部門 ランクイン</div>
                    <div className="org">Great Place to Work® Institute Japan</div>
                    <p className="body">
                      従業員アンケート・組織カルチャー監査の両軸で評価。中規模部門
                      100〜999名カテゴリで初年度ランクイン。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">05 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-5"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-5">
                            健康経営優良法人 · KENKO 2025 · 健康経営 ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">+</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2025<span className="post">CERT</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">健康経営優良法人 — 大規模法人部門</div>
                    <div className="org">経済産業省 / 日本健康会議</div>
                    <p className="body">
                      心身の健康投資・労働環境・予防医療の各指標で経済産業省の認定基準を上回り、大規模法人部門で取得。
                    </p>
                  </div>
                </article>

                <article className="acc-card">
                  <div className="top">
                    <span className="num">06 / 06</span>
                    <div className="seal">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
                        <defs>
                          <path
                            id="seal-6"
                            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                          />
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E8B04C"
                          strokeWidth="0.6"
                          fill="none"
                          opacity="0.35"
                        />
                        <text
                          fill="#E8B04C"
                          fontFamily="Poppins"
                          fontWeight="700"
                          fontSize="6.4"
                          letterSpacing="3"
                        >
                          <textPath href="#seal-6">
                            ISO 27001 · INFORMATION SECURITY · ISO 27001 ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="core">▣</span>
                    </div>
                  </div>
                  <div className="mid">
                    <div className="year">
                      2025<span className="post">CERT</span>
                    </div>
                  </div>
                  <div className="bottom">
                    <div className="ttl">ISO/IEC 27001 — 情報セキュリティ認証取得</div>
                    <div className="org">BSI Japan / ISMS</div>
                    <p className="body">
                      全社情報資産・クライアント預託データの管理体制を国際基準で監査。財務コンサル事業部の認証取得を皮切りに、全部署へ展開中。
                    </p>
                  </div>
                </article>
              </div>
            </div>
            <div className="acc-meter">
              <span className="label" id="accMeterLabel">
                01 / 06
              </span>
              <div className="bar">
                <div className="fill" id="accMeterFill" />
              </div>
              <span className="end">2023 → 2025</span>
              <span className="scroll-hint">SCROLL</span>
            </div>
          </div>
        </section>

        {/* ── Quote ── */}
        <section className="quote" id="quote">
          <div className="marquee" aria-hidden>
            <span className="track">
              opportunity · 機会 · opportunity · 機会 · opportunity · 機会 ·{' '}
            </span>
            <span className="track">
              opportunity · 機会 · opportunity · 機会 · opportunity · 機会 ·{' '}
            </span>
          </div>
          <div className="wrap">
            <div className="mark ach-rv">&ldquo;</div>
            <p className="body ach-rv d1">
              数字は、信頼の
              <br />
              <span className="em">残響</span>にすぎない。
              <br />
              鳴らしたのは、いつも人だった。
            </p>
            <div className="attr ach-rv d2">— 代表取締役 / 大塚 一平 · 2026 年頭所感より</div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ach-cta" id="cta">
          <div className="wrap">
            <span className="eyebrow ach-rv">Contact · お問い合わせ</span>
            <h2 className="ach-rv d1">
              GIFTと、<span className="gh">共に</span>
              <br />
              歩みませんか。
            </h2>
            <p className="sub lead ach-rv d2">
              事業の課題でも、採用のご相談でも。
              <br />
              まずは気軽にお声がけください。
            </p>
            <div className="actions ach-rv d3">
              <Link href="/contact" className="btn primary">
                お問い合わせ <span className="arr">→</span>
              </Link>
              <Link href="/recruit" className="btn ghost">
                採用情報を見る <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <div style={{ position: 'relative', zIndex: 3 }}>
        <Footer />
      </div>
    </>
  );
}
