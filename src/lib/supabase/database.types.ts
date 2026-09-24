export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  locality: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MaterialRow = {
  id: string;
  brand: string;
  name: string;
  consumption_per_m2: string | null;
  price_per_kg: string | null;
  price_per_container: string | null;
  variant: string | null;
  category: string | null;
  package_label: string | null;
  package_quantity: string | null;
  package_unit: string | null;
  calculation_type: "per_m2" | "fixed";
  consumption: string | null;
  consumption_unit: string | null;
  unit: string;
  base_unit_price: string | null;
  discounted_unit_price: string | null;
  base_package_price: string | null;
  discounted_package_price: string | null;
  discount_rate: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type QuoteRow = {
  id: string;
  quote_number: string;
  client_id: string | null;
  client_name_snapshot: string | null;
  client_email_snapshot: string | null;
  client_phone_snapshot: string | null;
  client_address_snapshot: string | null;
  project_location: string | null;
  quote_date: string;
  description: string | null;
  area: string | null;
  area_unit: string;
  hourly_rate: string | null;
  desired_margin: string | null;
  commercial_discount: string | null;
  fixed_deduction: string | null;
  client_pdf_work_description: string | null;
  materials_total: string;
  labor_total: string;
  subcontracts_total: string;
  equipment_total: string;
  direct_costs_total: string;
  surcharges_total: string;
  total_cost: string;
  recommended_gross: string;
  manual_gross: string | null;
  gross_used: string;
  net_value: string;
  profit: string;
  real_margin: string;
  total_hours: string;
  created_at: string;
  updated_at: string;
};

export type QuoteMaterialRow = {
  id: string;
  quote_id: string;
  material_id: string | null;
  position: number;
  stage: string | null;
  material_name_snapshot: string;
  variant_snapshot: string | null;
  package_snapshot: string | null;
  calculation_type: "per_m2" | "fixed";
  consumption_or_quantity: string;
  unit: string | null;
  unit_price: string;
  area_factor: string;
  cost_total: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteLaborRow = {
  id: string;
  quote_id: string;
  position: number;
  label: string;
  people: string;
  work_hours_per_person: string;
  travel_hours_per_person: string;
  total_hours: string;
  hourly_rate: string | null;
  cost_total: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteSubcontractRow = {
  id: string;
  quote_id: string;
  position: number;
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  total_amount: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteEquipmentRow = QuoteSubcontractRow;

export type QuoteSurchargeRow = {
  id: string;
  quote_id: string;
  position: number;
  name: string;
  base_type:
    | "subcontracts"
    | "materials"
    | "labor"
    | "equipment"
    | "labor_plus_equipment"
    | "direct_costs"
    | "direct_costs_plus_previous";
  rate: string;
  base_amount: string;
  amount: string;
  created_at: string;
  updated_at: string;
};

export type ClientInsert = {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  postal_code?: string | null;
  locality?: string | null;
  notes?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ClientUpdate = Partial<ClientInsert>;

export type MaterialInsert = {
  id?: string;
  brand?: string;
  name: string;
  consumption_per_m2?: string | null;
  price_per_kg?: string | null;
  price_per_container?: string | null;
  variant?: string | null;
  category?: string | null;
  package_label?: string | null;
  package_quantity?: string | null;
  package_unit?: string | null;
  calculation_type: "per_m2" | "fixed";
  consumption?: string | null;
  consumption_unit?: string | null;
  unit: string;
  base_unit_price?: string | null;
  discounted_unit_price?: string | null;
  base_package_price?: string | null;
  discounted_package_price?: string | null;
  discount_rate?: string | null;
  notes?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MaterialUpdate = Partial<MaterialInsert>;

export type QuoteInsert = {
  id?: string;
  quote_number: string;
  client_id?: string | null;
  client_name_snapshot?: string | null;
  client_email_snapshot?: string | null;
  client_phone_snapshot?: string | null;
  client_address_snapshot?: string | null;
  project_location?: string | null;
  quote_date?: string;
  description?: string | null;
  area?: string | null;
  area_unit?: string;
  hourly_rate?: string | null;
  desired_margin?: string | null;
  commercial_discount?: string | null;
  fixed_deduction?: string | null;
  client_pdf_work_description?: string | null;
  materials_total?: string;
  labor_total?: string;
  subcontracts_total?: string;
  equipment_total?: string;
  direct_costs_total?: string;
  surcharges_total?: string;
  total_cost?: string;
  recommended_gross?: string;
  manual_gross?: string | null;
  gross_used?: string;
  net_value?: string;
  profit?: string;
  real_margin?: string;
  total_hours?: string;
  created_at?: string;
  updated_at?: string;
};

export type QuoteUpdate = Partial<QuoteInsert>;

export type QuoteMaterialInsert = {
  id?: string;
  quote_id: string;
  material_id?: string | null;
  position: number;
  stage?: string | null;
  material_name_snapshot: string;
  variant_snapshot?: string | null;
  package_snapshot?: string | null;
  calculation_type: "per_m2" | "fixed";
  consumption_or_quantity: string;
  unit: string | null;
  unit_price: string;
  area_factor: string;
  cost_total: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type QuoteMaterialUpdate = Partial<QuoteMaterialInsert>;
export type QuoteLaborInsert = {
  id?: string;
  quote_id: string;
  position: number;
  label: string;
  people: string;
  work_hours_per_person: string;
  travel_hours_per_person: string;
  total_hours: string;
  hourly_rate: string | null;
  cost_total: string;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
};
export type QuoteLaborUpdate = Partial<QuoteLaborInsert>;
export type QuoteSubcontractInsert = {
  id?: string;
  quote_id: string;
  position: number;
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  total_amount: string;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
};
export type QuoteSubcontractUpdate = Partial<QuoteSubcontractInsert>;
export type QuoteEquipmentInsert = QuoteSubcontractInsert;
export type QuoteEquipmentUpdate = QuoteSubcontractUpdate;
export type QuoteSurchargeInsert = {
  id?: string;
  quote_id: string;
  position: number;
  name: string;
  base_type: QuoteSurchargeRow["base_type"];
  rate: string;
  base_amount: string;
  amount: string;
  created_at?: string;
  updated_at?: string;
};
export type QuoteSurchargeUpdate = Partial<QuoteSurchargeInsert>;

export type Database = {
  public: {
    Tables: {
      clients: TableDefinition<ClientRow, ClientInsert, ClientUpdate>;
      materials: TableDefinition<MaterialRow, MaterialInsert, MaterialUpdate>;
      quotes: TableDefinition<QuoteRow, QuoteInsert, QuoteUpdate>;
      quote_materials: TableDefinition<
        QuoteMaterialRow,
        QuoteMaterialInsert,
        QuoteMaterialUpdate
      >;
      quote_labor: TableDefinition<
        QuoteLaborRow,
        QuoteLaborInsert,
        QuoteLaborUpdate
      >;
      quote_subcontracts: TableDefinition<
        QuoteSubcontractRow,
        QuoteSubcontractInsert,
        QuoteSubcontractUpdate
      >;
      quote_equipment: TableDefinition<
        QuoteEquipmentRow,
        QuoteEquipmentInsert,
        QuoteEquipmentUpdate
      >;
      quote_surcharges: TableDefinition<
        QuoteSurchargeRow,
        QuoteSurchargeInsert,
        QuoteSurchargeUpdate
      >;
      quote_counters: TableDefinition<
        { year: number; last_value: number; updated_at: string },
        { year: number; last_value?: number; updated_at?: string },
        { last_value?: number; updated_at?: string }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      next_quote_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      save_quote: {
        Args: { payload: Json };
        Returns: QuoteRow;
      };
      save_client_pdf_work_description: {
        Args: { target_quote_id: string; work_description: string };
        Returns: boolean;
      };
    };
    Enums: {
      quote_calculation_type: "per_m2" | "fixed";
      quote_surcharge_base: QuoteSurchargeRow["base_type"];
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T]["Row"];

export type TablesInsert<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T]["Update"];
