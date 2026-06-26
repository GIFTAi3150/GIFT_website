// Route-transition fallback for /services/aiops.
//
// Background is the dark load field used across this route's covers (the
// [data-flash-guard] ::after, the inline cover, and the route-scoped
// #page-cover recolor). The hero is a dark liquid backdrop, so a light
// fallback would flash before it. Keep this string in sync with those.
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
        background: 'linear-gradient(160deg, #0b0b0e 0%, #17181c 100%)',
      }}
      aria-label="Loading"
    />
  );
}

