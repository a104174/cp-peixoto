"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BackofficeIcon } from "@/components/backoffice/backoffice-icon";
import { ConfirmDialog } from "@/components/backoffice/confirm-dialog";
import { formatMoney, formatNumber } from "@/domain/quotes/format";
import { deleteQuoteAction } from "@/lib/backoffice/actions";
import type { QuoteListItem } from "@/lib/backoffice/data";

type QuoteListProps = {
  quotes: QuoteListItem[];
  hasQuery: boolean;
  successFeedbackAlreadyVisible: boolean;
};

type ListFeedback = {
  type: "success" | "error";
  message: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
  }).format(new Date(`${value}T12:00:00`));
}

export function QuoteList({
  quotes,
  hasQuery,
  successFeedbackAlreadyVisible,
}: QuoteListProps) {
  const router = useRouter();
  const [deletedQuoteIds, setDeletedQuoteIds] = useState<Set<string>>(() => new Set());
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<ListFeedback | null>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const visibleQuotes = quotes.filter((quote) => !deletedQuoteIds.has(quote.id));

  useEffect(() => {
    if (feedback?.type !== "success") return;

    if (successFeedbackAlreadyVisible) {
      document.getElementById("quote-list-deleted-feedback")?.focus();
    } else {
      feedbackRef.current?.focus();
    }
  }, [feedback, successFeedbackAlreadyVisible]);

  async function confirmDeleteQuote() {
    if (!quoteToDelete || isDeleting) return;

    setIsDeleting(true);
    setFeedback(null);
    try {
      const result = await deleteQuoteAction(quoteToDelete.id);
      if (!result.success) {
        if (result.code === "AUTH_REQUIRED") {
          setQuoteToDelete(null);
          router.push("/backoffice/login?reason=session-expired");
          return;
        }
        setFeedback({ type: "error", message: result.message });
        setQuoteToDelete(null);
        return;
      }

      setDeletedQuoteIds((current) => new Set(current).add(quoteToDelete.id));
      setFeedback({ type: "success", message: "Orçamento eliminado." });
      setQuoteToDelete(null);
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível eliminar o orçamento. Tente novamente.",
      });
      setQuoteToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {feedback && (feedback.type === "error" || !successFeedbackAlreadyVisible) ? (
        <p
          aria-live="polite"
          className={`bo-form-feedback bo-global-feedback bo-quote-delete-feedback${feedback.type === "error" ? " is-error" : ""} bo-quote-list-feedback`}
          ref={feedbackRef}
          role={feedback.type === "error" ? "alert" : "status"}
          tabIndex={feedback.type === "success" ? -1 : undefined}
        >
          {feedback.message}
        </p>
      ) : null}

      {visibleQuotes.length === 0 ? (
        <div className="bo-empty-state">
          <h2>{hasQuery ? "Nenhum orçamento encontrado" : "Ainda não existem orçamentos"}</h2>
          <p>{hasQuery ? "Tente outro termo de pesquisa." : "Crie o primeiro orçamento para começar o histórico."}</p>
          {!hasQuery ? (
            <Link className="bo-button bo-button-secondary" href="/backoffice/orcamentos/novo">
              + Novo orçamento
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="bo-table-wrap">
          <table className="bo-table">
            <thead>
              <tr>
                <th>N.º orçamento</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Local da obra</th>
                <th>Área</th>
                <th>Valor líquido</th>
                <th>Atualizado</th>
                <th><span className="bo-sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td data-label="N.º orçamento">
                    <Link className="bo-table-primary-link" href={`/backoffice/orcamentos/${quote.id}`}>
                      {quote.quote_number}
                    </Link>
                  </td>
                  <td data-label="Data">{formatDate(quote.quote_date)}</td>
                  <td data-label="Cliente">
                    {quote.client_id ? (
                      <Link className="bo-table-primary-link" href={`/backoffice/clientes/${quote.client_id}`}>
                        {quote.client_name_snapshot ?? "Ver cliente"}
                      </Link>
                    ) : quote.client_name_snapshot ?? "Sem cliente"}
                  </td>
                  <td data-label="Local da obra">{quote.project_location ?? "—"}</td>
                  <td data-label="Área">{quote.area ? `${formatNumber(quote.area)} ${quote.area_unit}` : "—"}</td>
                  <td data-label="Valor líquido"><strong>{formatMoney(quote.net_value)}</strong></td>
                  <td data-label="Atualizado">{formatDate(quote.updated_at.slice(0, 10))}</td>
                  <td data-label="Ações">
                    <div className="bo-quote-list-actions">
                      <Link className="bo-link-button" href={`/backoffice/orcamentos/${quote.id}`}>
                        Abrir <BackofficeIcon name="arrow" size={14} />
                      </Link>
                      <button
                        aria-label={`Eliminar orçamento ${quote.quote_number}`}
                        className="bo-icon-button bo-quote-list-delete"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setFeedback(null);
                          setQuoteToDelete(quote);
                        }}
                        title="Eliminar orçamento"
                        type="button"
                      >
                        <BackofficeIcon name="trash" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        confirmLabel="Eliminar orçamento"
        confirmingLabel="A eliminar…"
        description={`O orçamento ${quoteToDelete?.quote_number ?? ""} será removido do backoffice e deixará de aparecer no histórico do cliente.`}
        onCancel={() => {
          if (!isDeleting) setQuoteToDelete(null);
        }}
        onConfirm={confirmDeleteQuote}
        open={Boolean(quoteToDelete)}
        pending={isDeleting}
        title="Eliminar orçamento?"
      />
    </>
  );
}
