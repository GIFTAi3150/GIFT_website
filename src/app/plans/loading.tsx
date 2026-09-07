// Suspense fallback for /plans — solid overlay in the page's true first-paint
// colour (navy field). No skeleton content: anything content-shaped drifts
// out of sync on the next redesign (project memory).
export default function PlansLoading() {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: '#0b1020' }} />;
}
