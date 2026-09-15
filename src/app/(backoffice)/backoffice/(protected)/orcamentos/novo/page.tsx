import { QuoteEditor } from "@/components/backoffice/quote-editor";
import { createEmptyQuoteDraft } from "@/domain/quotes/defaults";
import { listClients, listMaterials } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const [clients, materials] = await Promise.all([
    listClients(true),
    listMaterials(true),
  ]);

  return (
    <QuoteEditor
      clients={clients}
      initialDraft={createEmptyQuoteDraft()}
      materials={materials}
    />
  );
}

