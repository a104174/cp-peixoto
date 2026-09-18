"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Decimal from "decimal.js";

import {
  createEmptyLaborDraft,
  createEmptyLineDraft,
  createEmptyMaterialDraft,
  newId,
} from "@/domain/quotes/defaults";
import {
  knownMaterialUnit,
  normalizeMaterialUnit,
  QUOTE_MATERIAL_UNIT_OPTIONS,
} from "@/domain/quotes/material-units";
import {
  calculateQuote,
  type CalculationWarning,
} from "@/domain/quotes/calculations";
import {
  attachCatalogMaterial,
  materialNameOverride,
} from "@/domain/quotes/material-catalog";
import {
  decimalInputToRate,
  formatMoney,
  formatNumber,
  formatPercent,
  rateToDecimalInput,
} from "@/domain/quotes/format";
import type {
  QuoteDraft,
  QuoteLaborDraft,
  QuoteLineDraft,
  QuoteMaterialDraft,
  QuoteSurchargeDraft,
} from "@/domain/quotes/types";
import {
  createClientAction,
  createMaterialFromQuoteAction,
  saveQuoteAction,
} from "@/lib/backoffice/actions";
import type { ClientSummary, MaterialSummary } from "@/lib/backoffice/data";
import { parseLocaleDecimal, validateQuoteDraft, type FieldErrors } from "@/lib/backoffice/validation";
import { ConfirmDialog } from "./confirm-dialog";
import { FormFieldError } from "./form-field-error";
import { BackofficeIcon } from "./backoffice-icon";

type QuoteEditorProps = {
  initialDraft: QuoteDraft;
  clients: ClientSummary[];
  materials: MaterialSummary[];
  successMessage?: string;
};

type QuickMaterialForm = {
  brand: string;
  name: string;
  variant: string;
  category: string;
  packageLabel: string;
  packageQuantity: string;
  packageUnit: string;
  calculationType: QuoteMaterialDraft["calculationType"];
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

const CUSTOM_UNIT_VALUE = "__custom__";

const surchargeBaseLabels: Record<QuoteSurchargeDraft["baseType"], string> = {
  subcontracts: "Subempreitadas",
  materials: "Materiais",
  labor: "Mão de obra",
  equipment: "Viatura / equipamento",
  labor_plus_equipment: "Mão de obra + viatura / equipamento",
  direct_costs: "Custos diretos",
  direct_costs_plus_previous: "Custos diretos + acréscimos anteriores",
};

function materialLabel(material: MaterialSummary): string {
  return [material.name, material.variant, material.package_label]
    .filter(Boolean)
    .join(" · ");
}

function materialSuggestedPrice(material: MaterialSummary): string {
  return material.discounted_unit_price ?? material.base_unit_price ?? "0";
}

function normalizedMaterialSearch(value: string): string {
  return value.trim().toLocaleLowerCase("pt-PT");
}

function quickMaterialFormFromLine(line: QuoteMaterialDraft): QuickMaterialForm {
  return {
    brand: "",
    name: line.materialNameSnapshot,
    variant: line.variantSnapshot,
    category: "",
    packageLabel: line.packageSnapshot,
    packageQuantity: "",
    packageUnit: "",
    calculationType: line.calculationType,
    consumption: line.consumptionOrQuantity,
    consumptionUnit: "",
    unit: normalizeMaterialUnit(line.unit),
    baseUnitPrice: "",
    discountedUnitPrice: line.unitPrice,
    basePackagePrice: "",
    discountedPackagePrice: "",
    discountRate: "",
    notes: line.notes,
  };
}

function updateArray<T extends { id: string }>(
  rows: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
}

function decimalLessThan(left: string, right: string): boolean {
  try {
    return new Decimal(left || 0).lt(new Decimal(right || 0));
  } catch {
    return false;
  }
}

export function QuoteEditor({
  initialDraft,
  clients,
  materials,
  successMessage,
}: QuoteEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [clientQuery, setClientQuery] = useState(() => {
    const client = clients.find((item) => item.id === initialDraft.clientId);
    return client?.name ?? "";
  });
  const [clientOptionsOpen, setClientOptionsOpen] = useState(false);
  const [clientActiveIndex, setClientActiveIndex] = useState(0);
  const [materialSearch, setMaterialSearch] = useState<Record<string, string>>({});
  const [activeMaterialRow, setActiveMaterialRow] = useState<string | null>(null);
  const [materialActiveIndex, setMaterialActiveIndex] = useState(0);
  const [customUnitRows, setCustomUnitRows] = useState<Record<string, boolean>>({});
  const [quickMaterialRowId, setQuickMaterialRowId] = useState<string | null>(null);
  const [quickMaterialForm, setQuickMaterialForm] = useState<QuickMaterialForm | null>(null);
  const [quickMaterialErrors, setQuickMaterialErrors] = useState<FieldErrors>({});
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [quickClientErrors, setQuickClientErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    successMessage ? { type: "success", message: successMessage } : null,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialDraft));
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<{ title: string; description: string; remove: () => void } | null>(null);
  const [isPending, startTransition] = useTransition();

  const calculation = useMemo(() => calculateQuote(draft), [draft]);
  const isDirty = JSON.stringify(draft) !== savedSnapshot;

  useEffect(() => {
    if (!isDirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const captureLink = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.href === window.location.href) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingNavigation(`${url.pathname}${url.search}${url.hash}`);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", captureLink, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", captureLink, true);
    };
  }, [isDirty]);

  const filteredClients = useMemo(() => {
    const query = clientQuery.trim().toLocaleLowerCase("pt-PT");
    return clients
      .filter(
        (client) =>
          (client.is_active || client.id === draft.clientId) &&
          (!query ||
            [client.name, client.email, client.phone]
              .filter(Boolean)
              .some((value) => value?.toLocaleLowerCase("pt-PT").includes(query))),
      )
      .slice(0, 8);
  }, [clients, clientQuery, draft.clientId]);

  function updateHeader(
    field:
      | "projectLocation"
      | "quoteDate"
      | "description"
      | "area"
      | "areaUnit"
      | "hourlyRate"
      | "desiredMargin"
      | "commercialDiscount"
      | "skonto"
      | "fixedDeduction"
      | "manualGross",
    value: string,
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    clearFieldError(field);
  }

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function errorProps(field: string) {
    return {
      "aria-describedby": fieldErrors[field] ? `${field.replaceAll(".", "-")}-error` : undefined,
      "aria-invalid": Boolean(fieldErrors[field]),
    };
  }

  function selectClient(client: ClientSummary) {
    setDraft((current) => ({ ...current, clientId: client.id }));
    setClientQuery(client.name);
    setClientOptionsOpen(false);
    clearFieldError("description");
  }

  function clearClient() {
    setDraft((current) => ({ ...current, clientId: null }));
    setClientQuery("");
    setClientOptionsOpen(false);
  }

  function openQuickMaterial(row: QuoteMaterialDraft) {
    setQuickMaterialRowId(row.id);
    setQuickMaterialForm(quickMaterialFormFromLine(row));
    setQuickMaterialErrors({});
  }

  function closeQuickMaterial() {
    setQuickMaterialRowId(null);
    setQuickMaterialForm(null);
    setQuickMaterialErrors({});
  }

  function updateQuickMaterialField(field: keyof QuickMaterialForm, value: string) {
    setQuickMaterialForm((current) => current ? { ...current, [field]: value } : current);
    setQuickMaterialErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function createQuickMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quickMaterialRowId) return;

    const rowId = quickMaterialRowId;
    const form = event.currentTarget;
    const formData = new FormData(form);
    setQuickMaterialErrors({});

    startTransition(async () => {
      const result = await createMaterialFromQuoteAction(formData);
      if (!result.success) {
        if (result.code === "AUTH_REQUIRED") {
          router.push("/backoffice/login?reason=session-expired");
          return;
        }
        setQuickMaterialErrors(result.fieldErrors ?? {});
        setFeedback({ type: "error", message: result.message });
        return;
      }

      const createdMaterialId = result.id;
      if (createdMaterialId) {
        setDraft((current) => ({
          ...current,
          materials: updateArray(current.materials, rowId, attachCatalogMaterial(createdMaterialId)),
        }));
        setMaterialSearch((current) => ({
          ...current,
          [rowId]: current[rowId] ?? String(formData.get("name") ?? ""),
        }));
      }
      setFeedback({ type: "success", message: result.message ?? "Material adicionado ao catálogo." });
      closeQuickMaterial();
      router.refresh();
    });
  }

  function addMaterial() {
    setDraft((current) => ({
      ...current,
      materials: [...current.materials, createEmptyMaterialDraft(current.materials.length)],
    }));
  }

  function patchMaterial(id: string, patch: Partial<QuoteMaterialDraft>) {
    setDraft((current) => ({
      ...current,
      materials: updateArray(current.materials, id, patch),
    }));
    const index = draft.materials.findIndex((line) => line.id === id);
    Object.keys(patch).forEach((field) => clearFieldError(`materials.${index}.${field}`));
  }

  function selectMaterial(row: QuoteMaterialDraft, material: MaterialSummary) {
    const factor = material.calculation_type === "per_m2" ? draft.area || "0" : "1";
    patchMaterial(row.id, {
      materialId: material.id,
      materialNameSnapshot: material.name,
      variantSnapshot: material.variant ?? "",
      packageSnapshot: material.package_label ?? "",
      calculationType: material.calculation_type,
      consumptionOrQuantity: material.consumption ?? "0",
      unit: normalizeMaterialUnit(material.unit),
      unitPrice: materialSuggestedPrice(material),
      areaFactor: factor,
      areaFactorOverridden: false,
      notes: material.notes ?? "",
    });
    setMaterialSearch((current) => ({
      ...current,
      [row.id]: materialLabel(material),
    }));
    setCustomUnitRows((current) => {
      if (!current[row.id]) return current;
      const next = { ...current };
      delete next[row.id];
      return next;
    });
    setActiveMaterialRow(null);
  }

  function updateMaterialUnit(rowId: string, value: string) {
    if (value === CUSTOM_UNIT_VALUE) {
      setCustomUnitRows((current) => ({ ...current, [rowId]: true }));
      patchMaterial(rowId, { unit: "" });
      return;
    }

    setCustomUnitRows((current) => {
      if (!current[rowId]) return current;
      const next = { ...current };
      delete next[rowId];
      return next;
    });
    patchMaterial(rowId, { unit: normalizeMaterialUnit(value) });
  }

  function updateCustomMaterialUnit(rowId: string, value: string) {
    const normalized = normalizeMaterialUnit(value);
    const known = knownMaterialUnit(normalized);
    if (known) {
      setCustomUnitRows((current) => {
        if (!current[rowId]) return current;
        const next = { ...current };
        delete next[rowId];
        return next;
      });
    }
    patchMaterial(rowId, { unit: normalized });
  }

  function updateArea(value: string) {
    setDraft((current) => ({
      ...current,
      area: value,
      materials: current.materials.map((line) =>
        line.calculationType === "per_m2" && !line.areaFactorOverridden
          ? { ...line, areaFactor: value || "0" }
          : line,
      ),
    }));
    clearFieldError("area");
  }

  function removeMaterial(id: string) {
    setDraft((current) => ({
      ...current,
      materials: current.materials
        .filter((line) => line.id !== id)
        .map((line, index) => ({ ...line, position: index })),
    }));
    setMaterialSearch((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setCustomUnitRows((current) => {
      if (!current[id]) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function addLabor() {
    setDraft((current) => ({
      ...current,
      labor: [...current.labor, createEmptyLaborDraft(current.labor.length)],
    }));
  }

  function patchLabor(id: string, patch: Partial<QuoteLaborDraft>) {
    setDraft((current) => ({
      ...current,
      labor: updateArray(current.labor, id, patch),
    }));
  }

  function removeLabor(id: string) {
    setDraft((current) => ({
      ...current,
      labor: current.labor
        .filter((line) => line.id !== id)
        .map((line, index) => ({ ...line, position: index })),
    }));
  }

  function addSimpleLine(group: "subcontracts" | "equipment") {
    setDraft((current) => ({
      ...current,
      [group]: [
        ...current[group],
        createEmptyLineDraft(current[group].length),
      ],
    }));
  }

  function patchSimpleLine(
    group: "subcontracts" | "equipment",
    id: string,
    patch: Partial<QuoteLineDraft>,
  ) {
    setDraft((current) => ({
      ...current,
      [group]: updateArray(current[group], id, patch),
    }));
  }

  function removeSimpleLine(group: "subcontracts" | "equipment", id: string) {
    setDraft((current) => ({
      ...current,
      [group]: current[group]
        .filter((line) => line.id !== id)
        .map((line, index) => ({ ...line, position: index })),
    }));
  }

  function addSurcharge() {
    setDraft((current) => ({
      ...current,
      surcharges: [
        ...current.surcharges,
        {
          id: newId(),
          position: current.surcharges.length,
          name: "",
          baseType: "direct_costs",
          rate: "",
          baseAmount: "0",
          amount: "0",
        },
      ],
    }));
  }

  function patchSurcharge(id: string, patch: Partial<QuoteSurchargeDraft>) {
    setDraft((current) => ({
      ...current,
      surcharges: updateArray(current.surcharges, id, patch),
    }));
  }

  function removeSurcharge(id: string) {
    setDraft((current) => ({
      ...current,
      surcharges: current.surcharges
        .filter((line) => line.id !== id)
        .map((line, index) => ({ ...line, position: index })),
    }));
  }

  function save() {
    setFeedback(null);
    const localErrors = validateQuoteDraft(draft);
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setFeedback({ type: "error", message: "Não foi possível guardar o orçamento. Verifique os campos assinalados e tente novamente." });
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setFieldErrors({});
    startTransition(async () => {
      const result = await saveQuoteAction(draft);
      if (!result.success) {
        if (result.code === "AUTH_REQUIRED") {
          router.push("/backoffice/login?reason=session-expired");
          return;
        }
        setFieldErrors(result.fieldErrors ?? {});
        setFeedback({ type: "error", message: result.message });
        return;
      }

      setFeedback({ type: "success", message: result.message ?? "Alterações guardadas." });
      if (result.quoteId) {
        const savedDraft = {
          ...draft,
          id: result.quoteId,
          quoteNumber: result.quoteNumber ?? draft.quoteNumber,
        };
        setDraft((current) => ({
          ...current,
          id: result.quoteId ?? current.id,
          quoteNumber: result.quoteNumber ?? current.quoteNumber,
        }));
        setSavedSnapshot(JSON.stringify(savedDraft));
        if (!initialDraft.id) {
          router.replace(`/backoffice/orcamentos/${result.quoteId}?saved=created`);
        } else {
          router.refresh();
        }
      }
    });
  }

  function createQuickClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setQuickClientErrors({});
    startTransition(async () => {
      const result = await createClientAction(new FormData(form));
      if (!result.success) {
        if (result.code === "AUTH_REQUIRED") {
          router.push("/backoffice/login?reason=session-expired");
          return;
        }
        setQuickClientErrors(result.fieldErrors ?? {});
        setFeedback({ type: "error", message: result.message });
        return;
      }

      const name = String(new FormData(form).get("name") ?? "");
      if (result.id) {
        setDraft((current) => ({ ...current, clientId: result.id ?? null }));
        setClientQuery(name);
      }
      setNewClientOpen(false);
      setFeedback({ type: "success", message: "Cliente criado e associado ao orçamento." });
      form.reset();
      router.refresh();
    });
  }

  const warningItems = calculation.warnings.filter(
    (warning) => warning.severity !== "info",
  );
  const hasLoss = decimalLessThan(calculation.profit, "0") || decimalLessThan(calculation.realMargin, "0");
  const belowDesiredMargin = Boolean(
    draft.manualGross.trim() &&
      draft.desiredMargin.trim() &&
      decimalLessThan(calculation.realMargin, draft.desiredMargin),
  );

  return (
    <div className="bo-page bo-quote-page">
      <div className="bo-page-heading">
        <div>
          <nav aria-label="Breadcrumb" className="bo-breadcrumb">
            <Link href="/backoffice/orcamentos">Orçamentos</Link>
            <BackofficeIcon name="arrow" size={13} />
            <span>{draft.quoteNumber ?? "Novo"}</span>
          </nav>
          <h1>{draft.id ? `Editar ${draft.quoteNumber}` : "Novo orçamento"}</h1>
          <p className="bo-muted">Preencha os dados da obra e construa o cálculo por secções.</p>
        </div>
        <div className="bo-heading-actions">
          <button className="bo-button bo-button-primary" disabled={isPending} onClick={save} type="button">
            <BackofficeIcon name="save" size={16} /> {isPending ? "A guardar…" : "Guardar orçamento"}
          </button>
        </div>
      </div>

      <nav aria-label="Secções do orçamento" className="bo-section-nav">
        <a href="#quote-project">Dados da obra</a>
        <a href="#quote-materials">Materiais</a>
        <a href="#quote-labor">Mão de obra</a>
        <a href="#quote-subcontracts">Subempreitadas</a>
        <a href="#quote-equipment">Equipamento</a>
        <a href="#quote-surcharges">Acréscimos</a>
        <a href="#quote-price">Preço</a>
      </nav>

      {feedback ? (
        <p aria-live="polite" className={`bo-form-feedback bo-global-feedback is-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.message}</p>
      ) : null}

      <div className="bo-quote-layout">
        <div className="bo-quote-main">
          <section className="bo-card bo-section" aria-labelledby="quote-project-heading" id="quote-project">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">1 · Dados da obra</p>
                <h2 id="quote-project-heading">Dados da obra</h2>
              </div>
              <span className="bo-readonly-number">
                {draft.quoteNumber ?? "Será atribuído ao guardar"}
              </span>
            </div>

            <div className="bo-form-grid">
              <div className="bo-field bo-field-wide bo-combobox">
                <label htmlFor="quote-client">Cliente</label>
                <div className="bo-combobox-input-row">
                  <input
                    aria-autocomplete="list"
                    aria-controls="quote-client-options"
                    aria-expanded={clientOptionsOpen}
                    className="bo-input"
                    id="quote-client"
                    onBlur={() => window.setTimeout(() => setClientOptionsOpen(false), 120)}
                    onChange={(event) => {
                      setClientQuery(event.target.value);
                      setClientOptionsOpen(true);
                      setClientActiveIndex(0);
                      if (!event.target.value) clearClient();
                    }}
                    onFocus={() => setClientOptionsOpen(true)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setClientOptionsOpen(false);
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setClientActiveIndex((index) => Math.min(index + 1, Math.max(filteredClients.length - 1, 0)));
                      }
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setClientActiveIndex((index) => Math.max(index - 1, 0));
                      }
                      if (event.key === "Enter" && clientOptionsOpen && filteredClients[clientActiveIndex]) {
                        event.preventDefault();
                        selectClient(filteredClients[clientActiveIndex]);
                      }
                    }}
                    placeholder="Pesquisar nome, email ou telefone"
                    role="combobox"
                    value={clientQuery}
                  />
                  {draft.clientId ? (
                    <button className="bo-icon-button" onClick={clearClient} type="button" aria-label="Limpar cliente">
                      ×
                    </button>
                  ) : null}
                </div>
                {clientOptionsOpen ? (
                  <div className="bo-combobox-options" id="quote-client-options" role="listbox">
                    {filteredClients.length ? filteredClients.map((client, index) => (
                      <button
                        className={`bo-combobox-option${index === clientActiveIndex ? " is-active" : ""}`}
                        key={client.id}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectClient(client)}
                        role="option"
                        aria-selected={client.id === draft.clientId}
                        type="button"
                      >
                        <strong>{client.name}</strong>
                        <small>{[client.email, client.phone].filter(Boolean).join(" · ") || "Sem contacto"}</small>
                      </button>
                    )) : <p className="bo-combobox-empty">Nenhum cliente encontrado.</p>}
                  </div>
                ) : null}
                <button className="bo-inline-create" onClick={() => setNewClientOpen((open) => !open)} type="button">
                  {newClientOpen ? "Fechar novo cliente" : "+ Novo cliente"}
                </button>
                {newClientOpen ? (
                  <form className="bo-quick-form" onSubmit={createQuickClient}>
                    <label>Nome *<input aria-describedby={quickClientErrors.name ? "quick-client-name-error" : undefined} aria-invalid={Boolean(quickClientErrors.name)} className="bo-input" name="name" required /><FormFieldError id="quick-client-name-error" message={quickClientErrors.name} /></label>
                    <label>Email<input aria-describedby={quickClientErrors.email ? "quick-client-email-error" : undefined} aria-invalid={Boolean(quickClientErrors.email)} className="bo-input" name="email" type="email" /><FormFieldError id="quick-client-email-error" message={quickClientErrors.email} /></label>
                    <label>Telefone<input className="bo-input" name="phone" /></label>
                    <button className="bo-button bo-button-secondary" disabled={isPending} type="submit">Criar e associar</button>
                  </form>
                ) : null}
              </div>
              <label>
                Local da obra
                <input className="bo-input" onChange={(event) => updateHeader("projectLocation", event.target.value)} value={draft.projectLocation} />
              </label>
              <label>
                Data
                <input {...errorProps("quoteDate")} className="bo-input" onChange={(event) => updateHeader("quoteDate", event.target.value)} type="date" value={draft.quoteDate} />
                <FormFieldError id="quoteDate-error" message={fieldErrors.quoteDate} />
              </label>
              <label className="bo-field-wide">
                Descrição
                <textarea {...errorProps("description")} className="bo-input bo-textarea" onChange={(event) => updateHeader("description", event.target.value)} rows={2} value={draft.description} />
                <FormFieldError id="description-error" message={fieldErrors.description} />
              </label>
              <label>
                Área
                <input {...errorProps("area")} className="bo-input" inputMode="decimal" onChange={(event) => updateArea(event.target.value)} placeholder="ex. 600" value={draft.area} />
                <FormFieldError id="area-error" message={fieldErrors.area} />
              </label>
              <label>
                Unidade
                <input {...errorProps("areaUnit")} className="bo-input" onChange={(event) => updateHeader("areaUnit", event.target.value)} value={draft.areaUnit} />
                <FormFieldError id="areaUnit-error" message={fieldErrors.areaUnit} />
              </label>
              <label>
                Preço/hora (CHF)
                <input {...errorProps("hourlyRate")} className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("hourlyRate", event.target.value)} value={draft.hourlyRate} />
                <FormFieldError id="hourlyRate-error" message={fieldErrors.hourlyRate} />
              </label>
              <label>
                Margem desejada (%)
                <input {...errorProps("desiredMargin")} className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("desiredMargin", decimalInputToRate(event.target.value))} value={rateToDecimalInput(draft.desiredMargin)} />
                <FormFieldError id="desiredMargin-error" message={fieldErrors.desiredMargin} />
              </label>
              <label>
                Desconto comercial (%)
                <input {...errorProps("commercialDiscount")} className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("commercialDiscount", decimalInputToRate(event.target.value))} value={rateToDecimalInput(draft.commercialDiscount)} />
                <FormFieldError id="commercialDiscount-error" message={fieldErrors.commercialDiscount} />
              </label>
              <label>
                Skonto (%)
                <input {...errorProps("skonto")} className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("skonto", decimalInputToRate(event.target.value))} value={rateToDecimalInput(draft.skonto)} />
                <FormFieldError id="skonto-error" message={fieldErrors.skonto} />
              </label>
              <label>
                Dedução fixa (CHF)
                <input {...errorProps("fixedDeduction")} className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("fixedDeduction", event.target.value)} value={draft.fixedDeduction} />
                <FormFieldError id="fixedDeduction-error" message={fieldErrors.fixedDeduction} />
              </label>
            </div>
          </section>

          <section className="bo-card bo-section" aria-labelledby="materials-heading" id="quote-materials">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">2 · Materiais</p>
                <h2 id="materials-heading">Materiais</h2>
              </div>
              <button className="bo-button bo-button-secondary" onClick={addMaterial} type="button"><BackofficeIcon name="plus" size={15} /> Adicionar material</button>
            </div>
            <p className="bo-section-help">O preço sugerido usa o valor com desconto do catálogo. Os campos da linha são overrides apenas deste orçamento.</p>
            {draft.materials.length === 0 ? (
              <div className="bo-inline-empty"><strong>Ainda não adicionou materiais.</strong><span>Use “Adicionar material” para pesquisar no catálogo.</span></div>
            ) : (
              <div className="bo-line-list">
                {draft.materials.map((line, index) => {
                  const lineResult = calculation.materials.lines[index];
                  const search = materialSearch[line.id] ?? line.materialNameSnapshot;
                  const normalizedSearch = normalizedMaterialSearch(search);
                  const options = materials
                    .filter((material) => {
                      if (!material.is_active && material.id !== line.materialId) return false;
                      if (!normalizedSearch) return true;
                      return [material.name, material.variant, material.package_label, material.brand]
                        .filter(Boolean)
                        .some((value) => value?.toLocaleLowerCase("pt-PT").includes(normalizedSearch));
                    })
                    .slice(0, 8);
                  const hasExactCatalogMatch = materials.some((material) =>
                    material.is_active &&
                    [material.name, materialLabel(material)].some(
                      (value) => normalizedMaterialSearch(value) === normalizedSearch,
                    ),
                  );
                  const isFreeMaterial = Boolean(line.materialNameSnapshot.trim() && !line.materialId);
                  const knownUnit = knownMaterialUnit(line.unit);
                  const isCustomUnit = customUnitRows[line.id] ?? Boolean(line.unit && !knownUnit);
                  const unitSelectValue = isCustomUnit ? CUSTOM_UNIT_VALUE : knownUnit ?? "";

                  return (
                    <article className="bo-line-card" key={line.id}>
                      <div className="bo-line-card-heading">
                        <strong>Linha {index + 1}</strong>
                        <button className="bo-button bo-button-remove" onClick={() => {
                          const populated = Boolean(line.materialNameSnapshot || line.consumptionOrQuantity || line.unitPrice);
                          if (populated) setPendingRemoval({ title: "Remover este material?", description: "Os dados desta linha serão perdidos.", remove: () => removeMaterial(line.id) });
                          else removeMaterial(line.id);
                        }} type="button">Remover</button>
                      </div>
                      <div className="bo-line-grid bo-material-line-grid">
                        <div className="bo-field bo-field-wide bo-combobox">
                          <label htmlFor={`material-${line.id}`}>Material</label>
                          <input
                            aria-autocomplete="list"
                            aria-controls={`material-options-${line.id}`}
                            aria-expanded={activeMaterialRow === line.id && options.length > 0}
                            aria-invalid={Boolean(fieldErrors[`materials.${index}.materialNameSnapshot`])}
                            className="bo-input"
                            id={`material-${line.id}`}
                            onBlur={() => window.setTimeout(() => setActiveMaterialRow(null), 120)}
                            onChange={(event) => {
                              const value = event.target.value;
                              setMaterialSearch((current) => ({ ...current, [line.id]: value }));
                              setActiveMaterialRow(line.id);
                              setMaterialActiveIndex(0);
                              if (!value) {
                                patchMaterial(line.id, {
                                  materialId: null,
                                  materialNameSnapshot: "",
                                  variantSnapshot: "",
                                  packageSnapshot: "",
                                  calculationType: "per_m2",
                                  consumptionOrQuantity: "",
                                  unit: "",
                                  unitPrice: "",
                                  areaFactor: "0",
                                  areaFactorOverridden: false,
                                  notes: "",
                                });
                                setCustomUnitRows((current) => {
                                  if (!current[line.id]) return current;
                                  const next = { ...current };
                                  delete next[line.id];
                                  return next;
                                });
                              } else {
                                patchMaterial(line.id, materialNameOverride(value));
                              }
                            }}
                            onFocus={() => {
                              setActiveMaterialRow(line.id);
                              setMaterialActiveIndex(0);
                              setMaterialSearch((current) => ({ ...current, [line.id]: current[line.id] ?? line.materialNameSnapshot }));
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") setActiveMaterialRow(null);
                              if (event.key === "ArrowDown") {
                                event.preventDefault();
                                setMaterialActiveIndex((active) => Math.min(active + 1, Math.max(options.length - 1, 0)));
                              }
                              if (event.key === "ArrowUp") {
                                event.preventDefault();
                                setMaterialActiveIndex((active) => Math.max(active - 1, 0));
                              }
                              if (event.key === "Enter" && activeMaterialRow === line.id && options[materialActiveIndex]) {
                                event.preventDefault();
                                selectMaterial(line, options[materialActiveIndex]);
                              }
                            }}
                            placeholder="Pesquisar material…"
                            role="combobox"
                            value={search}
                          />
                          <FormFieldError id={`materials-${index}-materialNameSnapshot-error`} message={fieldErrors[`materials.${index}.materialNameSnapshot`]} />
                          {activeMaterialRow === line.id ? (
                            <div className="bo-combobox-options" id={`material-options-${line.id}`} role="listbox">
                              {options.length ? options.map((material, optionIndex) => (
                                <button
                                  className={`bo-combobox-option${optionIndex === materialActiveIndex ? " is-active" : ""}`}
                                  key={material.id}
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() => selectMaterial(line, material)}
                                  role="option"
                                  aria-selected={material.id === line.materialId}
                                  type="button"
                                >
                                  <strong>{material.name}{material.variant ? ` · ${material.variant}` : ""}</strong>
                                  <small>
                                    {material.package_label ?? "Sem embalagem"} · {material.consumption ? `${material.consumption} ${material.consumption_unit ?? ""}` : "Consumo manual"} · {formatMoney(materialSuggestedPrice(material))}/{material.unit}
                                  </small>
                                </button>
                              )) : <div className="bo-combobox-empty"><p>Nenhum material encontrado.</p><Link href="/backoffice/materiais">Gerir materiais</Link></div>}
                            </div>
                          ) : null}
                          {isFreeMaterial ? (
                            <div className="bo-material-free-state">
                              <div>
                                <span className="bo-status is-neutral">Material livre</span>
                                <small>{hasExactCatalogMatch ? "Pode continuar sem o adicionar ao catálogo." : "Material não registado no catálogo."}</small>
                              </div>
                              {!hasExactCatalogMatch ? (
                                <button className="bo-link-button" onClick={() => openQuickMaterial(line)} type="button">
                                  + Guardar no catálogo
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        <label>
                          Etapa
                          <input className="bo-input" onChange={(event) => patchMaterial(line.id, { stage: event.target.value })} value={line.stage} />
                        </label>
                        <label>
                          Tipo
                          <select className="bo-input" onChange={(event) => {
                            const calculationType = event.target.value as QuoteMaterialDraft["calculationType"];
                            patchMaterial(line.id, {
                              calculationType,
                              areaFactor: calculationType === "per_m2" ? draft.area || "0" : "1",
                              areaFactorOverridden: false,
                            });
                          }} value={line.calculationType}>
                            <option value="per_m2">Por m²</option>
                            <option value="fixed">Fixo / manual</option>
                          </select>
                        </label>
                        <label>
                          Consumo / quantidade
                          <input {...errorProps(`materials.${index}.consumptionOrQuantity`)} className="bo-input" inputMode="decimal" onChange={(event) => patchMaterial(line.id, { consumptionOrQuantity: event.target.value })} value={line.consumptionOrQuantity} />
                          <FormFieldError id={`materials-${index}-consumptionOrQuantity-error`} message={fieldErrors[`materials.${index}.consumptionOrQuantity`]} />
                        </label>
                        <label>
                          Unidade (opcional)
                          <select className="bo-input" onChange={(event) => updateMaterialUnit(line.id, event.target.value)} value={unitSelectValue}>
                            <option value="">Sem unidade</option>
                            {QUOTE_MATERIAL_UNIT_OPTIONS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                            <option value={CUSTOM_UNIT_VALUE}>Outra…</option>
                          </select>
                          {isCustomUnit ? (
                            <input
                              aria-label="Unidade personalizada"
                              className="bo-input"
                              onChange={(event) => updateCustomMaterialUnit(line.id, event.target.value)}
                              placeholder="Ex. placa"
                              value={line.unit}
                            />
                          ) : null}
                          <small className="bo-field-note">Identifica a unidade usada no preço; não altera o cálculo.</small>
                        </label>
                        <label>
                          Preço unitário (CHF)
                          <input {...errorProps(`materials.${index}.unitPrice`)} className="bo-input" inputMode="decimal" onChange={(event) => patchMaterial(line.id, { unitPrice: event.target.value })} value={line.unitPrice} />
                          <FormFieldError id={`materials-${index}-unitPrice-error`} message={fieldErrors[`materials.${index}.unitPrice`]} />
                        </label>
                        <label>
                          Área / fator
                          <input {...errorProps(`materials.${index}.areaFactor`)} className={`bo-input${line.areaFactorOverridden ? " is-overridden" : ""}`} inputMode="decimal" onChange={(event) => patchMaterial(line.id, { areaFactor: event.target.value, areaFactorOverridden: true })} value={line.areaFactor} />
                          <small className="bo-field-note">{line.areaFactorOverridden ? "Valor ajustado apenas para este material." : "Por defeito utiliza a área da obra. Pode ajustar este valor apenas para este material."}</small>
                          <FormFieldError id={`materials-${index}-areaFactor-error`} message={fieldErrors[`materials.${index}.areaFactor`]} />
                        </label>
                        <label className="bo-field-wide">
                          Notas
                          <textarea className="bo-input bo-textarea" onChange={(event) => patchMaterial(line.id, { notes: event.target.value })} rows={2} value={line.notes} />
                        </label>
                        <div className="bo-line-total">
                          <span>Custo calculado</span>
                          <strong>{formatMoney(lineResult?.costTotal)}</strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <div className="bo-section-total"><span>Total materiais</span><strong>{formatMoney(calculation.materials.total)}</strong></div>
          </section>

          <section className="bo-card bo-section" aria-labelledby="labor-heading" id="quote-labor">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">3 · Mão de obra</p>
                <h2 id="labor-heading">Mão de obra</h2>
              </div>
              <button className="bo-button bo-button-secondary" onClick={addLabor} type="button"><BackofficeIcon name="plus" size={15} /> Adicionar linha</button>
            </div>
            {draft.labor.length === 0 ? <div className="bo-inline-empty"><strong>Ainda não adicionou mão de obra.</strong><span>Adicione uma linha quando esta obra incluir trabalho interno.</span></div> : null}
            {draft.labor.map((line, index) => {
              const lineResult = calculation.labor.lines[index];
              return (
                <article className="bo-line-card" key={line.id}>
                  <div className="bo-line-card-heading"><strong>Linha {index + 1}</strong><button className="bo-button bo-button-remove" onClick={() => {
                    const populated = Boolean(line.label || line.people || line.workHoursPerPerson || line.travelHoursPerPerson);
                    if (populated) setPendingRemoval({ title: "Remover esta linha de mão de obra?", description: "Os dados desta linha serão perdidos.", remove: () => removeLabor(line.id) });
                    else removeLabor(line.id);
                  }} type="button">Remover</button></div>
                  <div className="bo-line-grid">
                    <label className="bo-field-wide">Descrição<input {...errorProps(`labor.${index}.label`)} className="bo-input" onChange={(event) => { patchLabor(line.id, { label: event.target.value }); clearFieldError(`labor.${index}.label`); }} value={line.label} /><FormFieldError id={`labor-${index}-label-error`} message={fieldErrors[`labor.${index}.label`]} /></label>
                    <label>Pessoas<input {...errorProps(`labor.${index}.people`)} className="bo-input" inputMode="decimal" onChange={(event) => { patchLabor(line.id, { people: event.target.value }); clearFieldError(`labor.${index}.people`); }} value={line.people} /><FormFieldError id={`labor-${index}-people-error`} message={fieldErrors[`labor.${index}.people`]} /></label>
                    <label>Horas trabalho / pessoa<input {...errorProps(`labor.${index}.workHoursPerPerson`)} className="bo-input" inputMode="decimal" onChange={(event) => { patchLabor(line.id, { workHoursPerPerson: event.target.value }); clearFieldError(`labor.${index}.workHoursPerPerson`); }} value={line.workHoursPerPerson} /><FormFieldError id={`labor-${index}-workHoursPerPerson-error`} message={fieldErrors[`labor.${index}.workHoursPerPerson`]} /></label>
                    <label>Horas deslocação / pessoa<input {...errorProps(`labor.${index}.travelHoursPerPerson`)} className="bo-input" inputMode="decimal" onChange={(event) => { patchLabor(line.id, { travelHoursPerPerson: event.target.value }); clearFieldError(`labor.${index}.travelHoursPerPerson`); }} value={line.travelHoursPerPerson} /><FormFieldError id={`labor-${index}-travelHoursPerPerson-error`} message={fieldErrors[`labor.${index}.travelHoursPerPerson`]} /></label>
                    <label>Nota<input className="bo-input" onChange={(event) => patchLabor(line.id, { note: event.target.value })} value={line.note} /></label>
                    <div className="bo-readonly-metrics"><span>Horas totais</span><strong>{formatNumber(lineResult?.totalHours)}</strong></div>
                    <div className="bo-readonly-metrics"><span>Custo</span><strong>{formatMoney(lineResult?.costTotal)}</strong></div>
                  </div>
                </article>
              );
            })}
            <div className="bo-section-total"><span>Total mão de obra · {formatNumber(calculation.labor.totalHours)} h</span><strong>{formatMoney(calculation.labor.total)}</strong></div>
          </section>

          <SimpleLinesSection
            title="4 · Subempreitadas"
            headingId="subcontracts-heading"
            empty="Sem subempreitadas neste orçamento."
            lines={draft.subcontracts}
            lineTotals={calculation.subcontracts.lineTotals}
            total={calculation.subcontracts.total}
            add={() => addSimpleLine("subcontracts")}
            remove={(id) => removeSimpleLine("subcontracts", id)}
            patch={(id, patch) => patchSimpleLine("subcontracts", id, patch)}
            group="subcontracts"
            fieldErrors={fieldErrors}
            clearFieldError={clearFieldError}
            confirmRemove={(line, remove) => setPendingRemoval({ title: "Remover esta subempreitada?", description: "Os dados desta linha serão perdidos.", remove })}
          />

          <SimpleLinesSection
            title="5 · Viatura / equipamento"
            headingId="equipment-heading"
            empty="Sem viaturas ou equipamento neste orçamento."
            lines={draft.equipment}
            lineTotals={calculation.equipment.lineTotals}
            total={calculation.equipment.total}
            add={() => addSimpleLine("equipment")}
            remove={(id) => removeSimpleLine("equipment", id)}
            patch={(id, patch) => patchSimpleLine("equipment", id, patch)}
            group="equipment"
            fieldErrors={fieldErrors}
            clearFieldError={clearFieldError}
            confirmRemove={(line, remove) => setPendingRemoval({ title: "Remover esta viatura ou equipamento?", description: "Os dados desta linha serão perdidos.", remove })}
          />

          <section className="bo-card bo-section" aria-labelledby="surcharges-heading" id="quote-surcharges">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">6 · Acréscimos</p>
                <h2 id="surcharges-heading">Acréscimos</h2>
              </div>
              <button className="bo-button bo-button-secondary" onClick={addSurcharge} type="button"><BackofficeIcon name="plus" size={15} /> Adicionar acréscimo</button>
            </div>
            <p className="bo-section-help">As linhas são aplicadas sequencialmente. A base “custos diretos + anteriores” inclui os acréscimos anteriores.</p>
            {draft.surcharges.length === 0 ? <div className="bo-inline-empty"><strong>Sem acréscimos neste orçamento.</strong><span>Adicione apenas quando forem necessários para esta obra.</span></div> : null}
            <div className="bo-surcharge-list">
              {draft.surcharges.map((line, index) => {
                const result = calculation.surcharges.lines[index];
                return (
                  <article className="bo-surcharge-row" key={line.id}>
                    <label>Nome<input {...errorProps(`surcharges.${index}.name`)} className="bo-input" onChange={(event) => { patchSurcharge(line.id, { name: event.target.value }); clearFieldError(`surcharges.${index}.name`); }} value={line.name} /><FormFieldError id={`surcharges-${index}-name-error`} message={fieldErrors[`surcharges.${index}.name`]} /></label>
                    <label>Base<select className="bo-input" onChange={(event) => patchSurcharge(line.id, { baseType: event.target.value as QuoteSurchargeDraft["baseType"] })} value={line.baseType}>{Object.entries(surchargeBaseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                    <label>Taxa (%)<input {...errorProps(`surcharges.${index}.rate`)} className="bo-input" inputMode="decimal" onChange={(event) => { patchSurcharge(line.id, { rate: decimalInputToRate(event.target.value) }); clearFieldError(`surcharges.${index}.rate`); }} value={rateToDecimalInput(line.rate)} /><FormFieldError id={`surcharges-${index}-rate-error`} message={fieldErrors[`surcharges.${index}.rate`]} /></label>
                    <div className="bo-readonly-metrics"><span>Base calculada</span><strong>{formatMoney(result?.baseAmount)}</strong></div>
                    <div className="bo-readonly-metrics"><span>Valor do acréscimo</span><strong>{formatMoney(result?.amount)}</strong></div>
                    <button className="bo-button bo-button-remove bo-surcharge-remove" onClick={() => {
                      const populated = Boolean(line.name || line.rate);
                      if (populated) setPendingRemoval({ title: "Remover este acréscimo?", description: "Os dados desta linha serão perdidos.", remove: () => removeSurcharge(line.id) });
                      else removeSurcharge(line.id);
                    }} type="button">Remover</button>
                    {line.baseType === "direct_costs_plus_previous" ? <small className="bo-surcharge-helper">Inclui os acréscimos das linhas anteriores.</small> : null}
                  </article>
                );
              })}
            </div>
            <div className="bo-section-total"><span>Total acréscimos</span><strong>{formatMoney(calculation.surcharges.total)}</strong></div>
          </section>

          <section className="bo-card bo-section bo-price-section" aria-labelledby="price-heading" id="quote-price">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">7 · Preço / margem</p>
                <h2 id="price-heading">Preço e margem</h2>
              </div>
            </div>
            <div className="bo-form-grid">
              <label>
                Preço recomendado (CHF)
                <output className="bo-output bo-output-metric">{formatMoney(calculation.recommendedGross)}</output>
              </label>
              <label>
                Preço manual (CHF)
                <input {...errorProps("manualGross")} className={`bo-input${draft.manualGross.trim() ? " is-overridden" : ""}`} inputMode="decimal" onChange={(event) => updateHeader("manualGross", event.target.value)} placeholder="Opcional" value={draft.manualGross} />
                {draft.manualGross.trim() ? <small className="bo-field-note bo-manual-active">Preço manual ativo</small> : null}
                <FormFieldError id="manualGross-error" message={fieldErrors.manualGross} />
              </label>
              <label>
                Preço utilizado (CHF)
                <output className="bo-output bo-output-metric is-primary">{formatMoney(calculation.grossUsed)}</output>
              </label>
              <label>
                Margem real
                <output className="bo-output bo-output-metric is-primary">{formatPercent(calculation.realMargin)}</output>
              </label>
            </div>
          </section>

          <section className="bo-card bo-section bo-inline-summary" aria-labelledby="summary-heading" id="quote-summary">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">8 · Resumo</p>
                <h2 id="summary-heading">Resumo do orçamento</h2>
              </div>
            </div>
            <SummaryMetrics calculation={calculation} manualGross={draft.manualGross} />
            {warningItems.length > 0 ? (
              <div className="bo-warning-list" role="status">
                {warningItems.map((warning) => <WarningItem key={`${warning.code}-${warning.field ?? ""}`} warning={warning} />)}
              </div>
            ) : null}
            {hasLoss ? <p className="bo-warning bo-warning-error">Este orçamento apresenta prejuízo com os valores atuais.</p> : null}
            {!hasLoss && belowDesiredMargin ? <p className="bo-warning">A margem real está abaixo da margem pretendida.</p> : null}
          </section>
        </div>

        <aside className="bo-quote-summary" aria-label="Resumo financeiro">
          <div className="bo-summary-header">
            <p className="bo-eyebrow">Resumo financeiro</p>
            <h2>{draft.quoteNumber ?? "Novo orçamento"}</h2>
          </div>
          <SummaryMetrics calculation={calculation} compact manualGross={draft.manualGross} />
          <button className="bo-button bo-button-primary bo-summary-save" disabled={isPending} onClick={save} type="button">
            <BackofficeIcon name="save" size={16} /> {isPending ? "A guardar…" : "Guardar orçamento"}
          </button>
        </aside>
      </div>
      <div className="bo-mobile-save-bar">
        <div><span>{draft.quoteNumber ?? "Novo orçamento"}</span><strong>{formatMoney(calculation.netValue)}</strong></div>
        <button className="bo-button bo-button-primary" disabled={isPending} onClick={save} type="button">
          <BackofficeIcon name="save" size={16} /> {isPending ? "A guardar…" : "Guardar"}
        </button>
      </div>
      {quickMaterialRowId && quickMaterialForm ? (
        <QuickMaterialDialog
          errors={quickMaterialErrors}
          form={quickMaterialForm}
          onCancel={closeQuickMaterial}
          onChange={updateQuickMaterialField}
          onSubmit={createQuickMaterial}
          pending={isPending}
        />
      ) : null}
      <ConfirmDialog
        confirmLabel="Sair sem guardar"
        description="Se sair agora, essas alterações serão perdidas."
        onCancel={() => setPendingNavigation(null)}
        onConfirm={() => {
          if (!pendingNavigation) return;
          setSavedSnapshot(JSON.stringify(draft));
          router.push(pendingNavigation);
          setPendingNavigation(null);
        }}
        open={Boolean(pendingNavigation)}
        title="Tem alterações por guardar"
      />
      <ConfirmDialog
        confirmLabel="Remover"
        description={pendingRemoval?.description ?? ""}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => {
          pendingRemoval?.remove();
          setPendingRemoval(null);
        }}
        open={Boolean(pendingRemoval)}
        title={pendingRemoval?.title ?? "Remover linha?"}
      />
    </div>
  );
}

function SimpleLinesSection({
  title,
  headingId,
  empty,
  lines,
  lineTotals,
  total,
  add,
  remove,
  patch,
  group,
  fieldErrors,
  clearFieldError,
  confirmRemove,
}: {
  title: string;
  headingId: string;
  empty: string;
  lines: QuoteLineDraft[];
  lineTotals: string[];
  total: string;
  add: () => void;
  remove: (id: string) => void;
  patch: (id: string, patch: Partial<QuoteLineDraft>) => void;
  group: "subcontracts" | "equipment";
  fieldErrors: FieldErrors;
  clearFieldError: (field: string) => void;
  confirmRemove: (line: QuoteLineDraft, remove: () => void) => void;
}) {
  return (
    <section className="bo-card bo-section" aria-labelledby={headingId} id={`quote-${group}`}>
      <div className="bo-section-heading">
        <div><p className="bo-eyebrow">{title}</p><h2 id={headingId}>{title.slice(4)}</h2></div>
        <button className="bo-button bo-button-secondary" onClick={add} type="button"><BackofficeIcon name="plus" size={15} /> Adicionar linha</button>
      </div>
      {lines.length === 0 ? <div className="bo-inline-empty"><strong>{empty}</strong><span>Adicione uma linha apenas quando for necessária.</span></div> : null}
      {lines.map((line, index) => (
        <article className="bo-line-card" key={line.id}>
          <div className="bo-line-card-heading"><strong>Linha {index + 1}</strong><button className="bo-button bo-button-remove" onClick={() => {
            const populated = Boolean(line.description || line.quantity || line.unitPrice || line.note);
            if (populated) confirmRemove(line, () => remove(line.id));
            else remove(line.id);
          }} type="button">Remover</button></div>
          <div className="bo-line-grid">
            <label className="bo-field-wide">Descrição<input aria-describedby={fieldErrors[`${group}.${index}.description`] ? `${group}-${index}-description-error` : undefined} aria-invalid={Boolean(fieldErrors[`${group}.${index}.description`])} className="bo-input" onChange={(event) => { patch(line.id, { description: event.target.value }); clearFieldError(`${group}.${index}.description`); }} value={line.description} /><FormFieldError id={`${group}-${index}-description-error`} message={fieldErrors[`${group}.${index}.description`]} /></label>
            <label>Quantidade<input aria-describedby={fieldErrors[`${group}.${index}.quantity`] ? `${group}-${index}-quantity-error` : undefined} aria-invalid={Boolean(fieldErrors[`${group}.${index}.quantity`])} className="bo-input" inputMode="decimal" onChange={(event) => { patch(line.id, { quantity: event.target.value }); clearFieldError(`${group}.${index}.quantity`); }} value={line.quantity} /><FormFieldError id={`${group}-${index}-quantity-error`} message={fieldErrors[`${group}.${index}.quantity`]} /></label>
            <label>Unidade<input className="bo-input" onChange={(event) => patch(line.id, { unit: event.target.value })} value={line.unit} /></label>
            <label>Preço unitário (CHF)<input aria-describedby={fieldErrors[`${group}.${index}.unitPrice`] ? `${group}-${index}-unitPrice-error` : undefined} aria-invalid={Boolean(fieldErrors[`${group}.${index}.unitPrice`])} className="bo-input" inputMode="decimal" onChange={(event) => { patch(line.id, { unitPrice: event.target.value }); clearFieldError(`${group}.${index}.unitPrice`); }} value={line.unitPrice} /><FormFieldError id={`${group}-${index}-unitPrice-error`} message={fieldErrors[`${group}.${index}.unitPrice`]} /></label>
            <label>Nota<input className="bo-input" onChange={(event) => patch(line.id, { note: event.target.value })} value={line.note} /></label>
            <div className="bo-readonly-metrics"><span>Total</span><strong>{formatMoney(lineTotals[index])}</strong></div>
          </div>
        </article>
      ))}
      <div className="bo-section-total"><span>Total</span><strong>{formatMoney(total)}</strong></div>
    </section>
  );
}

function SummaryMetrics({
  calculation,
  compact = false,
  manualGross,
}: {
  calculation: ReturnType<typeof calculateQuote>;
  compact?: boolean;
  manualGross: string;
}) {
  const groups: Array<{ title: string; metrics: Array<[string, string, string?]> }> = [
    { title: "Custos", metrics: [
      ["Materiais", formatMoney(calculation.materials.total)],
      ["Mão de obra", formatMoney(calculation.labor.total)],
      ["Subempreitadas", formatMoney(calculation.subcontracts.total)],
      ["Viatura / equipamento", formatMoney(calculation.equipment.total)],
      ["Custos diretos", formatMoney(calculation.directCosts)],
      ["Acréscimos", formatMoney(calculation.surcharges.total)],
      ["Custo total", formatMoney(calculation.totalCost), "is-emphasis"],
    ] },
    { title: "Venda", metrics: [
      ["Preço recomendado", formatMoney(calculation.recommendedGross)],
      ["Preço manual", parseLocaleDecimal(manualGross) ? formatMoney(manualGross) : "—"],
      ["Preço utilizado", formatMoney(calculation.grossUsed), "is-emphasis"],
      ["Valor líquido", formatMoney(calculation.netValue), "is-emphasis"],
    ] },
    { title: "Rentabilidade", metrics: [
      ["Lucro", formatMoney(calculation.profit), "is-emphasis"],
      ["Margem real", formatPercent(calculation.realMargin), "is-emphasis"],
    ] },
    { title: "Indicadores", metrics: [
      ["Horas", `${formatNumber(calculation.totalHours)} h`],
      ["Valor líquido / m²", formatMoney(calculation.netPerM2)],
      ["Valor líquido / hora", formatMoney(calculation.netPerHour)],
    ] },
  ];

  return (
    <div className={`bo-summary-groups${compact ? " is-compact" : ""}`}>
      {groups.map((group) => (
        <section className={`bo-summary-group is-${group.title.toLocaleLowerCase("pt-PT").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "-")}`} key={group.title}>
          <h3>{group.title}</h3>
          <dl className="bo-summary-metrics">
            {group.metrics.map(([label, value, className]) => (
              <div className={className} key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function QuickMaterialDialog({
  errors,
  form,
  onCancel,
  onChange,
  onSubmit,
  pending,
}: {
  errors: FieldErrors;
  form: QuickMaterialForm;
  onCancel: () => void;
  onChange: (field: keyof QuickMaterialForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
}) {
  return (
    <div className="bo-dialog-backdrop" onMouseDown={onCancel}>
      <form
        aria-describedby="quick-material-description"
        aria-labelledby="quick-material-title"
        aria-modal="true"
        className="bo-dialog bo-dialog-form"
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
        onMouseDown={(event) => event.stopPropagation()}
        noValidate
        onSubmit={onSubmit}
        role="dialog"
      >
        <p className="bo-eyebrow">Catálogo</p>
        <h2 id="quick-material-title">Adicionar ao catálogo</h2>
        <p id="quick-material-description">Guarde este material para o reutilizar em futuros orçamentos.</p>
        <div className="bo-dialog-form-grid">
          <QuickMaterialField
            error={errors.brand}
            field="brand"
            form={form}
            label="Marca *"
            onChange={onChange}
            required
          />
          <QuickMaterialField
            error={errors.name}
            field="name"
            form={form}
            label="Nome *"
            onChange={onChange}
            readOnly
            required
          />
          <QuickMaterialField
            error={errors.variant}
            field="variant"
            form={form}
            label="Variante"
            onChange={onChange}
          />
          <QuickMaterialField
            error={errors.packageLabel}
            field="packageLabel"
            form={form}
            label="Embalagem / descrição"
            onChange={onChange}
          />
          <label>
            Tipo de cálculo
            <select
              className="bo-input"
              name="calculationType"
              onChange={(event) => onChange("calculationType", event.target.value)}
              value={form.calculationType}
            >
              <option value="per_m2">Por m²</option>
              <option value="fixed">Fixo / manual</option>
            </select>
          </label>
          <QuickMaterialField
            decimal
            error={errors.consumption}
            field="consumption"
            form={form}
            label="Consumo de referência"
            onChange={onChange}
          />
          <QuickMaterialField
            error={errors.consumptionUnit}
            field="consumptionUnit"
            form={form}
            label="Unidade do consumo"
            onChange={onChange}
          />
          <QuickMaterialField
            error={errors.unit}
            field="unit"
            form={form}
            label="Unidade de cálculo *"
            onChange={onChange}
            required
          />
          <QuickMaterialField
            decimal
            error={errors.discountedUnitPrice}
            field="discountedUnitPrice"
            form={form}
            label="Preço sugerido / unidade"
            onChange={onChange}
          />
          <QuickMaterialField
            className="bo-field-wide bo-field-full"
            error={errors.notes}
            field="notes"
            form={form}
            label="Notas"
            onChange={onChange}
            textarea
          />
        </div>
        <div className="bo-dialog-actions">
          <button className="bo-button bo-button-secondary" onClick={onCancel} type="button">Cancelar</button>
          <button className="bo-button bo-button-primary" disabled={pending} type="submit">
            {pending ? "A guardar…" : "Guardar no catálogo"}
          </button>
        </div>
      </form>
    </div>
  );
}

function QuickMaterialField({
  className,
  decimal = false,
  error,
  field,
  form,
  label,
  onChange,
  readOnly = false,
  required = false,
  textarea = false,
}: {
  className?: string;
  decimal?: boolean;
  error?: string;
  field: keyof QuickMaterialForm;
  form: QuickMaterialForm;
  label: string;
  onChange: (field: keyof QuickMaterialForm, value: string) => void;
  readOnly?: boolean;
  required?: boolean;
  textarea?: boolean;
}) {
  const id = `quick-material-${field}`;
  const errorId = `${id}-error`;
  const inputProps = {
    "aria-describedby": error ? errorId : undefined,
    "aria-invalid": Boolean(error),
    className: "bo-input",
    name: field,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field, event.target.value),
    readOnly,
    required,
    value: form[field],
  };

  return (
    <label className={className} htmlFor={id}>
      {label}
      {textarea ? <textarea {...inputProps} id={id} rows={3} /> : <input {...inputProps} id={id} inputMode={decimal ? "decimal" : undefined} />}
      <FormFieldError id={errorId} message={error} />
    </label>
  );
}

function WarningItem({ warning }: { warning: CalculationWarning }) {
  return (
    <p className={`bo-warning bo-warning-${warning.severity}`}>
      {warning.message}
    </p>
  );
}
