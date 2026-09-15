import { ClientManager } from "@/components/backoffice/client-manager";
import { listClients } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await listClients(true);

  return <ClientManager initialClients={clients} />;
}

