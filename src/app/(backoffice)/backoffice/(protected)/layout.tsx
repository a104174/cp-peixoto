import { redirect } from "next/navigation";

import { BackofficeSetupNotice } from "@/components/backoffice/setup-notice";
import { BackofficeShell } from "@/components/backoffice/backoffice-shell";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedBackofficeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!hasSupabaseConfig()) {
    return <BackofficeSetupNotice />;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/backoffice/login");
  }

  return <BackofficeShell email={user.email ?? "Utilizador"}>{children}</BackofficeShell>;
}

