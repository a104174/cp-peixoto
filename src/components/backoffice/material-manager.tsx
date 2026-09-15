"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { decimalInputToRate, formatMoney, rateToDecimalInput } from "@/domain/quotes/format";
import {
  createMaterialAction,
  toggleMaterialActiveAction,
  updateMaterialAction,
} from "@/lib/backoffice/actions";
import type { MaterialSummary } from "@/lib/backoffice/data";
import type { FieldErrors } from "@/lib/backoffice/validation";
import { ConfirmDialog } from "./confirm-dialog";
import { FormFieldError } from "./form-field-error";

type MaterialForm = {
  brand: string;
  name: string;
  variant: string;
  category: string;
  packageLabel: string;
  packageQuantity: string;
  packageUnit: string;
  calculationType: "per_m2" | "fixed";
  consumption: string;
  consumptionUnit: string;
  unit: string;
  baseUnitPrice: string;
  discountedUnitPrice: string;
  basePackagePrice: string;
  discountedPackagePrice: string;
  discountRate: string;
  notes: string;
};

const emptyForm: MaterialForm = {
  brand: "WestWood",
  name: "",
  variant: "",
  category: "",
  packageLabel: "",
  packageQuantity: "",
  packageUnit: "",
  calculationType: "per_m2",
  consumption: "",
  consumptionUnit: "",
  unit: "kg",
  baseUnitPrice: "",
  discountedUnitPrice: "",
  basePackagePrice: "",
  discountedPackagePrice: "",
  discountRate: "18",
  notes: "",
};

function formFromMaterial(material: MaterialSummary): MaterialForm {
  return {
    brand: material.brand,
    name: material.name,
    variant: material.variant ?? "",
    category: material.category ?? "",
    packageLabel: material.package_label ?? "",
    packageQuantity: material.package_quantity ?? "",
    packageUnit: material.package_unit ?? "",
    calculationType: material.calculation_type,
    consumption: material.consumption ?? "",
    consumptionUnit: material.consumption_unit ?? "",
    unit: material.unit,
    baseUnitPrice: material.base_unit_price ?? "",
    discountedUnitPrice: material.discounted_unit_price ?? "",
    basePackagePrice: material.base_package_price ?? "",
    discountedPackagePrice: material.discounted_package_price ?? "",
    discountRate: rateToDecimalInput(material.discount_rate ?? ""),
    notes: material.notes ?? "",
  };
}

function materialFromForm(formData: FormData, id: string): MaterialSummary {
  const text = (key: string) => String(formData.get(key) ?? "").trim() || null;
  const decimal = (key: string) => text(key);
  return {
    id,
    brand: String(formData.get("brand") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    variant: text("variant"),
    category: text("category"),
    package_label: text("packageLabel"),
    package_quantity: decimal("packageQuantity"),
    package_unit: text("packageUnit"),
    calculation_type: String(formData.get("calculationType") ?? "per_m2") as MaterialSummary["calculation_type"],
    consumption: decimal("consumption"),
    consumption_unit: text("consumptionUnit"),
    unit: String(formData.get("unit") ?? "").trim(),
    base_unit_price: decimal("baseUnitPrice"),
    discounted_unit_price: decimal("discountedUnitPrice"),
    base_package_price: decimal("basePackagePrice"),
    discounted_package_price: decimal("discountedPackagePrice"),
    discount_rate: decimalInputToRate(String(formData.get("discountRate") ?? "")),
    notes: text("notes"),
    is_active: true,
  };
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
        [material.name, material.variant, material.package_label, material.brand]
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
            `${left.name} ${left.variant ?? ""} ${left.package_label ?? ""}`.localeCompare(
              `${right.name} ${right.variant ?? ""} ${right.package_label ?? ""}`,
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
          Adicionar material
        </button>
      </div>

      <section className="bo-card bo-form-card">
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
        <form className="bo-form-grid" onSubmit={submit} noValidate>
          <MaterialField error={fieldErrors.brand} label="Marca *" name="brand" onChange={(value) => updateField("brand", value)} required value={form.brand} />
          <MaterialField error={fieldErrors.name} label="Nome *" name="name" onChange={(value) => updateField("name", value)} required value={form.name} />
          <MaterialField error={fieldErrors.variant} label="Variante" name="variant" onChange={(value) => updateField("variant", value)} value={form.variant} />
          <MaterialField error={fieldErrors.category} label="Categoria" name="category" onChange={(value) => updateField("category", value)} value={form.category} />
          <MaterialField className="bo-field-wide" error={fieldErrors.packageLabel} label="Embalagem / descrição" name="packageLabel" onChange={(value) => updateField("packageLabel", value)} value={form.packageLabel} />
          <MaterialField decimal error={fieldErrors.packageQuantity} label="Quantidade embalagem" name="packageQuantity" onChange={(value) => updateField("packageQuantity", value)} value={form.packageQuantity} />
          <MaterialField error={fieldErrors.packageUnit} label="Unidade embalagem" name="packageUnit" onChange={(value) => updateField("packageUnit", value)} value={form.packageUnit} />
          <label>Tipo de cálculo
            <select className="bo-input" name="calculationType" onChange={(event) => updateField("calculationType", event.target.value as MaterialForm["calculationType"])} value={form.calculationType}>
              <option value="per_m2">Por m²</option>
              <option value="fixed">Fixo / manual</option>
            </select>
          </label>
          <MaterialField decimal error={fieldErrors.consumption} label="Consumo de referência" name="consumption" onChange={(value) => updateField("consumption", value)} value={form.consumption} />
          <MaterialField error={fieldErrors.consumptionUnit} label="Unidade do consumo" name="consumptionUnit" onChange={(value) => updateField("consumptionUnit", value)} value={form.consumptionUnit} />
          <MaterialField error={fieldErrors.unit} label="Unidade de cálculo *" name="unit" onChange={(value) => updateField("unit", value)} required value={form.unit} />
          <MaterialField decimal error={fieldErrors.baseUnitPrice} label="Preço base / unidade" name="baseUnitPrice" onChange={(value) => updateField("baseUnitPrice", value)} value={form.baseUnitPrice} />
          <MaterialField decimal error={fieldErrors.discountedUnitPrice} label="Preço sugerido / unidade" name="discountedUnitPrice" onChange={(value) => updateField("discountedUnitPrice", value)} value={form.discountedUnitPrice} />
          <MaterialField decimal error={fieldErrors.basePackagePrice} label="Preço base / embalagem" name="basePackagePrice" onChange={(value) => updateField("basePackagePrice", value)} value={form.basePackagePrice} />
          <MaterialField decimal error={fieldErrors.discountedPackagePrice} label="Preço sugerido / embalagem" name="discountedPackagePrice" onChange={(value) => updateField("discountedPackagePrice", value)} value={form.discountedPackagePrice} />
          <MaterialField decimal error={fieldErrors.discountRate} label="Desconto catálogo (%)" name="discountRate" onChange={(value) => updateField("discountRate", value)} value={form.discountRate} />
          <label className="bo-field-wide">Notas<textarea className="bo-input bo-textarea" name="notes" onChange={(event) => updateField("notes", event.target.value)} rows={3} value={form.notes} /></label>
          <div className="bo-form-actions bo-field-wide">
            <button className="bo-button bo-button-primary" disabled={isPending} type="submit">
              {isPending ? "A guardar…" : editingId ? "Guardar alterações" : "Adicionar material"}
            </button>
            {feedback ? <p aria-live="polite" className={`bo-form-feedback is-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.message}</p> : null}
          </div>
        </form>
      </section>

      <section className="bo-card">
        <div className="bo-toolbar bo-toolbar-inline">
          <label className="bo-search-label" htmlFor="material-search">Pesquisar materiais</label>
          <div className="bo-search-control">
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
                  <th>Variante</th>
                  <th>Embalagem</th>
                  <th>Consumo</th>
                  <th>Preço base</th>
                  <th>Preço sugerido</th>
                  <th>Estado</th>
                  <th><span className="bo-sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((material) => (
                  <tr className={!material.is_active ? "is-inactive" : undefined} key={material.id}>
                    <td data-label="Material"><strong>{material.name}</strong><small className="bo-table-subtext">{material.brand}</small></td>
                    <td data-label="Variante">{material.variant ?? "—"}</td>
                    <td data-label="Embalagem">{material.package_label ?? "—"}</td>
                    <td data-label="Consumo">{material.consumption ? `${material.consumption} ${material.consumption_unit ?? ""}` : "Manual"}</td>
                    <td data-label="Preço base">{formatMoney(material.base_unit_price)}</td>
                    <td data-label="Preço sugerido"><strong>{formatMoney(material.discounted_unit_price)}</strong></td>
                    <td data-label="Estado"><span className={`bo-status ${material.is_active ? "is-active" : "is-inactive"}`}>{material.is_active ? "Ativo" : "Inativo"}</span></td>
                    <td data-label="Ações">
                      <div className="bo-inline-actions">
                        <button className="bo-link-button" onClick={() => startEdit(material)} type="button">Editar</button>
                        <button className="bo-link-button bo-link-danger" disabled={isPending} onClick={() => material.is_active ? setMaterialToDisable(material) : toggle(material)} type="button">{material.is_active ? "Desativar" : "Reativar"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
