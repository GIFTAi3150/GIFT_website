import company from '@/data/company.json';

const rows = [
  { label: '会社名', value: company.name },
  { label: '設立', value: company.founded },
  { label: '代表者', value: company.ceo },
  { label: '本社', value: company.address },
  { label: '電話', value: company.phone },
  { label: 'インボイス登録番号', value: company.invoiceNumber },
];

export default function CompanySnapshot() {
  return (
    <section className="w-full bg-gift-green-pale-2 py-s-80">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-2">
          <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
            Company
          </p>
          <h2
            className="font-sans font-extrabold text-gift-ink"
            style={{ fontSize: '36px', lineHeight: '1.25' }}
          >
            会社概要
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/4.jpg"
              alt="株式会社GIFT オフィス"
              className="h-full w-full object-cover"
            />
          </div>

          <dl className="flex flex-col divide-y divide-gift-grey-body/20">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6">
                <dt
                  className="shrink-0 font-sans font-medium text-gift-grey-body"
                  style={{ fontSize: '13px', minWidth: '160px', lineHeight: '1.8' }}
                >
                  {row.label}
                </dt>
                <dd
                  className="font-sans text-gift-ink"
                  style={{ fontSize: '16px', lineHeight: '1.8' }}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
