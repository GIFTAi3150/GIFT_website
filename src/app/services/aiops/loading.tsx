// Route-transition fallback for /services/aiops.
//
// Background must match `.dx-v3 { background: var(--paper) }` in dx-v3.css
// (#f5f7ff). Anything else creates a visible color flash between this
// fallback and the real page paint.
//
// We intentionally render NO skeleton content here. A skeleton would have
// to track every layout change in DxV3Page, and any drift produces the
// exact "wrong stuff flashing before the page loads" bug this file is
// replacing. The page's own [data-flash-guard] handles the inverse seam
// (preventing the new page from painting at a stale scroll position).
export default function DxConsultingLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: '#f5f7ff',
      }}
      aria-label="Loading"
    />
  );
}

