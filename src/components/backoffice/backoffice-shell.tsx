import { BackofficeNavLink } from "./nav-link";
import { LogoutButton } from "./logout-button";
import { MobileNavigation } from "./mobile-navigation";

type BackofficeShellProps = {
  email: string;
  children: React.ReactNode;
};

export function BackofficeShell({ email, children }: BackofficeShellProps) {
  const navigation = (
    <nav aria-label="Navegação do backoffice" className="bo-nav">
      <BackofficeNavLink href="/backoffice" icon="dashboard">Visão geral</BackofficeNavLink>
      <BackofficeNavLink href="/backoffice/orcamentos" icon="quotes">Orçamentos</BackofficeNavLink>
      <BackofficeNavLink href="/backoffice/materiais" icon="materials">Materiais</BackofficeNavLink>
      <BackofficeNavLink href="/backoffice/clientes" icon="clients">Clientes</BackofficeNavLink>
    </nav>
  );
  const account = (
    <div className="bo-sidebar-footer">
      <div className="bo-user">
        <span className="bo-user-avatar" aria-hidden="true">{email.slice(0, 1).toUpperCase()}</span>
        <span><small>Sessão ativa</small><span className="bo-user-email" title={email}>{email}</span></span>
      </div>
      <LogoutButton />
    </div>
  );

  return (
    <div className="bo-shell">
      <aside className="bo-sidebar">
        <div className="bo-brand">
          <span className="bo-brand-mark">CP</span>
          <span>
            <strong>CP Peixoto</strong>
            <small>Backoffice</small>
          </span>
        </div>
        {navigation}
        {account}
      </aside>
      <div className="bo-main">
        <header className="bo-mobile-header">
          <div className="bo-brand">
            <span className="bo-brand-mark">CP</span>
            <strong>CP Peixoto</strong>
          </div>
          <MobileNavigation>
            <div className="bo-mobile-drawer-brand">
              <span className="bo-brand-mark">CP</span>
              <span><strong>CP Peixoto</strong><small>Backoffice</small></span>
            </div>
            {navigation}
            {account}
          </MobileNavigation>
        </header>
        <main className="bo-content">{children}</main>
      </div>
    </div>
  );
}
