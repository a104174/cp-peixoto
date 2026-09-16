import Link from "next/link";

import { BackofficeIcon } from "@/components/backoffice/backoffice-icon";
import { getDashboardStats } from "@/lib/backoffice/data";

export const dynamic = "force-dynamic";

export default async function BackofficeDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="bo-page">
      <div className="bo-page-heading">
        <div>
          <p className="bo-eyebrow">CP Peixoto · Backoffice</p>
          <h1>Visão geral</h1>
          <p className="bo-muted">Operação diária de clientes, materiais e orçamentos.</p>
        </div>
        <Link className="bo-button bo-button-primary" href="/backoffice/orcamentos/novo">
          <BackofficeIcon name="plus" size={16} /> Novo orçamento
        </Link>
      </div>

      <div className="bo-stat-grid">
        <Link aria-label="Consultar orçamentos" className="bo-stat-card" href="/backoffice/orcamentos">
          <span className="bo-stat-card-icon"><BackofficeIcon name="quotes" /></span>
          <span className="bo-stat-label">Orçamentos guardados</span>
          <strong>{stats.quotes}</strong>
          <span className="bo-stat-link">Consultar histórico <BackofficeIcon name="arrow" size={14} /></span>
        </Link>
        <Link aria-label="Gerir clientes" className="bo-stat-card" href="/backoffice/clientes">
          <span className="bo-stat-card-icon"><BackofficeIcon name="clients" /></span>
          <span className="bo-stat-label">Clientes ativos</span>
          <strong>{stats.clients}</strong>
          <span className="bo-stat-link">Gerir clientes <BackofficeIcon name="arrow" size={14} /></span>
        </Link>
        <Link aria-label="Gerir catálogo de materiais" className="bo-stat-card" href="/backoffice/materiais">
          <span className="bo-stat-card-icon"><BackofficeIcon name="materials" /></span>
          <span className="bo-stat-label">Materiais ativos</span>
          <strong>{stats.materials}</strong>
          <span className="bo-stat-link">Gerir catálogo <BackofficeIcon name="arrow" size={14} /></span>
        </Link>
      </div>

      <section className="bo-quick-actions">
        <div>
          <p className="bo-eyebrow">Ações rápidas</p>
          <h2>Começar uma tarefa</h2>
        </div>
        <div className="bo-action-row">
          <Link className="bo-button bo-button-secondary" href="/backoffice/orcamentos/novo">
            <BackofficeIcon name="quotes" size={16} /> Criar orçamento
          </Link>
          <Link className="bo-button bo-button-secondary" href="/backoffice/clientes">
            <BackofficeIcon name="clients" size={16} /> Novo cliente
          </Link>
          <Link className="bo-button bo-button-secondary" href="/backoffice/materiais">
            <BackofficeIcon name="materials" size={16} /> Adicionar material
          </Link>
        </div>
      </section>
    </div>
  );
}
