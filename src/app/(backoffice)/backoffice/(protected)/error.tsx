"use client";

export default function BackofficeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bo-card bo-error-state">
      <h1>Ocorreu um erro</h1>
      <p>Não foi possível carregar esta página.</p>
      <button className="bo-button bo-button-secondary" onClick={() => reset()} type="button">
        Tentar novamente
      </button>
    </div>
  );
}

