import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BackofficeSetupNotice } from "@/components/backoffice/setup-notice";
import { LoginForm } from "@/components/backoffice/login-form";
import { getCurrentUser } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { withPerf } from "@/lib/backoffice/perf";

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
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  if (!hasSupabaseConfig()) {
    return <BackofficeSetupNotice />;
  }

  const user = await withPerf("login.page", async (perf) => {
    const user = await getCurrentUser();
    perf.mark("auth", { authenticated: Boolean(user) });
    return user;
  });
  if (user) {
    redirect("/backoffice");
  }

  const params = await searchParams;
  const nextPath = safeNext(params.next);

  return (
    <main className="bo-login-page">
      <section className="bo-login-shell">
        <div className="bo-login-context">
          <div className="bo-login-brand">
            <span className="bo-brand-mark">CP</span>
            <span><strong>CP Peixoto</strong><small>Backoffice</small></span>
          </div>
          <div className="bo-login-context-copy">
            <p className="bo-eyebrow">Área reservada</p>
            <h1>Gestão rigorosa.<br />Decisões claras.</h1>
            <p>Orçamentos, clientes e materiais reunidos num espaço operacional seguro.</p>
          </div>
          <p className="bo-login-context-foot">CP Peixoto · Suíça</p>
        </div>
        <div className="bo-login-card">
          <div className="bo-login-heading">
            <p className="bo-eyebrow">Acesso reservado</p>
            <h2>Bem-vindo de volta</h2>
            <p>Introduza os seus dados para continuar.</p>
          </div>
          <LoginForm
            nextPath={nextPath}
            notice={params.reason === "session-expired" ? "A sua sessão expirou. Inicie sessão novamente." : undefined}
          />
          <p className="bo-login-security">Acesso exclusivo a utilizadores autorizados.</p>
        </div>
      </section>
    </main>
  );
}
