import { BackofficeNavLink } from "./nav-link";
import { LogoutButton } from "./logout-button";

type BackofficeShellProps = {
  email: string;
  children: React.ReactNode;
};

export function BackofficeShell({ email, children }: BackofficeShellProps) {
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
        <details className="bo-sidebar-menu" open>
          <summary>Menu</summary>
          <nav aria-label="Navegação do backoffice" className="bo-nav">
            <BackofficeNavLink href="/backoffice">Visão geral</BackofficeNavLink>
            <BackofficeNavLink href="/backoffice/orcamentos">
              Orçamentos
            </BackofficeNavLink>
            <BackofficeNavLink href="/backoffice/materiais">
              Materiais
            </BackofficeNavLink>
            <BackofficeNavLink href="/backoffice/clientes">
              Clientes
            </BackofficeNavLink>
          </nav>
          <div className="bo-sidebar-footer">
            <span className="bo-user-email" title={email}>
              {email}
            </span>
            <LogoutButton />
          </div>
        </details>
      </aside>
      <div className="bo-main">
        <header className="bo-mobile-header">
          <div className="bo-brand">
            <span className="bo-brand-mark">CP</span>
            <strong>CP Peixoto</strong>
          </div>
        </header>
        <main className="bo-content">{children}</main>
      </div>
    </div>
  );
}
