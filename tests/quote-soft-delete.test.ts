import { readFileSync } from "node:fs";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedSupabase: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  getAuthenticatedSupabase: mocks.getAuthenticatedSupabase,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/backoffice/pdf/assets", () => ({
  loadQuotePdfLogo: vi.fn(async () => new Uint8Array()),
}));

import { deleteQuoteAction } from "../src/lib/backoffice/actions";
import {
  getClientQuotePdfSource,
  getClientWithQuotes,
  getDashboardStats,
  getQuoteById,
  listQuotes,
} from "../src/lib/backoffice/data";
import { GET as getInternalQuotePdf } from "../src/app/(backoffice)/backoffice/(protected)/orcamentos/[id]/pdf/internal/route";
import { POST as postClientQuotePdf } from "../src/app/(backoffice)/backoffice/(protected)/orcamentos/[id]/pdf/client/route";

type QueryResult = {
  data: unknown;
  error: null;
  count?: number;
};

type QueryCall = {
  table: string;
  filters: Array<{ kind: "eq" | "is"; column: string; value: unknown }>;
  orders: Array<{ column: string; ascending: boolean }>;
  selectOptions?: { head?: boolean; count?: string };
};

type QueryChain = {
  select: (columns: string, options?: QueryCall["selectOptions"]) => QueryChain;
  eq: (column: string, value: unknown) => QueryChain;
  is: (column: string, value: unknown) => QueryChain;
  order: (column: string, options?: { ascending?: boolean }) => QueryChain;
  maybeSingle: () => Promise<QueryResult>;
  then: <TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) => Promise<TResult1 | TResult2>;
};

const activeQuoteId = "00000000-0000-4000-8000-000000000101";
const deletedQuoteId = "00000000-0000-4000-8000-000000000102";
const clientId = "00000000-0000-4000-8000-000000000201";

function quoteRow(overrides: Record<string, unknown> = {}) {
  return {
    id: activeQuoteId,
    quote_number: "CP-2026-0001",
    client_id: clientId,
    client_name_snapshot: "Cliente Exemplo",
    project_location: "Obra A",
    quote_date: "2026-04-01",
    created_at: "2026-04-01T10:00:00.000Z",
    area: "80",
    area_unit: "m²",
    net_value: "1200.00",
    real_margin: "0.2",
    updated_at: "2026-04-01T10:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

function createQueryClient(rowsByTable: Record<string, Array<Record<string, unknown>>>) {
  const calls: QueryCall[] = [];
  const rpc = vi.fn();

  function resultFor(call: QueryCall, single = false): QueryResult {
    let rows = [...(rowsByTable[call.table] ?? [])].filter((row) =>
      call.filters.every(({ kind, column, value }) =>
        kind === "eq" ? row[column] === value : row[column] === value,
      ),
    );

    if (call.orders.length > 0) {
      rows = rows.sort((left, right) => {
        for (const { column, ascending } of call.orders) {
          const compared = String(left[column] ?? "").localeCompare(String(right[column] ?? ""));
          if (compared !== 0) return ascending ? compared : -compared;
        }
        return 0;
      });
    }

    if (call.selectOptions?.head) {
      return { data: null, error: null, count: rows.length };
    }
    return { data: single ? (rows[0] ?? null) : rows, error: null, count: rows.length };
  }

  const client = {
    from(table: string): QueryChain {
      const call: QueryCall = { table, filters: [], orders: [] };
      calls.push(call);

      const chain: QueryChain = {
        select(_columns, options) {
          call.selectOptions = options;
          return chain;
        },
        eq(column, value) {
          call.filters.push({ kind: "eq", column, value });
          return chain;
        },
        is(column, value) {
          call.filters.push({ kind: "is", column, value });
          return chain;
        },
        order(column, options) {
          call.orders.push({ column, ascending: options?.ascending ?? true });
          return chain;
        },
        maybeSingle() {
          return Promise.resolve(resultFor(call, true));
        },
        then(onfulfilled, onrejected) {
          return Promise.resolve(resultFor(call)).then(onfulfilled, onrejected);
        },
      };
      return chain;
    },
    rpc,
  };

  return { client, calls, rpc };
}

function useAuthenticatedClient(client: unknown) {
  mocks.getAuthenticatedSupabase.mockResolvedValue({ client });
}

describe("soft delete de orçamentos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("valida sessão e ID, marca apenas o orçamento selecionado e revalida páginas afetadas", async () => {
    const { client, rpc } = createQueryClient({});
    rpc.mockResolvedValue({ data: true, error: null });
    useAuthenticatedClient(client);

    const result = await deleteQuoteAction(activeQuoteId);

    expect(result).toEqual({
      success: true,
      id: activeQuoteId,
      message: "Orçamento eliminado.",
    });
    expect(rpc).toHaveBeenCalledWith("soft_delete_quote", {
      target_quote_id: activeQuoteId,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/backoffice", "page");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/backoffice/orcamentos", "page");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/backoffice/clientes/[id]", "page");
  });

  it("não chama o RPC sem sessão ou com ID inválido", async () => {
    const { client, rpc } = createQueryClient({});
    useAuthenticatedClient(client);
    mocks.getAuthenticatedSupabase.mockResolvedValueOnce(null);

    const unauthenticated = await deleteQuoteAction(activeQuoteId);
    const invalidId = await deleteQuoteAction("invalid");

    expect(unauthenticated).toMatchObject({ success: false, code: "AUTH_REQUIRED" });
    expect(invalidId).toMatchObject({ success: false, code: "NOT_FOUND" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("retorna falha tipada sem expor o erro PostgreSQL", async () => {
    const { client, rpc } = createQueryClient({});
    rpc.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "private postgres detail" },
    });
    useAuthenticatedClient(client);

    const result = await deleteQuoteAction(activeQuoteId);

    expect(result).toEqual({
      success: false,
      code: "SAVE_FAILED",
      message: "Não foi possível eliminar o orçamento. Tente novamente.",
    });
    expect(JSON.stringify(result)).not.toContain("private postgres detail");
  });

  it("remove o orçamento eliminado da lista, do histórico do cliente e das métricas", async () => {
    const activeLatest = quoteRow({
      id: activeQuoteId,
      quote_number: "CP-2026-0001",
      quote_date: "2026-04-01",
      created_at: "2026-04-01T10:00:00.000Z",
      net_value: "1200.00",
    });
    const deletedNewest = quoteRow({
      id: deletedQuoteId,
      quote_number: "CP-2026-0002",
      quote_date: "2026-05-01",
      created_at: "2026-05-01T10:00:00.000Z",
      net_value: "950.00",
      deleted_at: "2026-05-02T10:00:00.000Z",
    });
    const { client, calls } = createQueryClient({
      quotes: [activeLatest, deletedNewest],
      clients: [{ id: clientId, name: "Cliente Exemplo", is_active: true }],
      materials: [],
    });
    useAuthenticatedClient(client);

    const listedQuotes = await listQuotes();
    const clientData = await getClientWithQuotes(clientId);
    const dashboard = await getDashboardStats();

    expect(listedQuotes.map((quote) => quote.id)).toEqual([activeQuoteId]);
    expect(clientData?.quotes.map((quote) => quote.id)).toEqual([activeQuoteId]);
    expect(clientData?.quotes.length).toBe(1);
    expect(clientData?.quotes.reduce((sum, quote) => sum + Number(quote.net_value), 0)).toBe(1200);
    expect(clientData?.quotes[0]?.quote_number).toBe("CP-2026-0001");
    expect(dashboard.quotes).toBe(1);

    const quoteQueries = calls.filter((call) => call.table === "quotes");
    expect(quoteQueries).toHaveLength(3);
    expect(quoteQueries.every((call) =>
      call.filters.some((filter) => filter.kind === "is" && filter.column === "deleted_at" && filter.value === null),
    )).toBe(true);
  });

  it("trata IDs eliminados como inexistentes para edição e PDFs", async () => {
    const { client, calls } = createQueryClient({
      quotes: [quoteRow({ id: deletedQuoteId, deleted_at: "2026-05-02T10:00:00.000Z" })],
    });
    const authenticated = { client } as never;

    const quote = await getQuoteById(deletedQuoteId, authenticated);
    const pdf = await getClientQuotePdfSource(deletedQuoteId, authenticated);

    expect(quote).toBeNull();
    expect(pdf).toEqual({ authenticated: true, source: null });
    const quoteQueries = calls.filter((call) => call.table === "quotes");
    expect(quoteQueries).toHaveLength(2);
    expect(quoteQueries.every((call) =>
      call.filters.some((filter) => filter.kind === "is" && filter.column === "deleted_at" && filter.value === null),
    )).toBe(true);
  });

  it("rejeita com 404 a geração dos PDFs para orçamentos eliminados", async () => {
    const { client, rpc } = createQueryClient({
      quotes: [quoteRow({ id: deletedQuoteId, deleted_at: "2026-05-02T10:00:00.000Z" })],
    });
    useAuthenticatedClient(client);

    const internalResponse = await getInternalQuotePdf(
      new Request("http://localhost/backoffice/orcamentos/deleted/pdf/internal"),
      { params: Promise.resolve({ id: deletedQuoteId }) },
    );
    const clientResponse = await postClientQuotePdf(
      new Request("http://localhost/backoffice/orcamentos/deleted/pdf/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workDescription: "Arbeiten" }),
      }),
      { params: Promise.resolve({ id: deletedQuoteId }) },
    );

    expect(internalResponse.status).toBe(404);
    expect(clientResponse.status).toBe(404);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("mantém os dados e o número reservado e bloqueia atualizações stale", () => {
    const migration = readFileSync(
      "supabase/migrations/202609240003_quote_soft_delete.sql",
      "utf8",
    );
    const originalSchema = readFileSync(
      "supabase/migrations/202609150001_backoffice_mvp.sql",
      "utf8",
    );

    expect(migration).toMatch(/add column if not exists deleted_at timestamptz/i);
    expect(migration).toMatch(/update public\.quotes\s+set deleted_at = now\(\)\s+where id = target_quote_id\s+and deleted_at is null/i);
    expect(migration).toMatch(/select \* into locked_quote[\s\S]*?for update[\s\S]*?locked_quote\.deleted_at is not null/i);
    expect(migration).toMatch(/quotes_authenticated_soft_delete[\s\S]*?for update to authenticated[\s\S]*?deleted_at is null[\s\S]*?deleted_at is not null/i);
    expect(migration).toMatch(/grant update \(deleted_at\) on public\.quotes to authenticated/i);
    expect(migration).toMatch(/function public\.soft_delete_quote[\s\S]*?security invoker/i);
    expect(migration).not.toMatch(/delete\s+from\s+public\.(quotes|quote_materials|quote_labor|quote_subcontracts|quote_equipment|quote_surcharges)/i);
    expect(migration).not.toMatch(/set\s+quote_number\s*=/i);
    expect(migration).not.toMatch(/public\.quote_counters/i);
    expect(originalSchema).toMatch(/quote_number text unique not null/i);
    expect(originalSchema).toMatch(/last_value = public\.quote_counters\.last_value \+ 1/i);
    expect(migration).toMatch(/where id = target_quote_id\s+and deleted_at is null/i);
  });
});
