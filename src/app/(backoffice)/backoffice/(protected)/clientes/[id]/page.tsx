import Decimal from "decimal.js";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackofficeIcon } from "@/components/backoffice/backoffice-icon";
import { formatMoney, formatPercent } from "@/domain/quotes/format";
import { getClientWithQuotes } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatDate(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

function displayValue(value: string | null): string {
  return value?.trim() || "—";
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!uuidPattern.test(id)) notFound();

  const data = await getClientWithQuotes(id);
  if (!data) notFound();

  const { client, quotes } = data;
  const totalNetValue = quotes.reduce(
    (total, quote) => total.plus(quote.net_value),
    new Decimal(0),
  );
  const newQuoteHref = `/backoffice/orcamentos/novo?client=${encodeURIComponent(client.id)}`;

  return (
    <div className="bo-page bo-client-detail-page">
      <div className="bo-page-heading">
        <div>
          <nav aria-label="Breadcrumb" className="bo-breadcrumb">
            <Link href="/backoffice/clientes">Clientes</Link>
            <BackofficeIcon name="arrow" size={13} />
            <span>{client.name}</span>
          </nav>
          <div className="bo-client-title-row">
            <h1>{client.name}</h1>
            <span className={`bo-status ${client.is_active ? "is-active" : "is-inactive"}`}>
              {client.is_active ? "Ativo" : "Inativo"}
            </span>
          </div>
          <p className="bo-muted">Ficha do cliente e histórico comercial.</p>
        </div>
        <div className="bo-heading-actions">
          <Link className="bo-button bo-button-secondary" href={`/backoffice/clientes?edit=${encodeURIComponent(client.id)}`}>
            <BackofficeIcon name="edit" size={15} /> Editar cliente
          </Link>
          <Link className="bo-button bo-button-primary" href={newQuoteHref}>
            <BackofficeIcon name="plus" size={16} /> Novo orçamento
          </Link>
        </div>
      </div>

      <div aria-label="Resumo do cliente" className="bo-client-summary">
        <div className="bo-client-summary-card">
          <span>Orçamentos</span>
          <strong>{quotes.length}</strong>
          <small>{quotes.length === 1 ? "orçamento associado" : "orçamentos associados"}</small>
        </div>
        <div className="bo-client-summary-card">
          <span>Valor líquido total</span>
          <strong>{formatMoney(totalNetValue.toString())}</strong>
          <small>Dos orçamentos associados</small>
        </div>
        <div className="bo-client-summary-card">
          <span>Último orçamento</span>
          <strong>{formatDate(quotes[0]?.quote_date ?? null)}</strong>
          <small>{quotes[0]?.quote_number ?? "Ainda sem orçamentos"}</small>
        </div>
      </div>

      <div className="bo-client-detail-layout">
        <section className="bo-card bo-client-information" aria-labelledby="client-information-heading">
          <div className="bo-section-heading">
            <div>
              <p className="bo-eyebrow">Dados do cliente</p>
              <h2 id="client-information-heading">Informação</h2>
            </div>
          </div>
          <dl className="bo-client-fields">
            <div>
              <dt>Email</dt>
              <dd>{displayValue(client.email)}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{displayValue(client.phone)}</dd>
            </div>
            <div>
              <dt>Morada</dt>
              <dd>{displayValue(client.address)}</dd>
            </div>
            <div>
              <dt>Código postal</dt>
              <dd>{displayValue(client.postal_code)}</dd>
            </div>
            <div>
              <dt>Localidade</dt>
              <dd>{displayValue(client.locality)}</dd>
            </div>
            <div className="is-notes">
              <dt>Notas</dt>
              <dd>{displayValue(client.notes)}</dd>
            </div>
          </dl>
        </section>

        <section className="bo-card bo-client-history" aria-labelledby="client-history-heading">
          <div className="bo-section-heading">
            <div>
              <p className="bo-eyebrow">Histórico comercial</p>
              <h2 id="client-history-heading">Orçamentos deste cliente</h2>
            </div>
            <span className="bo-result-count">{quotes.length} {quotes.length === 1 ? "registo" : "registos"}</span>
          </div>

          {quotes.length === 0 ? (
            <div className="bo-empty-state bo-client-empty-state">
              <h2>Ainda não existem orçamentos para este cliente.</h2>
              <p>Crie o primeiro orçamento associado a esta ficha.</p>
              <Link className="bo-button bo-button-secondary" href={newQuoteHref}>+ Novo orçamento</Link>
            </div>
          ) : (
            <>
              <div aria-hidden="true" className="bo-client-quote-list-header">
                <span>N.º orçamento</span>
                <span>Local / obra</span>
                <span>Data</span>
                <span>Valor líquido</span>
                <span>Margem real</span>
              </div>
              <div className="bo-client-quote-list">
                {quotes.map((quote) => (
                  <Link className="bo-client-quote-row" href={`/backoffice/orcamentos/${quote.id}`} key={quote.id}>
                    <span className="bo-client-quote-cell">
                      <small>N.º orçamento</small>
                      <strong>{quote.quote_number}</strong>
                    </span>
                    <span className="bo-client-quote-cell">
                      <small>Local / obra</small>
                      <span>{displayValue(quote.project_location)}</span>
                    </span>
                    <span className="bo-client-quote-cell">
                      <small>Data</small>
                      <span>{formatDate(quote.quote_date)}</span>
                    </span>
                    <span className="bo-client-quote-cell bo-client-quote-value">
                      <small>Valor líquido</small>
                      <strong>{formatMoney(quote.net_value)}</strong>
                    </span>
                    <span className="bo-client-quote-cell bo-client-quote-value">
                      <small>Margem real</small>
                      <strong>{formatPercent(quote.real_margin)}</strong>
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
