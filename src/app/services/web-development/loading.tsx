// Suspense fallback for /services/web-development — solid overlay in the page's
// true first-paint colour (navy). No skeleton content: anything content-shaped
// drifts out of sync on the next redesign (project memory).
export default function WebDevelopmentLoading() {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: '#0b1020' }} />;
}
