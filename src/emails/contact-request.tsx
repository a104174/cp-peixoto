import type { ContactEmailData } from "@/types/contact";

export function ContactRequestEmail({
  name,
  email,
  phone,
  location,
  service,
  message,
}: ContactEmailData) {
  return (
    <html lang="pt-PT">
      <body
        style={{
          margin: 0,
          padding: "24px",
          backgroundColor: "#f5f5f5",
          color: "#171717",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "24px",
            backgroundColor: "#ffffff",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Novo pedido de orçamento</h1>
          <p>Foi recebido um novo pedido através do website da CP Peixoto.</p>

          <p><strong>Nome:</strong> {name}</p>
          {email ? <p><strong>Email:</strong> {email}</p> : null}
          {phone ? <p><strong>Telefone:</strong> {phone}</p> : null}
          {location ? <p><strong>Localização:</strong> {location}</p> : null}
          {service ? <p><strong>Serviço pretendido:</strong> {service}</p> : null}

          <h2>Mensagem</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{message || "Não indicada."}</p>
        </main>
      </body>
    </html>
  );
}

export function getContactRequestSubject(name: string): string {
  return `Novo pedido de orçamento — ${name}`;
}
