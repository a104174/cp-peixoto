import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BackofficeSetupNotice } from "@/components/backoffice/setup-notice";
import { LoginForm } from "@/components/backoffice/login-form";
import { getCurrentUser } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  robots: {
    index: false,
    follow: false,
  },
};

function safeNext(value: string | undefined): string {
  return value?.startsWith("/backoffice/") &&
    !value.startsWith("//") &&
    value !== "/backoffice/login"
    ? value
    : "/backoffice";
}

export default async function BackofficeLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!hasSupabaseConfig()) {
    return <BackofficeSetupNotice />;
  }

  const user = await getCurrentUser();
  if (user) {
    redirect("/backoffice");
  }

  const params = await searchParams;
  const nextPath = safeNext(params.next);

  return (
    <main className="bo-login-page">
      <section className="bo-login-card bo-card">
        <div className="bo-login-heading">
          <span className="bo-brand-mark">CP</span>
          <p className="bo-eyebrow">CP Peixoto · Área reservada</p>
          <h1>Entrar no backoffice</h1>
          <p>Gira clientes, materiais e orçamentos num só lugar.</p>
        </div>
        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}

