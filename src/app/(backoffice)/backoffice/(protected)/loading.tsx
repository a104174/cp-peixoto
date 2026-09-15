export default function BackofficeLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="bo-card bo-loading-state">
      <span className="bo-loading-dot" aria-hidden="true" />
      A carregar…
    </div>
  );
}
