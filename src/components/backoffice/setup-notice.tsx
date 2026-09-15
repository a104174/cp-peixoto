export function BackofficeSetupNotice() {
  return (
    <main className="bo-setup-page">
      <section className="bo-card bo-setup-card">
        <p className="bo-eyebrow">CP Peixoto · Backoffice</p>
        <h1>Supabase ainda não está configurado</h1>
        <p>
          A aplicação está preparada, mas precisa das variáveis públicas do
          Supabase para ativar o login e a base de dados.
        </p>
        <code>NEXT_PUBLIC_SUPABASE_URL</code>
        <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
        <p>Consulte `docs/backoffice/SETUP_BACKOFFICE.md` no repositório para concluir a configuração.</p>
      </section>
    </main>
  );
}
