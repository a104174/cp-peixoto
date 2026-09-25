import Link from "next/link";

import { BackofficeIcon } from "@/components/backoffice/backoffice-icon";
import { QuoteList } from "@/components/backoffice/quote-list";
import { listQuotes } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

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
        <p
          aria-live="polite"
          className="bo-form-feedback bo-global-feedback bo-quote-delete-feedback"
          id="quote-list-deleted-feedback"
          role="status"
          tabIndex={-1}
        >
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
        <QuoteList
          hasQuery={Boolean(query)}
          quotes={filtered}
          successFeedbackAlreadyVisible={params.deleted === "1"}
        />
      </section>
    </div>
  );
}
