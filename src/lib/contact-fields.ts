export const CONTACT_LIMITS = {
  name: 100,
  company: 200,
  email: 254,
  phone: 40,
  message: 5000,
} as const;

export const CONTACT_INQUIRY_LABELS = {
  callcenter: 'コールセンター事業について',
  dx: 'AIOps事業について',
  plans: '料金プランについて',
  finance: '財務コンサル事業について',
  recruit: '採用について',
  other: 'その他',
} as const;
