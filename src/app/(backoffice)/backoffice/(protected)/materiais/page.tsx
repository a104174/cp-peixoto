import { MaterialManager } from "@/components/backoffice/material-manager";
import { listMaterials } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const materials = await listMaterials(true);

  return <MaterialManager initialMaterials={materials} />;
}

