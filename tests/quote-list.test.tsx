import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteQuoteAction: vi.fn(),
  router: { push: vi.fn(), refresh: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));
vi.mock("@/lib/backoffice/actions", () => ({
  deleteQuoteAction: mocks.deleteQuoteAction,
}));

import { QuoteList } from "../src/components/backoffice/quote-list";

describe("ações da lista de orçamentos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mantém Abrir e apresenta um botão eliminar acessível sem aninhar navegação", () => {
    const html = renderToStaticMarkup(
      <QuoteList
        hasQuery={false}
        quotes={[
          {
            id: "00000000-0000-4000-8000-000000000104",
            quote_number: "CP-2026-0004",
            client_id: null,
            client_name_snapshot: "Cliente Exemplo",
            project_location: "Obra Exemplo",
            quote_date: "2026-09-24",
            area: "80",
            area_unit: "m²",
            net_value: "2452.00",
            updated_at: "2026-09-24T10:00:00.000Z",
          },
        ]}
        successFeedbackAlreadyVisible={false}
      />,
    );

    expect(html).toContain('href="/backoffice/orcamentos/00000000-0000-4000-8000-000000000104"');
    expect(html).toContain("Abrir");
    expect(html).toContain('aria-label="Eliminar orçamento CP-2026-0004"');
    expect(html).toContain('title="Eliminar orçamento"');
    expect(html).toContain('type="button"');
    expect(html).toMatch(/<a class="bo-link-button"[^>]*>Abrir[\s\S]*?<\/a><button[^>]*aria-label="Eliminar orçamento CP-2026-0004"/);
    expect(html).not.toContain('role="alertdialog"');
  });
});
