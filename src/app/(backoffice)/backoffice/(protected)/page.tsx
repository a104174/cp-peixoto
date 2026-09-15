import Link from "next/link";

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
          Novo orçamento
        </Link>
      </div>

      <div className="bo-stat-grid">
        <Link aria-label="Consultar orçamentos" className="bo-stat-card" href="/backoffice/orcamentos">
          <span>Orçamentos guardados</span>
          <strong>{stats.quotes}</strong>
          <span className="bo-stat-link">Consultar histórico</span>
        </Link>
        <Link aria-label="Gerir clientes" className="bo-stat-card" href="/backoffice/clientes">
          <span>Clientes ativos</span>
          <strong>{stats.clients}</strong>
          <span className="bo-stat-link">Gerir clientes</span>
        </Link>
        <Link aria-label="Gerir catálogo de materiais" className="bo-stat-card" href="/backoffice/materiais">
          <span>Materiais ativos</span>
          <strong>{stats.materials}</strong>
          <span className="bo-stat-link">Gerir catálogo</span>
        </Link>
      </div>

      <section className="bo-card bo-quick-actions">
        <div>
          <p className="bo-eyebrow">Ações rápidas</p>
          <h2>Começar uma tarefa</h2>
        </div>
        <div className="bo-action-row">
          <Link className="bo-button bo-button-secondary" href="/backoffice/orcamentos/novo">
            Criar orçamento
          </Link>
          <Link className="bo-button bo-button-secondary" href="/backoffice/clientes">
            Novo cliente
          </Link>
          <Link className="bo-button bo-button-secondary" href="/backoffice/materiais">
            Adicionar material
          </Link>
        </div>
      </section>
    </div>
  );
}
