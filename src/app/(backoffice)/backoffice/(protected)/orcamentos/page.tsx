import Link from "next/link";

import { formatMoney } from "@/domain/quotes/format";
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
  searchParams: Promise<{ q?: string }>;
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
          Novo orçamento
        </Link>
      </div>

      <form className="bo-toolbar bo-card" method="get">
        <label className="bo-search-label" htmlFor="quote-search">Pesquisar</label>
        <input
          className="bo-input bo-search-input"
          defaultValue={params.q ?? ""}
          id="quote-search"
          name="q"
          placeholder="N.º, cliente ou local da obra"
          type="search"
        />
        <button className="bo-button bo-button-secondary" type="submit">Pesquisar</button>
      </form>

      <section className="bo-card">
        {filtered.length === 0 ? (
          <div className="bo-empty-state">
            <h2>{query ? "Nenhum orçamento encontrado" : "Ainda não existem orçamentos"}</h2>
            <p>{query ? "Tente outro termo de pesquisa." : "Crie o primeiro orçamento para começar o histórico."}</p>
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
                    <td data-label="N.º orçamento"><strong>{quote.quote_number}</strong></td>
                    <td data-label="Data">{formatDate(quote.quote_date)}</td>
                    <td data-label="Cliente">{quote.client_name_snapshot ?? "—"}</td>
                    <td data-label="Local da obra">{quote.project_location ?? "—"}</td>
                    <td data-label="Área">{quote.area ? `${quote.area} ${quote.area_unit}` : "—"}</td>
                    <td data-label="Valor líquido"><strong>{formatMoney(quote.net_value)}</strong></td>
                    <td data-label="Atualizado">{formatDate(quote.updated_at.slice(0, 10))}</td>
                    <td data-label="Ações">
                      <Link className="bo-link-button" href={`/backoffice/orcamentos/${quote.id}`}>
                        Abrir
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

