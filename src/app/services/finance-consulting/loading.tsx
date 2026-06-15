// Solid-colour cover while the finance page stream resolves.
// Must match .finance-page { background: var(--paper) } = #f3f1e7 so
// there is no colour flash between this overlay and the first paint of
// the actual page.
export default function FinanceConsultingLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: '#f3f1e7',
      }}
      aria-label="Loading"
    />
  );
}
