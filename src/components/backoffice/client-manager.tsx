"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createClientAction,
  toggleClientActiveAction,
  updateClientAction,
} from "@/lib/backoffice/actions";
import type { ClientSummary } from "@/lib/backoffice/data";

type ClientForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  locality: string;
  notes: string;
};

const emptyForm: ClientForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  locality: "",
  notes: "",
};

function formFromClient(client: ClientSummary): ClientForm {
  return {
    name: client.name,
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    postalCode: client.postal_code ?? "",
    locality: client.locality ?? "",
    notes: client.notes ?? "",
  };
}

function clientFromForm(formData: FormData, id: string, active = true): ClientSummary {
  const value = (key: string) => String(formData.get(key) ?? "").trim() || null;
  return {
    id,
    name: String(formData.get("name") ?? "").trim(),
    email: value("email"),
    phone: value("phone"),
    address: value("address"),
    postal_code: value("postalCode"),
    locality: value("locality"),
    notes: value("notes"),
    is_active: active,
  };
}

export function ClientManager({
  initialClients,
}: {
  initialClients: ClientSummary[];
}) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-PT");
    if (!normalized) {
      return clients.filter((client) => showInactive || client.is_active);
    }

    return clients.filter(
      (client) =>
        (showInactive || client.is_active) &&
        [client.name, client.email, client.phone, client.locality]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("pt-PT").includes(normalized)),
    );
  }, [clients, query, showInactive]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFeedback("");
  }

  function startEdit(client: ClientSummary) {
    setEditingId(client.id);
    setForm(formFromClient(client));
    setFeedback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField(field: keyof ClientForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    const formData = new FormData(event.currentTarget);
    if (editingId) formData.set("id", editingId);

    startTransition(async () => {
      const result = editingId
        ? await updateClientAction(formData)
        : await createClientAction(formData);

      if (!result.success) {
        setFeedback(result.error ?? "Não foi possível guardar o cliente.");
        return;
      }

      setFeedback(editingId ? "Cliente atualizado." : "Cliente criado.");
      if (result.id) {
        const nextClient = clientFromForm(formData, result.id, true);
        setClients((current) => {
          if (editingId) {
            return current.map((client) =>
              client.id === editingId
                ? { ...nextClient, is_active: client.is_active }
                : client,
            );
          }
          return [...current, nextClient].sort((left, right) =>
            left.name.localeCompare(right.name, "pt-PT"),
          );
        });
      }
      setEditingId(null);
      setForm(emptyForm);
      router.refresh();
    });
  }

  function toggle(client: ClientSummary) {
    setFeedback("");
    startTransition(async () => {
      const result = await toggleClientActiveAction(client.id);
      if (!result.success) {
        setFeedback(result.error ?? "Não foi possível alterar o estado.");
        return;
      }
      setFeedback(client.is_active ? "Cliente arquivado." : "Cliente reativado.");
      setClients((current) =>
        current.map((item) =>
          item.id === client.id ? { ...item, is_active: !item.is_active } : item,
        ),
      );
      router.refresh();
    });
  }

  return (
    <div className="bo-page">
      <div className="bo-page-heading">
        <div>
          <p className="bo-eyebrow">Base operacional</p>
          <h1>Clientes</h1>
          <p className="bo-muted">Contactos associados aos seus orçamentos.</p>
        </div>
        <button className="bo-button bo-button-primary" onClick={startCreate} type="button">
          Novo cliente
        </button>
      </div>

      <section className="bo-card bo-form-card">
        <div className="bo-section-heading">
          <div>
            <p className="bo-eyebrow">{editingId ? "Editar" : "Criar"}</p>
            <h2>{editingId ? "Dados do cliente" : "Novo cliente"}</h2>
          </div>
          {editingId ? (
            <button className="bo-button bo-button-ghost" onClick={startCreate} type="button">
              Cancelar
            </button>
          ) : null}
        </div>
        <form className="bo-form-grid" onSubmit={submit}>
          <label>
            Nome *
            <input
              className="bo-input"
              name="name"
              onChange={(event) => updateField("name", event.target.value)}
              required
              value={form.name}
            />
          </label>
          <label>
            Email
            <input
              className="bo-input"
              name="email"
              onChange={(event) => updateField("email", event.target.value)}
              type="email"
              value={form.email}
            />
          </label>
          <label>
            Telefone
            <input
              className="bo-input"
              name="phone"
              onChange={(event) => updateField("phone", event.target.value)}
              value={form.phone}
            />
          </label>
          <label>
            Localidade
            <input
              className="bo-input"
              name="locality"
              onChange={(event) => updateField("locality", event.target.value)}
              value={form.locality}
            />
          </label>
          <label className="bo-field-wide">
            Morada
            <input
              className="bo-input"
              name="address"
              onChange={(event) => updateField("address", event.target.value)}
              value={form.address}
            />
          </label>
          <label>
            Código postal
            <input
              className="bo-input"
              name="postalCode"
              onChange={(event) => updateField("postalCode", event.target.value)}
              value={form.postalCode}
            />
          </label>
          <label className="bo-field-wide">
            Notas
            <textarea
              className="bo-input bo-textarea"
              name="notes"
              onChange={(event) => updateField("notes", event.target.value)}
              rows={3}
              value={form.notes}
            />
          </label>
          <div className="bo-form-actions bo-field-wide">
            <button className="bo-button bo-button-primary" disabled={isPending} type="submit">
              {isPending ? "A guardar…" : editingId ? "Guardar alterações" : "Criar cliente"}
            </button>
            {feedback ? (
              <p aria-live="polite" className="bo-form-feedback">{feedback}</p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="bo-card">
        <div className="bo-toolbar bo-toolbar-inline">
          <label className="bo-search-label" htmlFor="client-search">Pesquisar clientes</label>
          <input
            className="bo-input bo-search-input"
            id="client-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, email, telefone ou localidade"
            type="search"
            value={query}
          />
          <label className="bo-check-label">
            <input checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} type="checkbox" />
            Mostrar inativos
          </label>
          <span className="bo-result-count">{filtered.length} registo(s)</span>
        </div>
        {filtered.length === 0 ? (
          <div className="bo-empty-state">
            <h2>{query ? "Nenhum cliente encontrado" : "Ainda não existem clientes"}</h2>
            <p>{query ? "Tente outro termo de pesquisa." : "Crie o primeiro cliente acima."}</p>
          </div>
        ) : (
          <div className="bo-table-wrap">
            <table className="bo-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contacto</th>
                  <th>Localidade</th>
                  <th>Estado</th>
                  <th><span className="bo-sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr className={!client.is_active ? "is-inactive" : undefined} key={client.id}>
                    <td data-label="Nome"><strong>{client.name}</strong></td>
                    <td data-label="Contacto">
                      <span>{client.email ?? "—"}</span>
                      {client.phone ? <small className="bo-table-subtext">{client.phone}</small> : null}
                    </td>
                    <td data-label="Localidade">{client.locality ?? "—"}</td>
                    <td data-label="Estado">
                      <span className={`bo-status ${client.is_active ? "is-active" : "is-inactive"}`}>
                        {client.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td data-label="Ações">
                      <div className="bo-inline-actions">
                        <button className="bo-link-button" onClick={() => startEdit(client)} type="button">
                          Editar
                        </button>
                        <button className="bo-link-button bo-link-danger" disabled={isPending} onClick={() => toggle(client)} type="button">
                          {client.is_active ? "Desativar" : "Reativar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
