import { Resend } from 'resend';
import { notifySlack } from '@/lib/notify-slack';
import { CONTACT_INQUIRY_LABELS } from '@/lib/contact-fields';
import { createContactHandler } from '@/lib/contact-security';

export const dynamic = 'force-dynamic';

export const POST = createContactHandler({
  trustProxyHeaders:
    process.env.VERCEL === '1' || process.env.CONTACT_TRUST_PROXY_HEADERS === 'true',
  async send({ name, company, email, phone, inquiryType, message }) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'GIFT お問い合わせ <noreply@gift-original.jp>',
      to: 'it@gift-original.jp',
      subject: '【お問い合わせ】' + CONTACT_INQUIRY_LABELS[inquiryType] + ' - ' + name + '様',
      replyTo: email,
      text: [
        '━━━━━━━━━━━━━━━━━━━━━━━━',
        '  株式会社GIFT ウェブサイトからのお問い合わせ',
        '━━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        '■ お名前: ' + name,
        '■ 会社名: ' + (company || '未記入'),
        '■ メール: ' + email,
        '■ 電話番号: ' + (phone || '未記入'),
        '■ お問い合わせ種別: ' + CONTACT_INQUIRY_LABELS[inquiryType],
        '',
        '■ お問い合わせ内容:',
        message,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━━',
        'このメールはGIFTウェブサイトのお問い合わせフォームから自動送信されました。',
        '返信先: ' + email,
      ].join('\n'),
    });
    if (error) throw new Error('Contact email delivery was rejected');
  },
  async onDeliveryError() {
    console.error('Contact email delivery failed');
    await notifySlack({
      title: 'お問い合わせフォーム送信エラー',
      message: 'Email delivery failed. No contact submission data is included in this alert.',
      fields: { Route: '/api/contact', Env: process.env.VERCEL_ENV || 'development' },
      dedupKey: 'contact-error',
    });
  },
});
