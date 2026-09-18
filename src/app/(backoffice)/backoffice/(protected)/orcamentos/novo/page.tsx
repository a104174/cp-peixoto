import { QuoteEditor } from "@/components/backoffice/quote-editor";
import { createEmptyQuoteDraft } from "@/domain/quotes/defaults";
import { listClients, listMaterials } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const [clients, materials, params] = await Promise.all([
    listClients(true),
    listMaterials(true),
    searchParams,
  ]);
  const selectedClientId = params.client && clients.some((client) => client.id === params.client)
    ? params.client
    : null;

  return (
    <QuoteEditor
      clients={clients}
      initialDraft={{ ...createEmptyQuoteDraft(), clientId: selectedClientId }}
      materials={materials}
    />
  );
}
