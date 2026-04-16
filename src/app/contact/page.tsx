'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import company from '@/data/company.json';

const inquiryTypes = [
  { value: 'callcenter', label: 'コールセンター事業について' },
  { value: 'dx', label: 'DXコンサル事業について' },
  { value: 'finance', label: '財務コンサル事業について' },
  { value: 'recruit', label: '採用について' },
  { value: 'other', label: 'その他' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // TODO: wire up real form submission (email endpoint / API route)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero */}
        <section className="border-b border-gift-border py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              CONTACT
            </p>
            <h1
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              お問い合わせ
            </h1>
            <p
              className="mt-6 max-w-2xl font-sans text-normal font-light text-gift-silver"
              style={{ lineHeight: '2' }}
            >
              事業に関するご相談、お見積り、採用のご応募まで、どんなお問い合わせでも下記フォームよりお気軽にご連絡ください。通常2〜3営業日以内に担当者よりご返信いたします。
            </p>
          </div>
        </section>

        {/* Form + sidebar */}
        <section className="py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
              {/* Form */}
              <Reveal className="lg:col-span-2">
                <div className="rounded-2xl border border-gift-border bg-white p-6 md:p-10">
                  {submitted ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gift-green text-white">
                        <Check className="h-8 w-8" strokeWidth={2.5} />
                      </div>
                      <h2 className="mb-3 font-sans text-large font-extrabold text-gift-ink">
                        送信が完了しました
                      </h2>
                      <p className="max-w-md font-sans text-normal font-light text-gift-silver" style={{ lineHeight: '1.8' }}>
                        お問い合わせありがとうございます。担当者より2〜3営業日以内にご返信いたします。今しばらくお待ちください。
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="mt-8 font-sans text-small text-gift-green underline-offset-4 hover:underline"
                      >
                        続けて別のお問い合わせをする
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field label="お名前" required>
                          <input type="text" name="name" required className="contact-input" placeholder="山田 太郎" />
                        </Field>
                        <Field label="会社名">
                          <input type="text" name="company" className="contact-input" placeholder="株式会社サンプル" />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field label="メールアドレス" required>
                          <input type="email" name="email" required className="contact-input" placeholder="name@example.com" />
                        </Field>
                        <Field label="電話番号">
                          <input type="tel" name="phone" className="contact-input" placeholder="090-0000-0000" />
                        </Field>
                      </div>

                      <Field label="お問い合わせ種別" required>
                        <select name="type" required className="contact-input" defaultValue="">
                          <option value="" disabled>選択してください</option>
                          {inquiryTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
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
                        />
                      </Field>

                      <label className="flex items-start gap-3 font-sans text-small font-light text-gift-silver">
                        <input type="checkbox" required className="mt-1 h-4 w-4 accent-gift-green" />
                        <span>
                          <a href="/privacy" className="text-gift-green underline underline-offset-2">プライバシーポリシー</a>
                          に同意の上、送信してください。
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full bg-gift-ink px-10 py-4 font-sans text-normal font-semibold text-white transition-colors hover:bg-gift-green disabled:opacity-50"
                      >
                        {loading ? '送信中...' : <>送信する <Send className="h-4 w-4" strokeWidth={2} /></>}
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>

              {/* Sidebar */}
              <Reveal delay={100} className="lg:col-span-1">
                <div className="flex flex-col gap-8">
                  <div>
                    <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                      DIRECT
                    </p>
                    <h2 className="mb-6 font-sans text-large font-extrabold text-gift-ink">
                      直接のご連絡は
                    </h2>

                    <div className="flex flex-col gap-5">
                      <ContactRow icon={Mail} label="Email">
                        <a href="mailto:it@gift-original.jp" className="hover:text-gift-green">
                          it@gift-original.jp
                        </a>
                      </ContactRow>
                      <ContactRow icon={Phone} label="Tel">
                        <a href={`tel:${company.phone.replace(/-/g, '')}`} className="hover:text-gift-green">
                          {company.phone}
                        </a>
                      </ContactRow>
                      <ContactRow icon={MapPin} label="Address">
                        {company.address}
                      </ContactRow>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gift-border bg-white p-6">
                    <p className="mb-2 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                      RECRUIT
                    </p>
                    <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">
                      採用へのご応募について
                    </h3>
                    <p className="mb-4 font-sans text-small font-light leading-relaxed text-gift-silver">
                      採用へのご応募もこちらのフォームから統一で受け付けています。初回連絡後、LINE求人アカウントへご案内します。
                    </p>
                    <a
                      href="/recruit"
                      className="inline-flex items-center gap-2 font-sans text-small font-medium text-gift-green hover:text-gift-hover-dark"
                    >
                      採用ページを見る →
                    </a>
                  </div>

                  <div className="rounded-2xl bg-gift-ink p-6 text-white">
                    <p className="mb-2 font-display text-small font-bold uppercase tracking-widest text-gift-green">
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
        {required && <span className="ml-1 text-gift-green">*</span>}
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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gift-green/10 text-gift-green">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 pt-1.5">
        <p className="mb-1 font-display text-small font-bold uppercase tracking-widest text-gift-silver">
          {label}
        </p>
        <p className="font-sans text-small font-medium text-gift-ink transition-colors">
          {children}
        </p>
      </div>
    </div>
  );
}
