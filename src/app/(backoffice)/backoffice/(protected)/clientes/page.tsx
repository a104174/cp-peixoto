import { ClientManager } from "@/components/backoffice/client-manager";
import { listClients } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const [clients, params] = await Promise.all([listClients(true), searchParams]);

  return <ClientManager initialClients={clients} initialEditId={params.edit} />;
}
