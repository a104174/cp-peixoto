"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { formatMoney, formatNumber, type FormNumericValue } from "@/domain/quotes/format";
import {
  createMaterialAction,
  toggleMaterialActiveAction,
  updateMaterialAction,
} from "@/lib/backoffice/actions";
import type { MaterialSummary } from "@/lib/backoffice/data";
import type { FieldErrors } from "@/lib/backoffice/validation";
import { ConfirmDialog } from "./confirm-dialog";
import { FormFieldError } from "./form-field-error";
import { BackofficeIcon } from "./backoffice-icon";

type MaterialForm = {
  name: string;
  consumptionPerM2: string;
  pricePerKg: string;
  pricePerContainer: string;
};

const emptyForm: MaterialForm = {
  name: "",
  consumptionPerM2: "",
  pricePerKg: "",
  pricePerContainer: "",
};

function formFromMaterial(material: MaterialSummary): MaterialForm {
  const formText = (value: FormNumericValue): string =>
    value === null || value === undefined || value === "" ? "" : String(value);

  return {
    name: formText(material.name),
    consumptionPerM2: formText(material.consumption_per_m2),
    pricePerKg: formText(material.price_per_kg),
    pricePerContainer: formText(material.price_per_container),
  };
}

function materialFromForm(formData: FormData, id: string): MaterialSummary {
  const text = (key: string) => String(formData.get(key) ?? "").trim() || null;
  return {
    id,
    name: String(formData.get("name") ?? "").trim(),
    consumption_per_m2: text("consumptionPerM2"),
    price_per_kg: text("pricePerKg"),
    price_per_container: text("pricePerContainer"),
    is_active: true,
  };
}

function hasMaterialValue(value: FormNumericValue): boolean {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function optionalMoney(value: FormNumericValue): string {
  return hasMaterialValue(value) ? formatMoney(value) : "—";
}

export function MaterialManager({
  initialMaterials,
}: {
  initialMaterials: MaterialSummary[];
}) {
  const router = useRouter();
  const [materials, setMaterials] = useState(initialMaterials);
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialForm>(emptyForm);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [materialToDisable, setMaterialToDisable] = useState<MaterialSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-PT");
    return materials.filter((material) => {
      const matchesQuery =
        !normalized ||
        [material.name]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("pt-PT").includes(normalized));
      return matchesQuery && (showInactive || material.is_active);
    });
  }, [materials, query, showInactive]);

  function updateField(field: keyof MaterialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFeedback(null);
    setFieldErrors({});
  }

  function startEdit(material: MaterialSummary) {
    setEditingId(material.id);
    setForm(formFromMaterial(material));
    setFeedback(null);
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setFieldErrors({});
    const formData = new FormData(event.currentTarget);
    if (editingId) formData.set("id", editingId);

    startTransition(async () => {
      const result = editingId
        ? await updateMaterialAction(formData)
        : await createMaterialAction(formData);

      if (!result.success) {
        if (result.code === "AUTH_REQUIRED") {
          router.push("/backoffice/login?reason=session-expired");
          return;
        }
        setFieldErrors(result.fieldErrors ?? {});
        setFeedback({ type: "error", message: result.message });
        return;
      }

      setFeedback({ type: "success", message: result.message ?? (editingId ? "Material atualizado." : "Material criado com sucesso.") });
      if (result.id) {
        const nextMaterial = materialFromForm(formData, result.id);
        setMaterials((current) => {
          if (editingId) {
            return current.map((material) =>
              material.id === editingId
                ? { ...nextMaterial, is_active: material.is_active }
                : material,
            );
          }
          return [...current, nextMaterial].sort((left, right) =>
            left.name.localeCompare(
              right.name,
              "pt-PT",
            ),
          );
        });
      }
      setEditingId(null);
      setForm(emptyForm);
      router.refresh();
    });
  }

  function toggle(material: MaterialSummary) {
    setFeedback(null);
    startTransition(async () => {
      const result = await toggleMaterialActiveAction(material.id);
      if (!result.success) {
        if (result.code === "AUTH_REQUIRED") {
          router.push("/backoffice/login?reason=session-expired");
          return;
        }
        setFeedback({ type: "error", message: result.message });
        return;
      }
      setFeedback({ type: "success", message: material.is_active ? "Material desativado." : "Material reativado." });
      setMaterials((current) =>
        current.map((item) =>
          item.id === material.id ? { ...item, is_active: !item.is_active } : item,
        ),
      );
      router.refresh();
      setMaterialToDisable(null);
    });
  }

  return (
    <div className="bo-page">
      <div className="bo-page-heading">
        <div>
          <p className="bo-eyebrow">Catálogo operacional</p>
          <h1>Materiais</h1>
          <p className="bo-muted">Preços WestWood e outras linhas selecionáveis nos orçamentos.</p>
        </div>
        <button className="bo-button bo-button-primary" onClick={startCreate} type="button">
          <BackofficeIcon name="plus" size={16} /> Adicionar material
        </button>
      </div>

      <div className="bo-manager-layout bo-manager-layout-materials">
      <section className="bo-card bo-form-card bo-manager-form">
        <div className="bo-section-heading">
          <div>
            <p className="bo-eyebrow">{editingId ? "Editar" : "Adicionar"}</p>
            <h2>{editingId ? "Dados do material" : "Novo material"}</h2>
          </div>
          {editingId ? (
            <button className="bo-button bo-button-ghost" onClick={startCreate} type="button">
              Cancelar
            </button>
          ) : null}
        </div>
        <form className="bo-manager-form-body" onSubmit={submit} noValidate>
          <div className="bo-form-grid bo-material-simple-grid">
            <MaterialField error={fieldErrors.name} label="Nome do material *" name="name" onChange={(value) => updateField("name", value)} required value={form.name} />
            <MaterialField decimal error={fieldErrors.consumptionPerM2} label="Consumo por m² (kg/m²)" name="consumptionPerM2" onChange={(value) => updateField("consumptionPerM2", value)} value={form.consumptionPerM2} />
            <MaterialField decimal error={fieldErrors.pricePerKg} label="Preço por kg (CHF/kg)" name="pricePerKg" onChange={(value) => updateField("pricePerKg", value)} value={form.pricePerKg} />
            <MaterialField decimal error={fieldErrors.pricePerContainer} label="Preço por lata/balde (CHF)" name="pricePerContainer" onChange={(value) => updateField("pricePerContainer", value)} value={form.pricePerContainer} />
          </div>
          <div className="bo-form-actions">
            <button className="bo-button bo-button-primary" disabled={isPending} type="submit">
              {isPending ? "A guardar…" : editingId ? "Guardar alterações" : "Adicionar material"}
            </button>
            {feedback ? <p aria-live="polite" className={`bo-form-feedback is-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.message}</p> : null}
          </div>
        </form>
      </section>

      <section className="bo-card bo-manager-list">
        <div className="bo-toolbar bo-toolbar-inline">
          <label className="bo-sr-only" htmlFor="material-search">Pesquisar materiais</label>
          <div className="bo-search-control">
            <BackofficeIcon className="bo-search-icon" name="search" size={17} />
            <input className="bo-input bo-search-input" id="material-search" onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar materiais..." type="search" value={query} />
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
            <h2>{query ? "Nenhum material encontrado" : "Ainda não existem materiais"}</h2>
            <p>{query ? "Tente outro termo de pesquisa." : "Adicione o primeiro material ao catálogo."}</p>
            {!query ? <button className="bo-button bo-button-secondary" onClick={startCreate} type="button">+ Adicionar material</button> : null}
          </div>
        ) : (
          <div className="bo-table-wrap">
            <table className="bo-table bo-material-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Consumo / m²</th>
                  <th>Preço / kg</th>
                  <th>Preço lata/balde</th>
                  <th>Estado</th>
                  <th><span className="bo-sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((material) => (
                  <tr className={!material.is_active ? "is-inactive" : undefined} key={material.id}>
                    <td data-label="Material"><strong>{material.name}</strong></td>
                    <td data-label="Consumo / m²">{hasMaterialValue(material.consumption_per_m2) ? `${formatNumber(material.consumption_per_m2)} kg/m²` : "—"}</td>
                    <td data-label="Preço / kg"><strong>{optionalMoney(material.price_per_kg)}</strong></td>
                    <td data-label="Preço lata/balde">{optionalMoney(material.price_per_container)}</td>
                    <td data-label="Estado"><span className={`bo-status ${material.is_active ? "is-active" : "is-inactive"}`}>{material.is_active ? "Ativo" : "Inativo"}</span></td>
                    <td data-label="Ações">
                      <div className="bo-inline-actions">
                        <button className="bo-link-button" onClick={() => startEdit(material)} type="button"><BackofficeIcon name="edit" size={14} /> Editar</button>
                        <button className="bo-link-button bo-link-danger" disabled={isPending} onClick={() => material.is_active ? setMaterialToDisable(material) : toggle(material)} type="button"><BackofficeIcon name="archive" size={14} /> {material.is_active ? "Desativar" : "Reativar"}</button>
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
        confirmLabel="Desativar material"
        description="O material deixará de aparecer nas pesquisas de novos orçamentos. Os orçamentos existentes não serão alterados."
        onCancel={() => setMaterialToDisable(null)}
        onConfirm={() => materialToDisable && toggle(materialToDisable)}
        open={Boolean(materialToDisable)}
        title="Desativar este material?"
      />
    </div>
  );
}

function MaterialField({
  className,
  decimal = false,
  error,
  label,
  name,
  onChange,
  required = false,
  value,
}: {
  className?: string;
  decimal?: boolean;
  error?: string;
  label: string;
  name: keyof MaterialForm;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  const errorId = `material-${name}-error`;
  return (
    <label className={className}>
      {label}
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="bo-input"
        inputMode={decimal ? "decimal" : undefined}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      />
      <FormFieldError id={errorId} message={error} />
    </label>
  );
}
