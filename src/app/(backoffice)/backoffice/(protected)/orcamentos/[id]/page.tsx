import { notFound } from "next/navigation";

import { QuoteEditor } from "@/components/backoffice/quote-editor";
import { getQuoteById, listClients, listMaterials, mapQuoteToDraft } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [quote, clients, materials] = await Promise.all([
    getQuoteById(id),
    listClients(true),
    listMaterials(true),
  ]);

  if (!quote) {
    notFound();
  }

  return (
    <QuoteEditor
      clients={clients}
      initialDraft={mapQuoteToDraft(quote)}
      materials={materials}
      successMessage={query.saved === "created" ? `Orçamento ${quote.quote.quote_number} criado com sucesso.` : undefined}
    />
  );
}
