"use client";

import {
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  createEmptyLaborDraft,
  createEmptyLineDraft,
  createEmptyMaterialDraft,
  newId,
} from "@/domain/quotes/defaults";
import {
  calculateQuote,
  type CalculationWarning,
} from "@/domain/quotes/calculations";
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
  saveQuoteAction,
} from "@/lib/backoffice/actions";
import type { ClientSummary, MaterialSummary } from "@/lib/backoffice/data";

type QuoteEditorProps = {
  initialDraft: QuoteDraft;
  clients: ClientSummary[];
  materials: MaterialSummary[];
};

const surchargeBaseLabels: Record<QuoteSurchargeDraft["baseType"], string> = {
  subcontracts: "Subempreitadas",
  materials: "Materiais",
  labor: "Mão de obra",
  equipment: "Equipamento",
  labor_plus_equipment: "Mão de obra + equipamento",
  direct_costs: "Custos diretos",
  direct_costs_plus_previous: "Custos diretos + anteriores",
};

function materialLabel(material: MaterialSummary): string {
  return [material.name, material.variant, material.package_label]
    .filter(Boolean)
    .join(" · ");
}

function materialSuggestedPrice(material: MaterialSummary): string {
  return material.discounted_unit_price ?? material.base_unit_price ?? "0";
}

function updateArray<T extends { id: string }>(
  rows: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
}

export function QuoteEditor({
  initialDraft,
  clients,
  materials,
}: QuoteEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [clientQuery, setClientQuery] = useState(() => {
    const client = clients.find((item) => item.id === initialDraft.clientId);
    return client?.name ?? "";
  });
  const [clientOptionsOpen, setClientOptionsOpen] = useState(false);
  const [materialSearch, setMaterialSearch] = useState<Record<string, string>>({});
  const [activeMaterialRow, setActiveMaterialRow] = useState<string | null>(null);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const calculation = useMemo(() => calculateQuote(draft), [draft]);

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
  }

  function selectClient(client: ClientSummary) {
    setDraft((current) => ({ ...current, clientId: client.id }));
    setClientQuery(client.name);
    setClientOptionsOpen(false);
  }

  function clearClient() {
    setDraft((current) => ({ ...current, clientId: null }));
    setClientQuery("");
    setClientOptionsOpen(false);
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
      unit: material.unit,
      unitPrice: materialSuggestedPrice(material),
      areaFactor: factor,
      areaFactorOverridden: false,
      notes: material.notes ?? "",
    });
    setMaterialSearch((current) => ({
      ...current,
      [row.id]: materialLabel(material),
    }));
    setActiveMaterialRow(null);
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
          name: "Novo acréscimo",
          baseType: "direct_costs",
          rate: "0",
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
    setFeedback("");
    startTransition(async () => {
      const result = await saveQuoteAction(draft);
      if (!result.success) {
        setFeedback(result.error ?? "Não foi possível guardar o orçamento.");
        return;
      }

      setFeedback(`Orçamento ${result.quoteNumber ?? ""} guardado.`);
      if (result.quoteId) {
        setDraft((current) => ({
          ...current,
          id: result.quoteId ?? current.id,
          quoteNumber: result.quoteNumber ?? current.quoteNumber,
        }));
        router.push(`/backoffice/orcamentos/${result.quoteId}`);
        router.refresh();
      }
    });
  }

  function createQuickClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      const result = await createClientAction(new FormData(form));
      if (!result.success) {
        setFeedback(result.error ?? "Não foi possível criar o cliente.");
        return;
      }

      const name = String(new FormData(form).get("name") ?? "");
      if (result.id) {
        setDraft((current) => ({ ...current, clientId: result.id ?? null }));
        setClientQuery(name);
      }
      setNewClientOpen(false);
      setFeedback("Cliente criado e associado ao orçamento.");
      form.reset();
      router.refresh();
    });
  }

  const warningItems = calculation.warnings.filter(
    (warning) => warning.severity !== "info",
  );

  return (
    <div className="bo-page bo-quote-page">
      <div className="bo-page-heading">
        <div>
          <p className="bo-eyebrow">Cálculo operacional</p>
          <h1>{draft.id ? `Editar ${draft.quoteNumber}` : "Novo orçamento"}</h1>
          <p className="bo-muted">
            Os totais são recalculados com precisão decimal e confirmados no servidor ao guardar.
          </p>
        </div>
        <div className="bo-heading-actions">
          <button className="bo-button bo-button-primary" disabled={isPending} onClick={save} type="button">
            {isPending ? "A guardar…" : "Guardar orçamento"}
          </button>
        </div>
      </div>

      {feedback ? (
        <p aria-live="polite" className="bo-form-feedback bo-global-feedback">{feedback}</p>
      ) : null}

      <div className="bo-quote-layout">
        <div className="bo-quote-main">
          <section className="bo-card bo-section" aria-labelledby="quote-project-heading">
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
                      if (!event.target.value) clearClient();
                    }}
                    onFocus={() => setClientOptionsOpen(true)}
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
                {clientOptionsOpen && filteredClients.length > 0 ? (
                  <div className="bo-combobox-options" id="quote-client-options" role="listbox">
                    {filteredClients.map((client) => (
                      <button
                        className="bo-combobox-option"
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
                    ))}
                  </div>
                ) : null}
                <button className="bo-inline-create" onClick={() => setNewClientOpen((open) => !open)} type="button">
                  {newClientOpen ? "Fechar novo cliente" : "+ Novo cliente"}
                </button>
                {newClientOpen ? (
                  <form className="bo-quick-form" onSubmit={createQuickClient}>
                    <label>Nome *<input className="bo-input" name="name" required /></label>
                    <label>Email<input className="bo-input" name="email" type="email" /></label>
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
                <input className="bo-input" onChange={(event) => updateHeader("quoteDate", event.target.value)} type="date" value={draft.quoteDate} />
              </label>
              <label className="bo-field-wide">
                Descrição
                <textarea className="bo-input bo-textarea" onChange={(event) => updateHeader("description", event.target.value)} rows={2} value={draft.description} />
              </label>
              <label>
                Área
                <input className="bo-input" inputMode="decimal" onChange={(event) => updateArea(event.target.value)} placeholder="ex. 600" value={draft.area} />
              </label>
              <label>
                Unidade
                <input className="bo-input" onChange={(event) => updateHeader("areaUnit", event.target.value)} value={draft.areaUnit} />
              </label>
              <label>
                Preço/hora (CHF)
                <input className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("hourlyRate", event.target.value)} value={draft.hourlyRate} />
              </label>
              <label>
                Margem desejada (%)
                <input className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("desiredMargin", decimalInputToRate(event.target.value))} value={rateToDecimalInput(draft.desiredMargin)} />
              </label>
              <label>
                Desconto comercial (%)
                <input className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("commercialDiscount", decimalInputToRate(event.target.value))} value={rateToDecimalInput(draft.commercialDiscount)} />
              </label>
              <label>
                Skonto (%)
                <input className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("skonto", decimalInputToRate(event.target.value))} value={rateToDecimalInput(draft.skonto)} />
              </label>
              <label>
                Dedução fixa (CHF)
                <input className="bo-input" inputMode="decimal" onChange={(event) => updateHeader("fixedDeduction", event.target.value)} value={draft.fixedDeduction} />
              </label>
            </div>
          </section>

          <section className="bo-card bo-section" aria-labelledby="materials-heading">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">2 · Materiais</p>
                <h2 id="materials-heading">Materiais</h2>
              </div>
              <button className="bo-button bo-button-secondary" onClick={addMaterial} type="button">+ Adicionar linha</button>
            </div>
            <p className="bo-section-help">O preço sugerido usa o valor com desconto do catálogo. Os campos da linha são overrides apenas deste orçamento.</p>
            {draft.materials.length === 0 ? (
              <div className="bo-inline-empty">Ainda não há materiais. Adicione uma linha para pesquisar o catálogo.</div>
            ) : (
              <div className="bo-line-list">
                {draft.materials.map((line, index) => {
                  const lineResult = calculation.materials.lines[index];
                  const search = materialSearch[line.id] ?? line.materialNameSnapshot;
                  const options = materials
                    .filter((material) => {
                      if (!material.is_active && material.id !== line.materialId) return false;
                      const query = search.trim().toLocaleLowerCase("pt-PT");
                      if (!query) return true;
                      return [material.name, material.variant, material.package_label, material.brand]
                        .filter(Boolean)
                        .some((value) => value?.toLocaleLowerCase("pt-PT").includes(query));
                    })
                    .slice(0, 8);

                  return (
                    <article className="bo-line-card" key={line.id}>
                      <div className="bo-line-card-heading">
                        <strong>Linha {index + 1}</strong>
                        <button className="bo-link-button bo-link-danger" onClick={() => removeMaterial(line.id)} type="button">Remover</button>
                      </div>
                      <div className="bo-line-grid bo-material-line-grid">
                        <div className="bo-field bo-field-wide bo-combobox">
                          <label htmlFor={`material-${line.id}`}>Material</label>
                          <input
                            aria-autocomplete="list"
                            aria-controls={`material-options-${line.id}`}
                            aria-expanded={activeMaterialRow === line.id && options.length > 0}
                            className="bo-input"
                            id={`material-${line.id}`}
                            onBlur={() => window.setTimeout(() => setActiveMaterialRow(null), 120)}
                            onChange={(event) => {
                              setMaterialSearch((current) => ({ ...current, [line.id]: event.target.value }));
                              setActiveMaterialRow(line.id);
                              if (!event.target.value) {
                                patchMaterial(line.id, {
                                  materialId: null,
                                  materialNameSnapshot: "",
                                  variantSnapshot: "",
                                  packageSnapshot: "",
                                  unitPrice: "0",
                                  consumptionOrQuantity: "0",
                                  notes: "",
                                });
                              }
                            }}
                            onFocus={() => {
                              setActiveMaterialRow(line.id);
                              setMaterialSearch((current) => ({ ...current, [line.id]: current[line.id] ?? line.materialNameSnapshot }));
                            }}
                            placeholder="Pesquisar material…"
                            role="combobox"
                            value={search}
                          />
                          {activeMaterialRow === line.id && options.length > 0 ? (
                            <div className="bo-combobox-options" id={`material-options-${line.id}`} role="listbox">
                              {options.map((material) => (
                                <button
                                  className="bo-combobox-option"
                                  key={material.id}
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() => selectMaterial(line, material)}
                                  role="option"
                                  aria-selected={material.id === line.materialId}
                                  type="button"
                                >
                                  <strong>{materialLabel(material)}</strong>
                                  <small>
                                    Consumo: {material.consumption ? `${material.consumption} ${material.consumption_unit ?? ""}` : "manual"} · Sugerido: {formatMoney(materialSuggestedPrice(material))}
                                  </small>
                                </button>
                              ))}
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
                          <input className="bo-input" inputMode="decimal" onChange={(event) => patchMaterial(line.id, { consumptionOrQuantity: event.target.value })} value={line.consumptionOrQuantity} />
                        </label>
                        <label>
                          Unidade
                          <input className="bo-input" onChange={(event) => patchMaterial(line.id, { unit: event.target.value })} value={line.unit} />
                        </label>
                        <label>
                          Preço unitário (CHF)
                          <input className="bo-input" inputMode="decimal" onChange={(event) => patchMaterial(line.id, { unitPrice: event.target.value })} value={line.unitPrice} />
                        </label>
                        <label>
                          Área / fator
                          <input className={`bo-input${line.areaFactorOverridden ? " is-overridden" : ""}`} inputMode="decimal" onChange={(event) => patchMaterial(line.id, { areaFactor: event.target.value, areaFactorOverridden: true })} value={line.areaFactor} />
                          {line.areaFactorOverridden ? <small className="bo-field-note">Override manual</small> : null}
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

          <section className="bo-card bo-section" aria-labelledby="labor-heading">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">3 · Mão de obra</p>
                <h2 id="labor-heading">Mão de obra</h2>
              </div>
              <button className="bo-button bo-button-secondary" onClick={addLabor} type="button">+ Adicionar linha</button>
            </div>
            {draft.labor.length === 0 ? <div className="bo-inline-empty">Adicione uma linha para registar trabalhadores e horas.</div> : null}
            {draft.labor.map((line, index) => {
              const lineResult = calculation.labor.lines[index];
              return (
                <article className="bo-line-card" key={line.id}>
                  <div className="bo-line-card-heading"><strong>Linha {index + 1}</strong><button className="bo-link-button bo-link-danger" onClick={() => removeLabor(line.id)} type="button">Remover</button></div>
                  <div className="bo-line-grid">
                    <label className="bo-field-wide">Descrição<input className="bo-input" onChange={(event) => patchLabor(line.id, { label: event.target.value })} value={line.label} /></label>
                    <label>Pessoas<input className="bo-input" inputMode="decimal" onChange={(event) => patchLabor(line.id, { people: event.target.value })} value={line.people} /></label>
                    <label>Horas trabalho / pessoa<input className="bo-input" inputMode="decimal" onChange={(event) => patchLabor(line.id, { workHoursPerPerson: event.target.value })} value={line.workHoursPerPerson} /></label>
                    <label>Horas deslocação / pessoa<input className="bo-input" inputMode="decimal" onChange={(event) => patchLabor(line.id, { travelHoursPerPerson: event.target.value })} value={line.travelHoursPerPerson} /></label>
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
            empty="Adicione subempreitadas quando existirem."
            lines={draft.subcontracts}
            lineTotals={calculation.subcontracts.lineTotals}
            total={calculation.subcontracts.total}
            add={() => addSimpleLine("subcontracts")}
            remove={(id) => removeSimpleLine("subcontracts", id)}
            patch={(id, patch) => patchSimpleLine("subcontracts", id, patch)}
          />

          <SimpleLinesSection
            title="5 · Viatura / equipamento"
            headingId="equipment-heading"
            empty="Adicione viaturas, equipamento ou outros custos unitários."
            lines={draft.equipment}
            lineTotals={calculation.equipment.lineTotals}
            total={calculation.equipment.total}
            add={() => addSimpleLine("equipment")}
            remove={(id) => removeSimpleLine("equipment", id)}
            patch={(id, patch) => patchSimpleLine("equipment", id, patch)}
          />

          <section className="bo-card bo-section" aria-labelledby="surcharges-heading">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">6 · Acréscimos</p>
                <h2 id="surcharges-heading">Acréscimos</h2>
              </div>
              <button className="bo-button bo-button-secondary" onClick={addSurcharge} type="button">+ Adicionar linha</button>
            </div>
            <p className="bo-section-help">As linhas são aplicadas sequencialmente. A base “custos diretos + anteriores” inclui os acréscimos anteriores.</p>
            <div className="bo-surcharge-list">
              {draft.surcharges.map((line, index) => {
                const result = calculation.surcharges.lines[index];
                return (
                  <article className="bo-surcharge-row" key={line.id}>
                    <label>Nome<input className="bo-input" onChange={(event) => patchSurcharge(line.id, { name: event.target.value })} value={line.name} /></label>
                    <label>Base<select className="bo-input" onChange={(event) => patchSurcharge(line.id, { baseType: event.target.value as QuoteSurchargeDraft["baseType"] })} value={line.baseType}>{Object.entries(surchargeBaseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                    <label>Taxa (%)<input className="bo-input" inputMode="decimal" onChange={(event) => patchSurcharge(line.id, { rate: decimalInputToRate(event.target.value) })} value={rateToDecimalInput(line.rate)} /></label>
                    <div className="bo-readonly-metrics"><span>Base</span><strong>{formatMoney(result?.baseAmount)}</strong></div>
                    <div className="bo-readonly-metrics"><span>Valor</span><strong>{formatMoney(result?.amount)}</strong></div>
                    <button className="bo-link-button bo-link-danger bo-surcharge-remove" onClick={() => removeSurcharge(line.id)} type="button">Remover</button>
                  </article>
                );
              })}
            </div>
            <div className="bo-section-total"><span>Total acréscimos</span><strong>{formatMoney(calculation.surcharges.total)}</strong></div>
          </section>

          <section className="bo-card bo-section" aria-labelledby="price-heading">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">7 · Preço / margem</p>
                <h2 id="price-heading">Preço e margem</h2>
              </div>
            </div>
            <div className="bo-form-grid">
              <label>
                Preço recomendado (CHF)
                <output className="bo-output">{formatMoney(calculation.recommendedGross)}</output>
              </label>
              <label>
                Preço manual (CHF)
                <input className={`bo-input${draft.manualGross.trim() ? " is-overridden" : ""}`} inputMode="decimal" onChange={(event) => updateHeader("manualGross", event.target.value)} placeholder="Opcional" value={draft.manualGross} />
                {draft.manualGross.trim() ? <small className="bo-field-note">Override ativo</small> : null}
              </label>
              <label>
                Preço utilizado (CHF)
                <output className="bo-output">{formatMoney(calculation.grossUsed)}</output>
              </label>
              <label>
                Margem real
                <output className="bo-output">{formatPercent(calculation.realMargin)}</output>
              </label>
            </div>
          </section>

          <section className="bo-card bo-section" aria-labelledby="summary-heading">
            <div className="bo-section-heading">
              <div>
                <p className="bo-eyebrow">8 · Resumo</p>
                <h2 id="summary-heading">Resumo do orçamento</h2>
              </div>
            </div>
            <SummaryMetrics calculation={calculation} />
            {warningItems.length > 0 ? (
              <div className="bo-warning-list" role="status">
                {warningItems.map((warning) => <WarningItem key={`${warning.code}-${warning.field ?? ""}`} warning={warning} />)}
              </div>
            ) : null}
          </section>
        </div>

        <aside className="bo-quote-summary bo-card" aria-label="Resumo financeiro">
          <p className="bo-eyebrow">Resumo financeiro</p>
          <h2>{draft.quoteNumber ?? "Novo orçamento"}</h2>
          <SummaryMetrics calculation={calculation} compact />
          <button className="bo-button bo-button-primary bo-summary-save" disabled={isPending} onClick={save} type="button">
            {isPending ? "A guardar…" : "Guardar orçamento"}
          </button>
        </aside>
      </div>
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
}) {
  return (
    <section className="bo-card bo-section" aria-labelledby={headingId}>
      <div className="bo-section-heading">
        <div><p className="bo-eyebrow">{title}</p><h2 id={headingId}>{title.slice(4)}</h2></div>
        <button className="bo-button bo-button-secondary" onClick={add} type="button">+ Adicionar linha</button>
      </div>
      {lines.length === 0 ? <div className="bo-inline-empty">{empty}</div> : null}
      {lines.map((line, index) => (
        <article className="bo-line-card" key={line.id}>
          <div className="bo-line-card-heading"><strong>Linha {index + 1}</strong><button className="bo-link-button bo-link-danger" onClick={() => remove(line.id)} type="button">Remover</button></div>
          <div className="bo-line-grid">
            <label className="bo-field-wide">Descrição<input className="bo-input" onChange={(event) => patch(line.id, { description: event.target.value })} value={line.description} /></label>
            <label>Quantidade<input className="bo-input" inputMode="decimal" onChange={(event) => patch(line.id, { quantity: event.target.value })} value={line.quantity} /></label>
            <label>Unidade<input className="bo-input" onChange={(event) => patch(line.id, { unit: event.target.value })} value={line.unit} /></label>
            <label>Preço unitário (CHF)<input className="bo-input" inputMode="decimal" onChange={(event) => patch(line.id, { unitPrice: event.target.value })} value={line.unitPrice} /></label>
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
}: {
  calculation: ReturnType<typeof calculateQuote>;
  compact?: boolean;
}) {
  const metrics = [
    ["Materiais", formatMoney(calculation.materials.total)],
    ["Mão de obra", formatMoney(calculation.labor.total)],
    ["Subempreitadas", formatMoney(calculation.subcontracts.total)],
    ["Equipamento", formatMoney(calculation.equipment.total)],
    ["Custos diretos", formatMoney(calculation.directCosts)],
    ["Acréscimos", formatMoney(calculation.surcharges.total)],
    ["Custo total", formatMoney(calculation.totalCost)],
    ["Preço recomendado", formatMoney(calculation.recommendedGross)],
    ["Preço utilizado", formatMoney(calculation.grossUsed)],
    ["Valor líquido", formatMoney(calculation.netValue)],
    ["Lucro", formatMoney(calculation.profit)],
    ["Margem real", formatPercent(calculation.realMargin)],
    ["Horas totais", `${formatNumber(calculation.totalHours)} h`],
    ["Valor líquido / m²", formatMoney(calculation.netPerM2)],
    ["Deduções fixas / m²", formatMoney(calculation.fixedDeductionPerM2)],
    ["Valor líquido / hora", formatMoney(calculation.netPerHour)],
  ];

  return (
    <dl className={`bo-summary-metrics${compact ? " is-compact" : ""}`}>
      {metrics.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function WarningItem({ warning }: { warning: CalculationWarning }) {
  return (
    <p className={`bo-warning bo-warning-${warning.severity}`}>
      {warning.message}
    </p>
  );
}
