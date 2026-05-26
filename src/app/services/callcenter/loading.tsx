export default function CallCenterLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: '#0E0A24',
      }}
      aria-label="Loading"
    />
  );
}
