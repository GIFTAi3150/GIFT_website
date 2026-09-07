// Route-transition fallback for /services/aiops.
//
// Background is the navy used across this route's covers (the
// [data-flash-guard] ::after in aiops.css, and the route-scoped #page-cover
// recolor in layout.tsx). The page is a navy sheet over a dark liquid plate,
// so a light fallback would flash before it. Keep this string in sync.
//
// We intentionally render NO skeleton content here: a skeleton would have to
// track every layout change in the page, and any drift produces the exact
// "wrong stuff flashing before the page loads" bug this file replaces.
export default function AiOpsLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: '#0B1020',
      }}
      aria-label="Loading"
    />
  );
}
