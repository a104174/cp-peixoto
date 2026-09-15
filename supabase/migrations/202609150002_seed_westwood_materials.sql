insert into public.materials (
  brand, name, variant, category, package_label, package_quantity, package_unit,
  calculation_type, consumption, consumption_unit, unit,
  base_unit_price, discounted_unit_price, base_package_price,
  discounted_package_price, discount_rate, notes
)
values
  ('WestWood', 'Wecryl 171', null, 'resina', '10 kg', 10, 'kg', 'per_m2', 0.50, 'kg/m²', 'kg', 27.10, 22.22, 271.00, 222.22, 0.18, null),
  ('WestWood', 'Wecryl 171', null, 'resina', '25 kg', 25, 'kg', 'per_m2', 0.50, 'kg/m²', 'kg', 25.85, 21.20, 646.25, 529.93, 0.18, null),
  ('WestWood', 'Wecryl 198', null, 'resina', '10 kg', 10, 'kg', 'per_m2', 0.50, 'kg/m²', 'kg', 27.50, 22.55, 275.00, 225.50, 0.18, null),
  ('WestWood', 'Wecryl 127', null, 'resina', '25 kg', 25, 'kg', 'per_m2', 0.60, 'kg/m²', 'kg', 17.20, 14.10, 430.00, 352.60, 0.18, '2.ª camada'),
  ('WestWood', 'Wecryl 810', null, 'resina', '10 kg', 10, 'kg', 'per_m2', 1.70, 'kg/m² por mm', 'kg', 26.85, 22.02, 268.50, 220.17, 0.18, 'Área preenchida; a espessura é ajustada manualmente na V1'),
  ('WestWood', 'Wecryl 402', null, 'resina', '10 kg', 10, 'kg', 'per_m2', 0.70, 'kg/m²', 'kg', 23.10, 18.94, 231.00, 189.42, 0.18, null),
  ('WestWood', 'Wecryl 488', 'PG0', 'resina', '10 kg', 10, 'kg', 'per_m2', 0.70, 'kg/m²', 'kg', 24.45, 20.05, 244.50, 200.49, 0.18, 'Grupo de preço/cor'),
  ('WestWood', 'WeVlies', null, 'tela', '0,10 × 50 m', 5.00, 'm²/rolo', 'per_m2', 1, 'm² tela/m²', 'm²', 8.50, 6.97, 42.50, 34.85, 0.18, 'Sobreposição mínima de 5 cm e desperdício; ajustar manualmente na V1'),
  ('WestWood', 'WeVlies', null, 'tela', '0,15 × 50 m', 7.50, 'm²/rolo', 'per_m2', 1, 'm² tela/m²', 'm²', 9.00, 7.38, 67.50, 55.35, 0.18, 'Sobreposição e desperdício; ajustar manualmente na V1'),
  ('WestWood', 'WeVlies', null, 'tela', '0,20 × 50 m', 10.00, 'm²/rolo', 'per_m2', 1, 'm² tela/m²', 'm²', 9.00, 7.38, 90.00, 73.80, 0.18, 'Sobreposição e desperdício; ajustar manualmente na V1'),
  ('WestWood', 'WeVlies', null, 'tela', '0,26 × 50 m', 13.00, 'm²/rolo', 'per_m2', 1, 'm² tela/m²', 'm²', 8.85, 7.25, 115.00, 94.30, 0.18, 'Sobreposição e desperdício; ajustar manualmente na V1'),
  ('WestWood', 'WeVlies', null, 'tela', '0,35 × 50 m', 17.50, 'm²/rolo', 'per_m2', 1, 'm² tela/m²', 'm²', 9.00, 7.38, 157.50, 129.15, 0.18, 'Sobreposição e desperdício; ajustar manualmente na V1'),
  ('WestWood', 'WeVlies', null, 'tela', '0,52 × 50 m', 26.00, 'm²/rolo', 'per_m2', 1, 'm² tela/m²', 'm²', 8.37, 6.86, 217.50, 178.35, 0.18, 'Sobreposição e desperdício; ajustar manualmente na V1'),
  ('WestWood', 'WeVlies', null, 'tela', '0,70 × 50 m', 35.00, 'm²/rolo', 'per_m2', 1, 'm² tela/m²', 'm²', 8.00, 6.56, 280.00, 229.60, 0.18, 'Sobreposição e desperdício; ajustar manualmente na V1'),
  ('WestWood', 'WeVlies', null, 'tela', '1,05 × 50 m', 52.50, 'm²/rolo', 'per_m2', 1, 'm² tela/m²', 'm²', 7.14, 5.86, 375.00, 307.50, 0.18, 'Sobreposição e desperdício; ajustar manualmente na V1'),
  ('WestWood', 'Wecryl 488', 'PG1', 'resina', '10 kg', 10, 'kg', 'per_m2', 0.70, 'kg/m²', 'kg', 26.20, 21.48, 262.00, 214.84, 0.18, 'Grupo de preço/cor'),
  ('WestWood', 'Wecryl 488', 'PG2', 'resina', '10 kg', 10, 'kg', 'per_m2', 0.70, 'kg/m²', 'kg', 31.35, 25.71, 313.50, 257.07, 0.18, 'Grupo de preço/cor'),
  ('WestWood', 'Wecryl 333', 'H', 'resina', '10 kg', 10, 'kg', 'per_m2', 1.21, 'kg/m² de resina', 'kg', 28.90, 23.70, 289.00, 236.98, 0.18, 'Mistura; catalisador separado e não automatizado na V1'),
  ('WestWood', 'Wecryl 333', 'S N', 'areia', '23 kg', 23, 'kg', 'per_m2', 2.79, 'kg/m² de areia', 'kg', 1.90, 1.56, 43.70, 35.83, 0.18, 'Mistura; areia e resina são linhas independentes'),
  ('WestWood', 'Wecryl R 230', 'thix', 'resina', '10 kg', 10, 'kg', 'per_m2', 2.50, 'kg/m²', 'kg', 22.30, 18.29, 223.00, 182.86, 0.18, 'Utilização indicada com tela de reforço; tela é linha independente'),
  ('WestWood', 'WMP 113', null, 'primário', '1 kg', 1, 'kg', 'per_m2', 0.20, 'kg/m²', 'kg', 52.30, 42.89, 52.30, 42.89, 0.18, 'Taxa VOC de CHF 1,08/kg não incluída'),
  ('WestWood', 'WMP 113', null, 'primário', '10 kg', 10, 'kg', 'per_m2', 0.20, 'kg/m²', 'kg', 37.25, 30.55, 372.50, 305.45, 0.18, 'Taxa VOC de CHF 1,08/kg não incluída'),
  ('WestWood', 'Wekat 900', null, 'catalisador', '100 g / 0,1 kg', 0.1, 'kg', 'fixed', null, null, 'kg', 57.85, 47.44, 5.79, 4.74, 0.18, 'Dosagem depende da resina e temperatura; quantidade manual'),
  ('WestWood', 'Wekat 900', null, 'catalisador', '5 kg', 5, 'kg', 'fixed', null, null, 'kg', 38.35, 31.45, 191.75, 157.24, 0.18, 'Dosagem depende da resina e temperatura; quantidade manual'),
  ('WestWood', 'Wekat 900', null, 'catalisador', '25 kg', 25, 'kg', 'fixed', null, null, 'kg', 31.10, 25.50, 777.50, 637.55, 0.18, 'Dosagem depende da resina e temperatura; quantidade manual'),
  ('WestWood', 'WeTraffic 496 BX', 'PG0', 'mistura', '15 kg', 15, 'kg', 'per_m2', 1.80, 'kg/m²', 'kg', 15.15, 12.42, 227.25, 186.35, 0.18, 'Mistura com 20% de bauxite'),
  ('WestWood', 'WeTraffic 496 BX', 'PG1', 'mistura', '15 kg', 15, 'kg', 'per_m2', 1.80, 'kg/m²', 'kg', 16.10, 13.20, 241.50, 198.03, 0.18, 'Mistura com 20% de bauxite'),
  ('WestWood', 'WeTraffic 496 BX', 'PG2', 'mistura', '15 kg', 15, 'kg', 'per_m2', 1.80, 'kg/m²', 'kg', 20.40, 16.73, 306.00, 250.92, 0.18, 'Mistura com 20% de bauxite')
on conflict do nothing;

