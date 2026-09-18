import Link from "next/link";

export default function ClientNotFound() {
  return (
    <div className="bo-card bo-error-state">
      <p className="bo-eyebrow">Clientes</p>
      <h1>Cliente não encontrado.</h1>
      <p>O cliente pode ter sido removido ou o endereço não é válido.</p>
      <Link className="bo-button bo-button-secondary" href="/backoffice/clientes">
        Voltar aos clientes
      </Link>
    </div>
  );
}
