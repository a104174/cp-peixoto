"use client";

import { useRef, useState, type FormEvent } from "react";

import { BackofficeDialog } from "./backoffice-dialog";
import { BackofficeIcon } from "./backoffice-icon";

type QuotePdfButtonProps = {
  disabled?: boolean;
  quoteId: string;
  initialWorkDescription: string | null;
  prefillDescription: string;
  onError: (message: string) => void;
};

type PdfKind = "internal" | "client";

function responseFilename(response: Response): string | null {
  const disposition = response.headers.get("content-disposition");
  if (!disposition) return null;
  const match = /filename="([^"]+)"/i.exec(disposition);
  return match?.[1] ?? null;
}

async function ensurePdfResponse(response: Response): Promise<Blob> {
  if (
    response.redirected &&
    new URL(response.url).pathname === "/backoffice/login"
  ) {
    window.location.assign(response.url);
    throw new Error("Session expired");
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.includes("application/pdf")) {
    throw new Error("PDF response unavailable");
  }
  return response.blob();
}

function saveBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
}

export function QuotePdfButton({
  disabled = false,
  quoteId,
  initialWorkDescription,
  prefillDescription,
  onError,
}: QuotePdfButtonProps) {
  const [generating, setGenerating] = useState<PdfKind | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [lastWorkDescription, setLastWorkDescription] = useState(initialWorkDescription);
  const [workDescription, setWorkDescription] = useState("");
  const [clientPdfError, setClientPdfError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  function openClientModal() {
    if (disabled || inFlightRef.current) return;
    setClientPdfError(null);
    setWorkDescription(lastWorkDescription ?? prefillDescription);
    setClientModalOpen(true);
  }

  async function downloadInternalPdf() {
    if (disabled || inFlightRef.current) return;
    inFlightRef.current = true;
    setGenerating("internal");
    try {
      const response = await fetch(
        `/backoffice/orcamentos/${quoteId}/pdf/internal`,
        { credentials: "same-origin" },
      );
      const blob = await ensurePdfResponse(response);
      saveBlob(blob, responseFilename(response) ?? "CP-Peixoto_Intern.pdf");
    } catch (error) {
      console.error("[backoffice] download internal quote PDF", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      onError("Não foi possível gerar o PDF interno. Tente novamente.");
    } finally {
      inFlightRef.current = false;
      setGenerating(null);
    }
  }

  async function generateClientPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || inFlightRef.current) return;
    inFlightRef.current = true;
    setGenerating("client");
    try {
      const response = await fetch(
        `/backoffice/orcamentos/${quoteId}/pdf/client`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workDescription }),
        },
      );
      const blob = await ensurePdfResponse(response);
      saveBlob(blob, responseFilename(response) ?? "CP_Peixoto_Offerte.pdf");
      setLastWorkDescription(workDescription);
      setClientModalOpen(false);
    } catch (error) {
      setClientPdfError("Não foi possível gerar o PDF cliente. Tente novamente.");
      console.error("[backoffice] download client quote PDF", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      onError("Não foi possível gerar o PDF cliente. Tente novamente.");
    } finally {
      inFlightRef.current = false;
      setGenerating(null);
    }
  }

  return (
    <>
      <button
        className="bo-button bo-button-secondary"
        disabled={disabled || generating !== null}
        onClick={downloadInternalPdf}
        title={disabled ? "Guarde as alterações antes de gerar o PDF." : undefined}
        type="button"
      >
        <BackofficeIcon name="download" size={16} />
        {generating === "internal" ? "A gerar PDF…" : "PDF interno"}
      </button>
      <button
        className="bo-button bo-button-secondary"
        disabled={disabled || generating !== null}
        onClick={openClientModal}
        title={disabled ? "Guarde as alterações antes de gerar o PDF." : undefined}
        type="button"
      >
        <BackofficeIcon name="download" size={16} />
        PDF cliente
      </button>

      <BackofficeDialog
        onClose={() => {
          if (!inFlightRef.current) setClientModalOpen(false);
        }}
        open={clientModalOpen}
      >
        <form
          aria-describedby="client-pdf-description-help"
          aria-labelledby="client-pdf-title"
          aria-modal="true"
          className="bo-dialog bo-dialog-form bo-client-pdf-dialog"
          data-bo-dialog
          onSubmit={generateClientPdf}
          role="dialog"
        >
          <p className="bo-eyebrow">Documento para o cliente</p>
          <h2 id="client-pdf-title">PDF para cliente</h2>
          <p id="client-pdf-description-help">
            Edite a descrição que aparecerá na Arbeitsbeschreibung. Cada linha será apresentada como um tópico.
          </p>
          <label className="bo-field bo-field-full" htmlFor="client-pdf-work-description">
            Descrição dos trabalhos
            <textarea
              autoFocus
              className="bo-input bo-textarea bo-pdf-work-description"
              id="client-pdf-work-description"
              maxLength={20_000}
              onChange={(event) => setWorkDescription(event.target.value)}
              placeholder={
                "Vorbereitung des Untergrundes.\nDiamantschleifen der Betonflächen.\nGründliches Absaugen und Reinigen der Flächen."
              }
              rows={9}
              value={workDescription}
            />
          </label>
          {clientPdfError ? (
            <p aria-live="polite" className="bo-form-feedback is-error" role="alert">
              {clientPdfError}
            </p>
          ) : null}
          <div className="bo-dialog-actions">
            <button
              className="bo-button bo-button-secondary"
              disabled={generating !== null}
              onClick={() => setClientModalOpen(false)}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="bo-button bo-button-primary"
              disabled={generating !== null}
              type="submit"
            >
              {generating === "client" ? "A gerar PDF…" : "Gerar PDF"}
            </button>
          </div>
        </form>
      </BackofficeDialog>
    </>
  );
}
