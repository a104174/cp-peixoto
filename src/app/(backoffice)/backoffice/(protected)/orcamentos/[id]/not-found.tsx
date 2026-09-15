import Link from "next/link";

export default function QuoteNotFound() {
  return (
    <div className="bo-card bo-error-state">
      <p className="bo-eyebrow">Orçamentos</p>
      <h1>Orçamento não encontrado.</h1>
      <p>O orçamento pode ter sido removido ou o endereço não é válido.</p>
      <Link className="bo-button bo-button-secondary" href="/backoffice/orcamentos">
        Voltar aos orçamentos
      </Link>
    </div>
  );
}
