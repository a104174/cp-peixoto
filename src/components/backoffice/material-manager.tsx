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
  const [feedback, setFeedback] = useState("");
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
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFeedback("");
  }

  function startEdit(material: MaterialSummary) {
    setEditingId(material.id);
    setForm(formFromMaterial(material));
    setFeedback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    const formData = new FormData(event.currentTarget);
    if (editingId) formData.set("id", editingId);

    startTransition(async () => {
      const result = editingId
        ? await updateMaterialAction(formData)
        : await createMaterialAction(formData);

      if (!result.success) {
        setFeedback(result.error ?? "Não foi possível guardar o material.");
        return;
      }

      setFeedback(editingId ? "Material atualizado." : "Material criado.");
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
    setFeedback("");
    startTransition(async () => {
      const result = await toggleMaterialActiveAction(material.id);
      if (!result.success) {
        setFeedback(result.error ?? "Não foi possível alterar o estado.");
        return;
      }
      setFeedback(material.is_active ? "Material desativado." : "Material reativado.");
      setMaterials((current) =>
        current.map((item) =>
          item.id === material.id ? { ...item, is_active: !item.is_active } : item,
        ),
      );
      router.refresh();
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
        <form className="bo-form-grid" onSubmit={submit}>
          <label>Marca<input className="bo-input" name="brand" onChange={(event) => updateField("brand", event.target.value)} required value={form.brand} /></label>
          <label>Nome *<input className="bo-input" name="name" onChange={(event) => updateField("name", event.target.value)} required value={form.name} /></label>
          <label>Variante<input className="bo-input" name="variant" onChange={(event) => updateField("variant", event.target.value)} value={form.variant} /></label>
          <label>Categoria<input className="bo-input" name="category" onChange={(event) => updateField("category", event.target.value)} value={form.category} /></label>
          <label className="bo-field-wide">Embalagem / descrição<input className="bo-input" name="packageLabel" onChange={(event) => updateField("packageLabel", event.target.value)} value={form.packageLabel} /></label>
          <label>Quantidade embalagem<input className="bo-input" inputMode="decimal" name="packageQuantity" onChange={(event) => updateField("packageQuantity", event.target.value)} value={form.packageQuantity} /></label>
          <label>Unidade embalagem<input className="bo-input" name="packageUnit" onChange={(event) => updateField("packageUnit", event.target.value)} value={form.packageUnit} /></label>
          <label>Tipo de cálculo
            <select className="bo-input" name="calculationType" onChange={(event) => updateField("calculationType", event.target.value as MaterialForm["calculationType"])} value={form.calculationType}>
              <option value="per_m2">Por m²</option>
              <option value="fixed">Fixo / manual</option>
            </select>
          </label>
          <label>Consumo de referência<input className="bo-input" inputMode="decimal" name="consumption" onChange={(event) => updateField("consumption", event.target.value)} value={form.consumption} /></label>
          <label>Unidade do consumo<input className="bo-input" name="consumptionUnit" onChange={(event) => updateField("consumptionUnit", event.target.value)} value={form.consumptionUnit} /></label>
          <label>Unidade de cálculo<input className="bo-input" name="unit" onChange={(event) => updateField("unit", event.target.value)} required value={form.unit} /></label>
          <label>Preço base / unidade<input className="bo-input" inputMode="decimal" name="baseUnitPrice" onChange={(event) => updateField("baseUnitPrice", event.target.value)} value={form.baseUnitPrice} /></label>
          <label>Preço sugerido / unidade<input className="bo-input" inputMode="decimal" name="discountedUnitPrice" onChange={(event) => updateField("discountedUnitPrice", event.target.value)} value={form.discountedUnitPrice} /></label>
          <label>Preço base / embalagem<input className="bo-input" inputMode="decimal" name="basePackagePrice" onChange={(event) => updateField("basePackagePrice", event.target.value)} value={form.basePackagePrice} /></label>
          <label>Preço sugerido / embalagem<input className="bo-input" inputMode="decimal" name="discountedPackagePrice" onChange={(event) => updateField("discountedPackagePrice", event.target.value)} value={form.discountedPackagePrice} /></label>
          <label>Desconto catálogo (%)<input className="bo-input" inputMode="decimal" name="discountRate" onChange={(event) => updateField("discountRate", event.target.value)} value={form.discountRate} /></label>
          <label className="bo-field-wide">Notas<textarea className="bo-input bo-textarea" name="notes" onChange={(event) => updateField("notes", event.target.value)} rows={3} value={form.notes} /></label>
          <div className="bo-form-actions bo-field-wide">
            <button className="bo-button bo-button-primary" disabled={isPending} type="submit">
              {isPending ? "A guardar…" : editingId ? "Guardar alterações" : "Adicionar material"}
            </button>
            {feedback ? <p aria-live="polite" className="bo-form-feedback">{feedback}</p> : null}
          </div>
        </form>
      </section>

      <section className="bo-card">
        <div className="bo-toolbar bo-toolbar-inline">
          <label className="bo-search-label" htmlFor="material-search">Pesquisar materiais</label>
          <input className="bo-input bo-search-input" id="material-search" onChange={(event) => setQuery(event.target.value)} placeholder="Nome, variante, embalagem ou marca" type="search" value={query} />
          <label className="bo-check-label">
            <input checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} type="checkbox" />
            Mostrar inativos
          </label>
          <span className="bo-result-count">{filtered.length} registo(s)</span>
        </div>
        {filtered.length === 0 ? (
          <div className="bo-empty-state">
            <h2>{query ? "Nenhum material encontrado" : "Ainda não existem materiais"}</h2>
            <p>{query ? "Tente outro termo de pesquisa." : "Execute a seed WestWood depois de ligar o Supabase."}</p>
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
                        <button className="bo-link-button bo-link-danger" disabled={isPending} onClick={() => toggle(material)} type="button">{material.is_active ? "Desativar" : "Reativar"}</button>
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
