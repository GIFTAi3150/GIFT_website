'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import PixelRobot from '@/components/ui/PixelRobot';
import company from '@/data/company.json';
import { PLANS } from '@/data/plans';

const inquiryTypes = [
  { value: 'callcenter', label: 'コールセンター事業について' },
  { value: 'dx', label: 'AIOps事業について' },
  // Sits directly under AIOps because ナレッジハーネス is an AIOps product, not a
  // separate line of business. /plans links here with `?inquiry=plans&plan=...`
  // — if this value is ever renamed, CTA.href in
  // src/app/plans/_components/khContent.ts must change with it, or the select
  // silently falls back to "選択してください" (see the guard on line ~30, which
  // only accepts a value present in this array).
  { value: 'plans', label: '料金プランについて' },
  { value: 'finance', label: '財務コンサル事業について' },
  { value: 'recruit', label: '採用について' },
  { value: 'other', label: 'その他' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const v = params.get('inquiry');
    if (v && inquiryTypes.some((t) => t.value === v)) setInquiryType(v);

    // The URL only ever carries a `plan` slug, which is matched against the
    // known PLANS list — every character of the message below comes from
    // that local, trusted data, not from the URL itself, so there is nothing
    // to sanitise. An unrecognised slug just leaves the field empty for the
    // visitor to fill in themselves.
    const slug = params.get('plan');
    if (slug) {
      const matched = PLANS.find((p) => p.slug === slug);
      if (matched) {
        setMessage(
          `「${matched.name}」（${matched.label}）に興味があります。\n\n` +
            `■ サービス内容\n${matched.summary}\n\n` +
            `詳細なご説明とお見積もりをお願いいたします。`,
        );
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      company: (form.elements.namedItem('company') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      inquiryType: (form.elements.namedItem('inquiryType') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      privacy: (form.elements.namedItem('privacy') as HTMLInputElement).checked,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || '送信に失敗しました。');
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '送信に失敗しました。時間をおいて再度お試しください。',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="relative bg-[#0b1020]">
        {/* Autonomous floating deco-rects across the full page bg */}
        <div className="contact-hero-rects" aria-hidden>
          <span className="chr dr-c1" />
          <span className="chr dr-c2" />
          <span className="chr dr-c3" />
          <span className="chr dr-c4" />
          <span className="chr dr-c5" />
          <span className="chr dr-c6" />
          <span className="chr dr-c7" />
          <span className="chr dr-c8" />
          <span className="chr dr-c9" />
          <span className="chr dr-c10" />
          <span className="chr dr-c11" />
          <span className="chr dr-c12" />
          <span className="chr dr-c13" />
          <span className="chr dr-c14" />
          <span className="chr dr-c15" />
          <span className="chr dr-c16" />
        </div>
        {/* Hero */}
        <section className="relative z-10 border-b border-white/10 py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-[#60a5fa]">
              CONTACT
            </p>
            <h1
              className="font-sans font-extrabold text-white"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              お問い合わせ
            </h1>
            <p
              className="mt-6 max-w-2xl font-sans text-normal font-light text-white/60"
              style={{ lineHeight: '2' }}
            ></p>
          </div>
        </section>

        {/* Form + sidebar */}
        <section className="relative z-10 border-t border-white/10 py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
              {/* Form */}
              <Reveal className="lg:col-span-2">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-10">
                  {submitted ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <PixelRobot pose="wave" className="mb-6 h-28 w-28 text-[#2563EB]" />
                      <h2 className="mb-3 font-sans text-large font-extrabold text-gift-ink">
                        送信が完了しました
                      </h2>
                      <p
                        className="max-w-md font-sans text-normal font-light text-gift-silver"
                        style={{ lineHeight: '1.8' }}
                      >
                        お問い合わせありがとうございます。担当者より2〜3営業日以内にご返信いたします。今しばらくお待ちください。
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="mt-8 font-sans text-small text-[#2563EB] underline-offset-4 hover:underline"
                      >
                        続けて別のお問い合わせをする
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field label="お名前" required>
                          <input
                            type="text"
                            name="name"
                            required
                            className="contact-input"
                            placeholder="山田 太郎"
                          />
                        </Field>
                        <Field label="会社名">
                          <input
                            type="text"
                            name="company"
                            className="contact-input"
                            placeholder="株式会社サンプル"
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field label="メールアドレス" required>
                          <input
                            type="email"
                            name="email"
                            required
                            className="contact-input"
                            placeholder="name@example.com"
                          />
                        </Field>
                        <Field label="電話番号">
                          <input
                            type="tel"
                            name="phone"
                            className="contact-input"
                            placeholder="090-0000-0000"
                          />
                        </Field>
                      </div>

                      <Field label="お問い合わせ種別" required>
                        <select
                          name="inquiryType"
                          required
                          className="contact-input"
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                        >
                          <option value="" disabled>
                            選択してください
                          </option>
                          {inquiryTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="お問い合わせ内容" required>
                        <textarea
                          name="message"
                          required
                          rows={7}
                          className="contact-input resize-none"
                          placeholder="ご相談内容をご記入ください。"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </Field>

                      <label className="flex items-start gap-3 font-sans text-small font-light text-gift-silver">
                        <input
                          type="checkbox"
                          name="privacy"
                          required
                          className="mt-1 h-4 w-4 accent-[#2563EB]"
                        />
                        <span>
                          <a
                            href="/privacy"
                            className="font-medium text-[#374151] underline underline-offset-2 hover:text-[#111827]"
                          >
                            プライバシーポリシー
                          </a>
                          に同意の上、送信してください。
                        </span>
                      </label>

                      {error && (
                        <p className="mt-2 rounded-lg bg-red-50 px-4 py-3 font-sans text-[14px] text-red-600">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#2563EB] px-10 py-4 font-sans text-normal font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
                      >
                        {loading ? (
                          '送信中...'
                        ) : (
                          <>
                            送信する <Send className="h-4 w-4" strokeWidth={2} />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>

              {/* Sidebar */}
              <Reveal delay={100} className="lg:col-span-1">
                <div className="flex flex-col gap-8">
                  <div>
                    <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-[#2563EB]">
                      DIRECT
                    </p>
                    <h2 className="mb-6 font-sans text-large font-extrabold text-white">
                      直接のご連絡は
                    </h2>

                    <div className="flex flex-col gap-5">
                      <ContactRow icon={Mail} label="Email">
                        <a href="mailto:it@gift-original.jp" className="hover:text-[#2563EB]">
                          it@gift-original.jp
                        </a>
                      </ContactRow>
                      <ContactRow icon={Phone} label="Tel">
                        <a
                          href={`tel:${company.phone.replace(/-/g, '')}`}
                          className="hover:text-[#2563EB]"
                        >
                          {company.phone}
                        </a>
                      </ContactRow>
                      <ContactRow icon={MapPin} label="Address">
                        {company.address}
                      </ContactRow>
                    </div>
                  </div>

<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
                    <p className="mb-2 font-display text-small font-bold uppercase tracking-widest text-[#60a5fa]">
                      HOURS
                    </p>
                    <h3 className="mb-3 font-sans text-medium font-bold">営業時間</h3>
                    <p className="font-sans text-small font-light leading-relaxed text-white/80">
                      平日 9:00 - 18:00
                      <br />
                      <span className="text-white/60">土日祝日を除く</span>
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-small font-medium text-gift-ink">
        {label}
        {required && <span className="ml-1 text-[#2563EB]">*</span>}
      </span>
      {children}
    </label>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: string | number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 pt-1.5">
        <p className="mb-1 font-display text-small font-bold uppercase tracking-widest text-white/50">
          {label}
        </p>
        <p className="font-sans text-small font-medium text-white transition-colors">
          {children}
        </p>
      </div>
    </div>
  );
}
