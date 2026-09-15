"use client";

import { useEffect } from "react";

export default function BackofficeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[backoffice] page load failed", { digest: error.digest });
  }, [error.digest]);
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
