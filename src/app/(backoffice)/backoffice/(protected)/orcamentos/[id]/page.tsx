import { notFound } from "next/navigation";

import { QuoteEditor } from "@/components/backoffice/quote-editor";
import { getQuoteById, listClients, listMaterials, mapQuoteToDraft } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    />
  );
}

