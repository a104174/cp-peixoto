"use client";

import { useState } from "react";

import { BackofficeIcon } from "./backoffice-icon";

type QuotePdfButtonProps = {
  disabled?: boolean;
  quoteId: string;
  onError: (message: string) => void;
};

function responseFilename(response: Response): string | null {
  const disposition = response.headers.get("content-disposition");
  if (!disposition) return null;
  const match = /filename="([^"]+)"/i.exec(disposition);
  return match?.[1] ?? null;
}

export function QuotePdfButton({
  disabled = false,
  quoteId,
  onError,
}: QuotePdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function downloadPdf() {
    if (isGenerating || disabled) return;
    setIsGenerating(true);

    try {
      const response = await fetch(`/backoffice/orcamentos/${quoteId}/pdf`, {
        credentials: "same-origin",
      });

      if (
        response.redirected &&
        new URL(response.url).pathname === "/backoffice/login"
      ) {
        window.location.assign(response.url);
        return;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || !contentType.includes("application/pdf")) {
        throw new Error("PDF response unavailable");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = responseFilename(response) ?? "CP-Peixoto_Orcamento.pdf";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch (error) {
      console.error("[backoffice] download quote PDF", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      onError("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      className="bo-button bo-button-secondary"
      disabled={disabled || isGenerating}
      onClick={downloadPdf}
      title={disabled ? "Guarde as alterações antes de gerar o PDF." : undefined}
      type="button"
    >
      <BackofficeIcon name="download" size={16} />
      {isGenerating ? "A gerar PDF…" : "Descarregar PDF"}
    </button>
  );
}
