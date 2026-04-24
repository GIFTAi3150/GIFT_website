import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await req.json();
    const { name, company, email, phone, inquiryType, message, privacy } = body;

    // Basic validation
    if (!name || !email || !message || !privacy) {
      return NextResponse.json(
        { error: '必須項目を入力してください。' },
        { status: 400 }
      );
    }

    const inquiryLabels: Record<string, string> = {
      callcenter: 'コールセンター事業について',
      dx: 'DXコンサル事業について',
      finance: '財務コンサル事業について',
      recruit: '採用について',
      other: 'その他',
    };

    await resend.emails.send({
      from: 'GIFT お問い合わせ <noreply@gift-original.jp>',
      to: 'it@gift-original.jp',
      subject: `【お問い合わせ】${inquiryLabels[inquiryType] || 'その他'} - ${name}様`,
      replyTo: email,
      text: [
        `━━━━━━━━━━━━━━━━━━━━━━━━`,
        `  株式会社GIFT ウェブサイトからのお問い合わせ`,
        `━━━━━━━━━━━━━━━━━━━━━━━━`,
        ``,
        `■ お名前: ${name}`,
        `■ 会社名: ${company || '未記入'}`,
        `■ メール: ${email}`,
        `■ 電話番号: ${phone || '未記入'}`,
        `■ お問い合わせ種別: ${inquiryLabels[inquiryType] || '未選択'}`,
        ``,
        `■ お問い合わせ内容:`,
        message,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━`,
        `このメールはGIFTウェブサイトのお問い合わせフォームから自動送信されました。`,
        `返信先: ${email}`,
      ].join('\n'),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: '送信に失敗しました。時間をおいて再度お試しください。' },
      { status: 500 }
    );
  }
}
