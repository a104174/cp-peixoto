"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  createClientAction,
  toggleClientActiveAction,
  updateClientAction,
} from "@/lib/backoffice/actions";
import type { ClientSummary } from "@/lib/backoffice/data";
import type { FormNumericValue } from "@/domain/quotes/format";
import type { FieldErrors } from "@/lib/backoffice/validation";
import { ConfirmDialog } from "./confirm-dialog";
import { FormFieldError } from "./form-field-error";
import { BackofficeIcon } from "./backoffice-icon";

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
  const formText = (value: FormNumericValue): string =>
    value === null || value === undefined || value === "" ? "" : String(value);

  return {
    name: formText(client.name),
    email: formText(client.email),
    phone: formText(client.phone),
    address: formText(client.address),
    postalCode: formText(client.postal_code),
    locality: formText(client.locality),
    notes: formText(client.notes),
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
  initialEditId,
}: {
  initialClients: ClientSummary[];
  initialEditId?: string;
}) {
  const router = useRouter();
  const initialEditClient = initialClients.find((client) => client.id === initialEditId);
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(initialEditClient?.id ?? null);
  const [form, setForm] = useState<ClientForm>(() => initialEditClient ? formFromClient(initialEditClient) : emptyForm);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [clientToArchive, setClientToArchive] = useState<ClientSummary | null>(null);
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
    setFeedback(null);
    setFieldErrors({});
  }

  function startEdit(client: ClientSummary) {
    setEditingId(client.id);
    setForm(formFromClient(client));
    setFeedback(null);
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField(field: keyof ClientForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setFieldErrors({});
    const formData = new FormData(event.currentTarget);
    if (editingId) formData.set("id", editingId);

    startTransition(async () => {
      const result = editingId
        ? await updateClientAction(formData)
        : await createClientAction(formData);

      if (!result.success) {
        if (result.code === "AUTH_REQUIRED") {
          router.push("/backoffice/login?reason=session-expired");
          return;
        }
        setFieldErrors(result.fieldErrors ?? {});
        setFeedback({ type: "error", message: result.message });
        return;
      }

      setFeedback({ type: "success", message: result.message ?? (editingId ? "Cliente atualizado." : "Cliente criado com sucesso.") });
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
    setFeedback(null);
    startTransition(async () => {
      const result = await toggleClientActiveAction(client.id);
      if (!result.success) {
        if (result.code === "AUTH_REQUIRED") {
          router.push("/backoffice/login?reason=session-expired");
          return;
        }
        setFeedback({ type: "error", message: result.message });
        return;
      }
      setFeedback({ type: "success", message: client.is_active ? "Cliente arquivado." : "Cliente reativado." });
      setClients((current) =>
        current.map((item) =>
          item.id === client.id ? { ...item, is_active: !item.is_active } : item,
        ),
      );
      router.refresh();
      setClientToArchive(null);
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
          <BackofficeIcon name="plus" size={16} /> Novo cliente
        </button>
      </div>

      <div className="bo-manager-layout bo-manager-layout-clients">
      <section className="bo-card bo-form-card bo-manager-form">
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
        <form className="bo-manager-form-body" onSubmit={submit}>
          <fieldset className="bo-form-group">
            <legend>Identificação</legend>
            <div className="bo-form-grid">
          <label className="bo-field-wide">
            Nome *
            <input
              aria-describedby={fieldErrors.name ? "client-name-error" : undefined}
              aria-invalid={Boolean(fieldErrors.name)}
              className="bo-input"
              name="name"
              onChange={(event) => updateField("name", event.target.value)}
              required
              value={form.name}
            />
            <FormFieldError id="client-name-error" message={fieldErrors.name} />
          </label>
          <label>
            Email
            <input
              aria-describedby={fieldErrors.email ? "client-email-error" : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
              className="bo-input"
              name="email"
              onChange={(event) => updateField("email", event.target.value)}
              type="email"
              value={form.email}
            />
            <FormFieldError id="client-email-error" message={fieldErrors.email} />
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
            </div>
          </fieldset>
          <fieldset className="bo-form-group">
            <legend>Morada</legend>
            <div className="bo-form-grid">
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
            </div>
          </fieldset>
          <fieldset className="bo-form-group">
            <legend>Notas</legend>
            <div className="bo-form-grid">
          <label className="bo-field-wide bo-field-full">
            Notas
            <textarea
              className="bo-input bo-textarea"
              name="notes"
              onChange={(event) => updateField("notes", event.target.value)}
              rows={3}
              value={form.notes}
            />
          </label>
            </div>
          </fieldset>
          <div className="bo-form-actions">
            <button className="bo-button bo-button-primary" disabled={isPending} type="submit">
              {isPending ? "A guardar…" : editingId ? "Guardar alterações" : "Criar cliente"}
            </button>
            {feedback ? (
              <p aria-live="polite" className={`bo-form-feedback is-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.message}</p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="bo-card bo-manager-list">
        <div className="bo-toolbar bo-toolbar-inline">
          <label className="bo-sr-only" htmlFor="client-search">Pesquisar clientes</label>
          <div className="bo-search-control">
            <BackofficeIcon className="bo-search-icon" name="search" size={17} />
            <input className="bo-input bo-search-input" id="client-search" onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar clientes..." type="search" value={query} />
            {query ? <button aria-label="Limpar pesquisa" className="bo-search-clear" onClick={() => setQuery("")} type="button">×</button> : null}
          </div>
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
            {!query ? <button className="bo-button bo-button-secondary" onClick={startCreate} type="button">+ Novo cliente</button> : null}
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
                    <td data-label="Nome"><Link className="bo-table-primary-link" href={`/backoffice/clientes/${client.id}`}>{client.name}</Link></td>
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
                          <BackofficeIcon name="edit" size={14} /> Editar
                        </button>
                        <button className="bo-link-button bo-link-danger" disabled={isPending} onClick={() => client.is_active ? setClientToArchive(client) : toggle(client)} type="button">
                          <BackofficeIcon name="archive" size={14} /> {client.is_active ? "Arquivar" : "Reativar"}
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
      <ConfirmDialog
        confirmLabel="Arquivar cliente"
        description="O cliente deixará de aparecer por defeito nas pesquisas. Os orçamentos existentes não serão alterados."
        onCancel={() => setClientToArchive(null)}
        onConfirm={() => clientToArchive && toggle(clientToArchive)}
        open={Boolean(clientToArchive)}
        title="Arquivar este cliente?"
      />
    </div>
  );
}
