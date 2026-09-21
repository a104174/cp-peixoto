import { describe, expect, it } from "vitest";

import {
  knownMaterialUnit,
  normalizeMaterialUnit,
  QUOTE_MATERIAL_UNIT_OPTIONS,
} from "../src/domain/quotes/material-units";
import {
  attachCatalogMaterial,
  materialNameOverride,
} from "../src/domain/quotes/material-catalog";

describe("unidades de materiais", () => {
  it("normaliza aliases conhecidos sem alterar o valor numérico", () => {
    expect(normalizeMaterialUnit("KG")).toBe("kg");
    expect(normalizeMaterialUnit("Kg")).toBe("kg");
    expect(normalizeMaterialUnit("m2")).toBe("m²");
    expect(knownMaterialUnit("unidade")).toBe("un.");
    expect(QUOTE_MATERIAL_UNIT_OPTIONS).toContain("embalagem");
  });

  it("preserva unidades personalizadas", () => {
    expect(normalizeMaterialUnit("placa")).toBe("placa");
    expect(knownMaterialUnit("placa")).toBeNull();
  });
});

describe("linhas de materiais", () => {
  it("desassocia um nome alterado sem apagar overrides da linha", () => {
    const selected = {
      materialId: "catalog-id",
      materialNameSnapshot: "Wecryl 171",
      consumptionOrQuantity: "0.5",
      unitPrice: "22.22",
      notes: "override",
    };
    const detached = { ...selected, ...materialNameOverride("Pedra") };

    expect(detached).toMatchObject({
      materialId: null,
      materialNameSnapshot: "Pedra",
      consumptionOrQuantity: "0.5",
      unitPrice: "22.22",
      notes: "override",
    });
  });

  it("associa o novo id sem substituir os valores da linha", () => {
    const line = {
      materialId: null,
      materialNameSnapshot: "Pedra",
      unitPrice: "20",
      consumptionOrQuantity: "10",
    };

    expect({ ...line, ...attachCatalogMaterial("new-id") }).toEqual({
      ...line,
      materialId: "new-id",
    });
  });
});
