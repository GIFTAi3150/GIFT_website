// Suspense fallback for /company — solid-colour overlay pattern.
// Hero is 100svh; use #bbbbbb to match the WebGL field pre-load state.
// No skeleton content — prevents wrong-content flash on nav.
export default function CompanyLoading() {
  return (
    <div style={{ minHeight: '100svh', background: '#bbbbbb' }} />
  );
}
