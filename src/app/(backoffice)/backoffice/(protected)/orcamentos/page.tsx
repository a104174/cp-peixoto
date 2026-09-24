import Link from "next/link";

import { BackofficeIcon } from "@/components/backoffice/backoffice-icon";
import { formatMoney, formatNumber } from "@/domain/quotes/format";
import { listQuotes } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
  }).format(new Date(`${value}T12:00:00`));
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; deleted?: string }>;
}) {
  const quotes = await listQuotes();
  const params = await searchParams;
  const query = params.q?.trim().toLocaleLowerCase("pt-PT") ?? "";
  const filtered = query
    ? quotes.filter((quote) =>
        [
          quote.quote_number,
          quote.client_name_snapshot,
          quote.project_location,
        ]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("pt-PT").includes(query)),
      )
    : quotes;

  return (
    <div className="bo-page">
      <div className="bo-page-heading">
        <div>
          <p className="bo-eyebrow">Histórico comercial</p>
          <h1>Orçamentos</h1>
          <p className="bo-muted">Crie, consulte e edite os cálculos guardados.</p>
        </div>
        <Link className="bo-button bo-button-primary" href="/backoffice/orcamentos/novo">
          <BackofficeIcon name="plus" size={16} /> Novo orçamento
        </Link>
      </div>

      {params.deleted === "1" ? (
        <p aria-live="polite" className="bo-form-feedback bo-global-feedback" role="status">
          Orçamento eliminado.
        </p>
      ) : null}

      <form className="bo-toolbar bo-list-toolbar" method="get">
        <label className="bo-sr-only" htmlFor="quote-search">Pesquisar orçamentos</label>
        <div className="bo-search-control">
          <BackofficeIcon className="bo-search-icon" name="search" size={17} />
          <input
            className="bo-input bo-search-input"
            defaultValue={params.q ?? ""}
            id="quote-search"
            name="q"
            placeholder="Pesquisar por número, cliente ou local..."
            type="search"
          />
        </div>
        <button className="bo-button bo-button-secondary" type="submit">Pesquisar</button>
        {query ? <Link className="bo-button bo-button-ghost" href="/backoffice/orcamentos">Limpar</Link> : null}
        <span className="bo-result-count">{filtered.length} {filtered.length === 1 ? "orçamento" : "orçamentos"}</span>
      </form>

      <section className="bo-card bo-list-card">
        {filtered.length === 0 ? (
          <div className="bo-empty-state">
            <h2>{query ? "Nenhum orçamento encontrado" : "Ainda não existem orçamentos"}</h2>
            <p>{query ? "Tente outro termo de pesquisa." : "Crie o primeiro orçamento para começar o histórico."}</p>
            {!query ? <Link className="bo-button bo-button-secondary" href="/backoffice/orcamentos/novo">+ Novo orçamento</Link> : null}
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
                {filtered.map((quote) => (
                  <tr key={quote.id}>
                    <td data-label="N.º orçamento"><Link className="bo-table-primary-link" href={`/backoffice/orcamentos/${quote.id}`}>{quote.quote_number}</Link></td>
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
                      <Link className="bo-link-button" href={`/backoffice/orcamentos/${quote.id}`}>
                        Abrir <BackofficeIcon name="arrow" size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
