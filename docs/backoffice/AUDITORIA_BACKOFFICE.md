# Auditoria prévia do backoffice CP Peixoto

Auditoria concluída em modo estritamente read-only.

Não foram alterados:

- código;
- dependências;
- `.env`;
- base de dados;
- migrations;
- configuração Netlify/Supabase;
- rotas;
- componentes;
- autenticação;
- website público;
- commits, deploys ou push.

Validações executadas:

- `npm test`: 14 testes aprovados;
- `npm run lint`: aprovado;
- TypeScript com `tsc --noEmit --incremental false`: aprovado;
- não executei `npm run build`, porque poderia alterar artefactos gerados em `.next`.

O único estado não versionado já presente é a pasta fornecida pelo utilizador:

```text
?? docs/backoffice/
```

Usei também a skill de análise Next.js para validar a recomendação de arquitetura de rotas, layouts e proteção de páginas.

## Convenções usadas

Cada conclusão está classificada como:

- **CONFIRMADO PELO EXCEL**
- **CONFIRMADO PELOS PRINTS**
- **INFERÊNCIA**
- **PROPOSTA**
- **AMBIGUIDADE**

---

# A. Estado atual do projeto

## Stack confirmada

**CONFIRMADO PELO REPOSITÓRIO**

O projeto usa:

- Next.js `16.3.0`;
- React `19.2.8`;
- TypeScript strict;
- App Router;
- Tailwind CSS 4;
- Zod;
- Resend;
- Vitest;
- configuração ESLint para Next.js;
- alias TypeScript `@/*`.

Referência: [package.json](/home/l1tren/projetos/cp/package.json:1).

A versão instalada do Next.js exige Node.js `>=20.9.0`.

## Estrutura atual

A aplicação pública está organizada através de route groups:

```text
src/app/
├── (de)/
│   ├── layout.tsx
│   └── page.tsx
├── (pt)/
│   ├── layout.tsx
│   └── pt/
│       └── page.tsx
├── api/
│   └── contact/
│       └── route.ts
├── globals.css
├── motion.css
├── robots.ts
└── sitemap.ts
```

Rotas atualmente identificáveis:

```text
/
 /pt
 /api/contact
 /robots.txt
 /sitemap.xml
```

Os layouts atuais são independentes para alemão e português:

- [layout alemão](/home/l1tren/projetos/cp/src/app/(de)/layout.tsx:1)
- [layout português](/home/l1tren/projetos/cp/src/app/(pt)/layout.tsx:1)

O componente [DocumentShell](/home/l1tren/projetos/cp/src/components/layout/document-shell.tsx:10) cria o elemento `<html>` e o `<body>`. Isto significa que os layouts atuais funcionam como root layouts.

## Website público

**CONFIRMADO PELO REPOSITÓRIO**

O website público:

- utiliza componentes próprios de apresentação;
- inclui header, navegação, landing page, footer e conteúdo institucional;
- tem metadata, canonical URLs, hreflang, robots e sitemap;
- utiliza `info@cp-peixoto.ch`;
- tem formulário de contacto servido por `/api/contact`.

A composição pública está em [landing-page.tsx](/home/l1tren/projetos/cp/src/components/landing-page.tsx:16).

## Resend

**CONFIRMADO PELO REPOSITÓRIO**

O endpoint [contact/route.ts](/home/l1tren/projetos/cp/src/app/api/contact/route.ts:30):

- recebe JSON;
- valida o conteúdo com Zod;
- limita o corpo da request;
- envia através de Resend;
- usa email de destino configurado no servidor;
- não grava contactos numa base de dados;
- não exige autenticação.

As únicas variáveis documentadas em [.env.example](/home/l1tren/projetos/cp/.env.example:1) estão relacionadas com Resend e o URL público:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL
CONTACT_EMAIL_TO
NEXT_PUBLIC_SITE_URL
```

## Base de dados atual

**CONFIRMADO PELO REPOSITÓRIO**

Não encontrei:

- Supabase;
- Prisma;
- Drizzle;
- PostgreSQL;
- SQLite;
- migrations;
- ORM;
- SDK de autenticação;
- tabelas;
- `SUPABASE_SERVICE_ROLE_KEY`;
- integração de storage;
- CMS;
- sistema de utilizadores;
- `middleware.ts`;
- `proxy.ts`.

O README também descreve o projeto como uma landing page sem base de dados ou uploads: [README.md](/home/l1tren/projetos/cp/README.md:5).

## Netlify e produção

**CONFIRMADO PARCIALMENTE PELO REPOSITÓRIO**

O README documenta Netlify e o domínio `cp-peixoto.ch`, mas não existe `netlify.toml` nem configuração suficiente no repositório para provar:

- o site Netlify concreto;
- o projeto Netlify associado;
- o DNS atualmente ativo;
- o domínio efetivamente publicado;
- variáveis de produção configuradas.

**INFERÊNCIA**

O website público está preparado para Netlify através do suporte padrão do Next.js, mas o estado operacional da conta Netlify precisa de ser confirmado no painel correspondente.

A documentação oficial da Netlify indica suporte para App Router, SSR, Server Actions e Route Handlers através da integração Next.js/OpenNext: [Netlify Next.js](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).

## SEO atual

**CONFIRMADO PELO REPOSITÓRIO**

O [robots.ts](/home/l1tren/projetos/cp/src/app/robots.ts:5) permite o acesso ao website quando `NEXT_PUBLIC_SITE_URL` está configurado.

O [sitemap.ts](/home/l1tren/projetos/cp/src/app/sitemap.ts:5) contém apenas:

```text
/
 /pt
```

A futura área `/backoffice` não deverá ser adicionada ao sitemap.

Deverá também:

- ter `robots: { index: false, follow: false }`;
- ser excluída explicitamente de `robots.txt`;
- continuar protegida por autenticação real.

`robots.txt` nunca deve ser considerado mecanismo de segurança.

## Avaliação geral do estado atual

O projeto público está pequeno, coerente e saudável para receber uma área interna, desde que seja introduzida uma separação clara.

**PROPOSTA**

A melhor separação é:

- manter os route groups públicos intactos;
- criar um root layout próprio para o backoffice;
- não reutilizar o shell visual público;
- não importar componentes públicos pesados para a área interna;
- não colocar o cliente Supabase no layout público;
- proteger separadamente `/backoffice/*` e APIs internas.

---

# B. Auditoria do Excel

Fonte analisada: [Calculadora_Orcamentos_CP_Peixoto.xlsx](/home/l1tren/projetos/cp/docs/backoffice/Calculadora_Orcamentos_CP_Peixoto.xlsx).

Também foram analisados os quatro ficheiros de materiais:

- [material1.jpeg](/home/l1tren/projetos/cp/docs/backoffice/material1.jpeg)
- [material2.jpeg](/home/l1tren/projetos/cp/docs/backoffice/material2.jpeg)
- [material3.jpeg](/home/l1tren/projetos/cp/docs/backoffice/material3.jpeg)
- [material4.jpeg](/home/l1tren/projetos/cp/docs/backoffice/material4.jpeg)

## Folhas existentes

**CONFIRMADO PELO EXCEL**

Existem duas folhas:

```text
Calculadora
Como utilizar
```

### Folha `Calculadora`

- dimensão declarada: `A1:H92`;
- 304 células não vazias;
- 82 células com fórmulas;
- 680 células com estilo;
- 31 células/ranges merged;
- 2 validações de dados;
- sem linhas ocultas;
- sem colunas ocultas;
- sem folhas ocultas;
- sem tabelas Excel;
- sem filtros;
- sem conditional formatting;
- sem defined names;
- sem print area;
- sem proteção de folha;
- freeze pane em `A12`;
- gridlines desativadas.

### Folha `Como utilizar`

- dimensão declarada: `A1:D22`;
- 55 células não vazias;
- nenhuma fórmula;
- 3 merges;
- sem validações;
- sem proteção;
- sem informação calculada.

Não existem referências entre as duas folhas.

## Estilos e semântica visual

**CONFIRMADO PELO EXCEL**

A folha utiliza cores para distinguir tipos de células:

- amarelo: inputs manuais;
- verde claro: cálculos ou resultados;
- azul claro: totais;
- azul escuro: cabeçalhos e totais principais;
- âmbar: avisos.

A cor amarela não constitui segurança técnica. Todas as células estão marcadas como locked no XML, mas a proteção da folha está desativada.

**RISCO**

Qualquer utilizador pode sobrescrever fórmulas ou resultados no Excel.

## Inputs principais

**CONFIRMADO PELO EXCEL**

| Célula | Campo | Valor |
|---|---|---:|
| `B6` | Cliente | vazio |
| `D6` | Local | vazio |
| `F6` | Data | vazio |
| `H6` | N.º orçamento | vazio |
| `B7` | Descrição | `Revestimento de pavimento` |
| `B8` | Área | `600` |
| `D8` | Unidade | `m²` |
| `F8` | Preço-hora | `52` |
| `H8` | Margem de lucro desejada | `10,69%` |

**AMBIGUIDADE**

Os valores acima parecem ser dados de exemplo da obra de Zofingen. Não devem ser tratados como defaults globais da empresa.

## Materiais

A tabela de materiais ocupa:

```text
A11:H20
```

Cabeçalhos:

```text
Etapa
Material
Tipo
Consumo / qtd.
Unidade
Preço unitário
Área/fator
Custo total
```

Linhas:

| Linha | Etapa | Material | Tipo | Consumo/qtd. | Unidade | Preço |
|---:|---|---|---|---:|---|---:|
| 12 | Primário | Primário | Por m² | 0,50 | kg/m² | 3,90 |
| 13 | Primário | 2.ª demão de primário | Por m² | 0 | kg/m² | 3,90 |
| 14 | Primário | Areia | Por m² | 2,50 | kg/m² | 0,35 |
| 15 | Camada polvilhada | Revestimento | Por m² | 1,60 | kg/m² | 3,90 |
| 16 | Camada polvilhada | Areia | Por m² | 5,00 | kg/m² | 0,35 |
| 17 | Selagem final | Selagem de topo | Por m² | 0,90 | kg/m² | 4,00 |
| 18 | Outro | vazio | Fixo | 0 | un. | 0 |
| 19 | Outro | vazio | Fixo | 0 | un. | 0 |

`H20` é o total de materiais.

## Mão de obra

A tabela ocupa:

```text
A23:H32
```

Cabeçalhos:

```text
Dia/equipa
N.º pessoas
Trabalho h/pessoa
Deslocação h/pessoa
Total horas
Preço/hora
Custo total
Nota
```

Dados preenchidos:

| Dia | Pessoas | Trabalho | Deslocação |
|---|---:|---:|---:|
| 1.º dia | 1 | 9 h | 1 h |
| 2.º dia | 1 | 10 h | 2 h |
| 3.º dia | 1 | 24 h | 3 h |
| 4.º dia | 1 | 30 h | 3 h |
| 5.º–8.º dias | 0 | 0 h | 0 h |

As notas estão vazias e não são usadas nas fórmulas.

## Subempreitadas

A tabela ocupa:

```text
A35:E41
```

Dados:

| Descrição | Quantidade | Unidade | Preço unitário |
|---|---:|---|---:|
| Granalhagem / preparação mecânica | 600 | m² | 2,20 |
| Contentor de entulho | 1 | un. | 900,00 |
| Linhas adicionais | 0 | un. | 0 |

## Viaturas/equipamento

A tabela ocupa:

```text
A44:E50
```

Dados:

| Descrição | Quantidade | Unidade | Preço unitário |
|---|---:|---|---:|
| Carrinha / bomba | 4 | dia/un. | 140,00 |
| Linhas adicionais | 0 | un. | 0 |

## Custos diretos

A folha calcula:

```text
H53 = materiais
H54 = mão de obra
H55 = subempreitadas
H56 = viaturas/equipamento
H57 = total dos custos diretos
```

Não existem outras categorias diretas no modelo atual.

## Acréscimos

A tabela ocupa:

```text
A60:F66
```

Existem quatro acréscimos:

| Linha | Nome | Base selecionada | Taxa |
|---:|---|---|---:|
| 61 | Subempreitada | Subempreitadas | 8% |
| 62 | Direção/condução da obra | Mão de obra | 27% |
| 63 | Oficina/estaleiro | Custos diretos | 3% |
| 64 | Administração | Custos diretos + acréscimos anteriores | 12% |

O campo `B61:B64` usa uma lista de validação comum.

A lista contém:

```text
Subempreitadas
Materiais
Mão de obra
Viatura/equipamento
Mão de obra + viatura
Custos diretos
Custos diretos + acréscimos anteriores
```

O campo `C61:C64` está merged com `B61:B64` e não é usado pelas fórmulas. A base selecionada é lida de `B`.

## Pricing

A zona de pricing ocupa aproximadamente:

```text
A69:H82
```

Parâmetros:

| Célula | Campo | Valor |
|---|---|---:|
| `B70` | Margem de lucro desejada | referência a `H8` |
| `B71` | Desconto comercial | 2% |
| `B72` | Skonto/pronto pagamento | 2% |
| `B73` | Outras deduções fixas | 0 |
| `B74` | Preço bruto recomendado | calculado |
| `B75` | Preço bruto manual | 22.485 |
| `B76` | Preço bruto utilizado | manual ou recomendado |
| `B77` | Valor líquido | calculado |
| `B78` | Lucro estimado | calculado |
| `B79` | Margem real | calculada |

Indicadores:

| Célula | Indicador |
|---|---|
| `H70` | custos diretos |
| `H71` | custo total da obra |
| `H72` | valor líquido por m² |
| `H73` | dedução fixa por m² |
| `H74` | horas totais |
| `H75` | faturação líquida por hora |

## Folha `Como utilizar`

**CONFIRMADO PELO EXCEL**

A folha documenta:

- preenchimento de cliente, local e descrição;
- área e unidade;
- linhas de materiais;
- distinção `Por m²`/`Fixo`;
- linhas de mão de obra;
- serviços externos;
- viaturas/equipamento;
- acréscimos;
- descontos;
- skonto;
- preço manual;
- indicadores;
- legenda de cores.

A própria folha inclui esta observação:

> A folha original não mostrava as bases para 27%, 3% e 12%; esta calculadora torna a base visível/editável através da lista.

Isto confirma que a visibilidade das bases foi uma preocupação do modelo atual.

---

# C. Motor financeiro

## C.1 Materiais

**CONFIRMADO PELO EXCEL**

Para cada linha:

```excel
Glinha = IF(C="Por m²", $B$8, 1)
Hlinha = Dlinha * Flinha * Glinha
```

Em termos conceptuais:

```text
fator =
  área da obra, se tipo = "Por m²"
  1, caso contrário

custo da linha =
  consumo ou quantidade
  × preço unitário
  × fator
```

### Material por m²

```text
custo = consumo por m² × preço × área
```

Exemplo, linha 12:

```text
0,50 kg/m² × 3,90 CHF/kg × 600 m²
= 1.170,00 CHF
```

### Material fixo

```text
custo = quantidade × preço unitário
```

O Excel não calcula embalagens, arredondamento de sacos ou número de unidades necessárias.

### Limitação importante

O Excel apenas distingue:

```text
Por m²
Fixo
```

Qualquer outro valor diferente de exatamente `"Por m²"` segue a fórmula fixa.

**RISCO**

Um valor inválido colado manualmente em `C12:C19` é interpretado silenciosamente como material fixo.

Não existem validações de:

- consumo positivo;
- preço positivo;
- unidade coerente;
- material preenchido;
- embalagem;
- quantidade máxima;
- espessura;
- desperdício;
- arredondamento de embalagem.

## C.2 Mão de obra

**CONFIRMADO PELO EXCEL**

Para cada linha:

```excel
E = B * (C + D)
F = $F$8
G = E * F
```

Ou:

```text
horas totais =
  número de pessoas
  × (horas de trabalho por pessoa + horas de deslocação por pessoa)

custo =
  horas totais × preço/hora global
```

O total é:

```text
horas totais = SUM(E24:E31)
custo total = SUM(G24:G31)
```

A taxa horária é global e vem de `F8`.

## C.3 Subempreitadas

**CONFIRMADO PELO EXCEL**

Para cada linha:

```excel
E = quantidade × preço unitário
```

Total:

```excel
E41 = SUM(E36:E40)
```

## C.4 Viaturas/equipamento

**CONFIRMADO PELO EXCEL**

Para cada linha:

```excel
E = quantidade × preço unitário
```

Total:

```excel
E50 = SUM(E45:E49)
```

## C.5 Custos diretos

**CONFIRMADO PELO EXCEL**

```text
custos diretos =
  materiais
  + mão de obra
  + subempreitadas
  + viaturas/equipamento
```

Fórmula equivalente:

```excel
H57 = SUM(H53:H56)
```

## C.6 Bases dos acréscimos

**CONFIRMADO PELO EXCEL**

As bases disponíveis são:

```text
Subempreitadas       → E41
Materiais             → H20
Mão de obra           → G32
Viatura/equipamento   → E50
Mão de obra + viatura → G32 + E50
Custos diretos        → H57
```

Existe uma sétima opção visual:

```text
Custos diretos + acréscimos anteriores
```

Contudo, ela não tem uma branch explícita própria. É tratada como fallback das fórmulas `IF`.

## C.7 Acréscimos cumulativos

Para a linha 61, a base desconhecida/fallback é:

```excel
H57
```

Para as linhas seguintes, o fallback acrescenta os montantes anteriores.

Formalmente:

```text
base de row 61 = custos diretos

base de row 62 = custos diretos + F61
base de row 63 = custos diretos + F61 + F62
base de row 64 = custos diretos + F61 + F62 + F63
```

No caso preenchido:

```text
F61 = 2220 × 8% = 177,60

F62 = 4264 × 27% = 1.151,28

F63 = 15693 × 3% = 470,79

base F64 =
  15693 + 177,60 + 1151,28 + 470,79
= 17492,67

F64 =
  17492,67 × 12%
= 2099,1204
```

Total dos acréscimos:

```text
3898,7904 CHF
```

## C.8 Custo total

**CONFIRMADO PELO EXCEL**

```excel
F66 = H57 + F65
```

Ou:

```text
custo total da obra =
  custos diretos
  + acréscimos
```

## C.9 Margem desejada

**CONFIRMADO PELO EXCEL**

A fórmula do preço recomendado é:

```excel
=IF(
  OR(B70>=1,B71>=1,B72>=1),
  0,
  $F$66/(1-B70)/(1-B71)/(1-B72)
)
```

Isto equivale a:

```text
preço bruto recomendado =
  custo total
  ÷ (1 - margem desejada)
  ÷ (1 - desconto comercial)
  ÷ (1 - skonto)
```

### Interpretação

**INFERÊNCIA MATEMÁTICA**

Esta fórmula trata `B70` como margem sobre o valor líquido de venda, não como markup sobre custo.

Com deduções fixas iguais a zero:

```text
lucro / preço líquido = margem desejada
```

Não são conceitos equivalentes:

```text
markup = lucro / custo
margem = lucro / venda
```

## C.10 Desconto comercial e skonto

**CONFIRMADO PELO EXCEL**

Os descontos são compostos sequencialmente:

```excel
B77 = B76 * (1-B71) * (1-B72) - B73
```

Portanto:

```text
valor líquido =
  preço bruto utilizado
  × (1 - desconto comercial)
  × (1 - skonto)
  - dedução fixa
```

Não existe IVA, transporte ou taxa adicional na fórmula.

## C.11 Preço manual

**CONFIRMADO PELO EXCEL**

```excel
B76 = IF(B75="",B74,B75)
```

Comportamento:

- `B75` vazio: usa o preço recomendado;
- `B75` preenchido: usa o preço manual;
- `B75 = 0`: é considerado override manual válido e resulta em preço bruto zero.

**RISCO**

Um zero introduzido acidentalmente anula o preço recomendado.

Na futura aplicação deverá existir confirmação visual explícita para override manual.

## C.12 Valor líquido

```excel
B77 = B76*(1-B71)*(1-B72)-B73
```

## C.13 Lucro

```excel
B78 = B77-$F$66
```

Ou:

```text
lucro = valor líquido - custo total
```

## C.14 Margem real

```excel
B79 = IF(B77=0,0,B78/B77)
```

Ou:

```text
margem real =
  lucro ÷ valor líquido
```

Se o valor líquido for zero, o Excel devolve zero.

## C.15 Indicadores por m²

**CONFIRMADO PELO EXCEL**

```excel
H72 = IF(B8=0,0,B77/B8)
H73 = IF(B8=0,0,B73/B8)
```

Existem:

```text
valor líquido por m²
dedução fixa por m²
```

Não existe no Excel um indicador explícito de:

```text
custo total por m²
lucro por m²
custos diretos por m²
```

Esses indicadores seriam úteis no futuro, mas são **PROPOSTA**, não comportamento atual.

## C.16 Outros indicadores

**CONFIRMADO PELO EXCEL**

```excel
H74 = E32
H75 = IF(E32=0,0,B77/E32)
```

Ou:

```text
horas totais
faturação líquida por hora
```

## C.17 Arredondamento

**CONFIRMADO PELO EXCEL E PELOS PRINTS**

Não existem fórmulas `ROUND`.

Os prints indicam:

```text
Valores arredondados a 2 casas apenas depois do cálculo,
sem arredondamentos intermédios.
```

Os valores internos confirmam isto:

```text
470,78999999999996
19591,790399999998
```

Esses valores são artefactos de floats do Excel, não valores financeiros pretendidos.

**PROPOSTA**

A implementação deverá:

- usar decimal exato;
- não arredondar cálculos intermédios;
- arredondar apenas na apresentação;
- definir explicitamente o modo de arredondamento;
- guardar os valores calculados com precisão suficiente.

## C.18 Possível erro no preço recomendado

**CONFIRMADO PELO EXCEL**

A fórmula de `B74` não inclui `B73`, a dedução fixa.

O valor líquido real inclui `B73`:

```excel
B77 = ... - B73
```

Mas o preço recomendado é calculado sem compensar essa dedução.

**AMBIGUIDADE / POSSÍVEL ERRO OBJETIVO**

Se `B73 > 0`, o preço recomendado não garante a margem desejada.

Se a intenção for preservar a margem depois da dedução fixa, a fórmula conceptual seria:

```text
preço bruto recomendado =
  (custo total / (1 - margem desejada) + dedução fixa)
  ÷ (1 - desconto comercial)
  ÷ (1 - skonto)
```

Não deve ser corrigido sem decisão humana.

---

# D. Casos de referência

O workbook contém apenas uma obra parcialmente preenchida. Não existem três obras independentes completas.

A referência a Zofingen aparece no aviso da célula `A82`, mas cliente, local, data e número estão vazios.

Portanto, não é legítimo inventar dois cenários “reais”.

## D.1 Caso R1 — exemplo completo existente

**CONFIRMADO PELO EXCEL**

### Inputs

```text
Área: 600 m²
Preço/hora: CHF 52,00
Margem desejada: 10,69%
Desconto comercial: 2%
Skonto: 2%
Deduções fixas: CHF 0,00
Preço manual: CHF 22.485,00
```

### Materiais

| Linha | Cálculo | Resultado |
|---:|---|---:|
| 12 | 0,50 × 3,90 × 600 | CHF 1.170,00 |
| 13 | 0 × 3,90 × 600 | CHF 0,00 |
| 14 | 2,50 × 0,35 × 600 | CHF 525,00 |
| 15 | 1,60 × 3,90 × 600 | CHF 3.744,00 |
| 16 | 5,00 × 0,35 × 600 | CHF 1.050,00 |
| 17 | 0,90 × 4,00 × 600 | CHF 2.160,00 |
| 18 | 0 × 0 × 1 | CHF 0,00 |
| 19 | 0 × 0 × 1 | CHF 0,00 |

```text
Total materiais = CHF 8.649,00
```

### Mão de obra

| Dia | Cálculo de horas | Horas | Custo |
|---|---:|---:|---:|
| 1.º | 1 × (9 + 1) | 10 | CHF 520,00 |
| 2.º | 1 × (10 + 2) | 12 | CHF 624,00 |
| 3.º | 1 × (24 + 3) | 27 | CHF 1.404,00 |
| 4.º | 1 × (30 + 3) | 33 | CHF 1.716,00 |

```text
Horas totais = 82
Custo de mão de obra = CHF 4.264,00
```

### Subempreitadas

```text
Granalhagem = 600 × 2,20 = CHF 1.320,00
Contentor = 1 × 900 = CHF 900,00

Total = CHF 2.220,00
```

### Equipamento

```text
Carrinha/bomba = 4 × 140 = CHF 560,00
```

### Custos diretos

```text
8649 + 4264 + 2220 + 560
= CHF 15.693,00
```

### Acréscimos

```text
Subempreitada:
2220 × 8% = CHF 177,60

Mão de obra:
4264 × 27% = CHF 1.151,28

Custos diretos:
15693 × 3% = CHF 470,79

Administração:
(15693 + 177,60 + 1151,28 + 470,79) × 12%
= CHF 2.099,1204
```

```text
Total acréscimos = CHF 3.898,7904
```

### Custo total

```text
15693 + 3898,7904
= CHF 19.591,7904
```

### Preço recomendado

```text
19591,7904
÷ (1 - 0,1069)
÷ (1 - 0,02)
÷ (1 - 0,02)

= CHF 22.841,3561307...
```

Apresentação:

```text
CHF 22.841,36
```

### Preço manual atual

```text
Preço bruto manual = CHF 22.485,00
```

### Valor líquido

```text
22485 × 0,98 × 0,98
= CHF 21.594,594
```

Apresentação:

```text
CHF 21.594,59
```

### Lucro

```text
21594,594 - 19591,7904
= CHF 2.002,8036
```

Apresentação:

```text
CHF 2.002,80
```

### Margem real

```text
2002,8036 ÷ 21594,594
= 9,2745601%
```

Apresentação:

```text
9,27%
```

### Indicadores

```text
Valor líquido/m²:
21594,594 ÷ 600
= CHF 35,99099/m²

Lucro/m²:
2002,8036 ÷ 600
= CHF 3,338006/m²

Valor líquido/hora:
21594,594 ÷ 82
= CHF 263,348707...
```

Apresentação:

```text
CHF 35,99/m²
CHF 3,34/m²
CHF 263,35/h
```

## D.2 Caso R2 — branch `Fixo`

**CONFIRMADO PELO EXCEL**

As linhas 18 e 19 exercitam o branch de material fixo:

```text
tipo = Fixo
quantidade = 0
preço = 0
fator = 1
custo = 0 × 0 × 1 = 0
```

Este caso confirma a fórmula, mas não representa uma segunda obra real.

## D.3 Caso R3 — branch cumulativo de acréscimos

**CONFIRMADO PELO EXCEL**

A linha de Administração utiliza a base:

```text
custos diretos + acréscimos anteriores
```

Resultado:

```text
base = CHF 17.492,67
taxa = 12%
acréscimo = CHF 2.099,1204
```

Este é um caso de referência para testar a ordem dos acréscimos.

## D.4 Caso R4 — apagar o preço manual

**INFERÊNCIA DERIVADA DO EXCEL**

A própria folha instrui o utilizador a limpar o preço manual para usar o recomendado.

Se `B75` ficar vazio:

```text
B76 = B74 = CHF 22.841,36 apresentado
```

Com cálculo não arredondado:

```text
valor líquido ≈ CHF 21.936,8384
lucro ≈ CHF 2.345,0480
margem real ≈ 10,69%
```

Este resultado é derivado da fórmula, não um segundo cenário armazenado no workbook.

## Limitação para testes golden

**AMBIGUIDADE**

Para cumprir rigorosamente testes contra três obras reais, faltam pelo menos dois casos adicionais preenchidos no Excel.

Recomendo fornecer posteriormente:

- uma obra com preço manual;
- uma obra sem preço manual;
- uma obra com materiais fixos;
- uma obra com outras bases de acréscimos;
- uma obra com dedução fixa;
- idealmente uma obra com margem negativa ou override abaixo do custo.

---

# E. Materiais

## E.1 Características gerais

**CONFIRMADO PELOS PRINTS**

Os quatro prints:

- têm cabeçalho `WESTWOOD 2026`;
- apresentam preços em CHF;
- mostram preço base a vermelho;
- mostram preço com desconto a verde;
- aplicam desconto de 18%;
- indicam data `02.09.2026`;
- indicam `CP Peixoto | Tabelas fornecidas pelo cliente`.

A marca `WestWood` é confirmada pelo cabeçalho. Não existe um campo de fabricante repetido em cada linha.

## E.2 Catálogo estruturado

Os valores abaixo são transcritos dos prints. A estrutura é uma representação conceptual, não uma seed criada.

### Página 1 — [material4.jpeg](/home/l1tren/projetos/cp/docs/backoffice/material4.jpeg)

| Material | Embalagem | Consumo | Preço base | -18% | Observações |
|---|---:|---:|---:|---:|---|
| Wecryl 171 | 10 kg | 0,50 kg/m² | 27,10/kg; 271,00/emb. | 22,22/kg; 222,22/emb. | — |
| Wecryl 171 | 25 kg | 0,50 kg/m² | 25,85/kg; 646,25/emb. | 21,20/kg; 529,93/emb. | — |
| Wecryl 198 | 10 kg | 0,50 kg/m² | 27,50/kg; 275,00/emb. | 22,55/kg; 225,50/emb. | — |
| Wecryl 127 | 25 kg | 0,60 kg/m² | 17,20/kg; 430,00/emb. | 14,10/kg; 352,60/emb. | 2.ª camada |
| Wecryl 810 | 10 kg | 1,70 kg/m² por mm | 26,85/kg; 268,50/emb. | 22,02/kg; 220,17/emb. | Área preenchida |
| Wecryl 402 | 10 kg | 0,70 kg/m² | 23,10/kg; 231,00/emb. | 18,94/kg; 189,42/emb. | — |
| Wecryl 488 PG0 | 10 kg | 0,70 kg/m² | 24,45/kg; 244,50/emb. | 20,05/kg; 200,49/emb. | Grupo de preço/cor |
| WeVlies | 0,10 × 50 m | 5,00 m²/rolo | 8,50/m²; 42,50/rolo | 6,97/m²; 34,85/rolo | Sobreposição mínima de 5 cm e desperdício |
| WeVlies | 0,15 × 50 m | 7,50 m²/rolo | 9,00/m²; 67,50/rolo | 7,38/m²; 55,35/rolo | Sobreposição e desperdício |
| WeVlies | 0,20 × 50 m | 10,00 m²/rolo | 9,00/m²; 90,00/rolo | 7,38/m²; 73,80/rolo | Sobreposição e desperdício |
| WeVlies | 0,26 × 50 m | 13,00 m²/rolo | 8,85/m²; 115,00/rolo | 7,25/m²; 94,30/rolo | Sobreposição e desperdício |
| WeVlies | 0,35 × 50 m | 17,50 m²/rolo | 9,00/m²; 157,50/rolo | 7,38/m²; 129,15/rolo | Sobreposição e desperdício |
| WeVlies | 0,52 × 50 m | 26,00 m²/rolo | 8,37/m²; 217,50/rolo | 6,86/m²; 178,35/rolo | Sobreposição e desperdício |
| WeVlies | 0,70 × 50 m | 35,00 m²/rolo | 8,00/m²; 280,00/rolo | 6,56/m²; 229,60/rolo | Sobreposição e desperdício |
| WeVlies | 1,05 × 50 m | 52,50 m²/rolo | 7,14/m²; 375,00/rolo | 5,86/m²; 307,50/rolo | Sobreposição e desperdício |

### Página 2 — [material3.jpeg](/home/l1tren/projetos/cp/docs/backoffice/material3.jpeg)

| Material | Embalagem | Consumo | Preço base | -18% | Observações |
|---|---:|---:|---:|---:|---|
| Wecryl 488 PG1 | 10 kg | 0,70 kg/m² | 26,20/kg; 262,00/emb. | 21,48/kg; 214,84/emb. | Grupo de preço/cor |
| Wecryl 488 PG2 | 10 kg | 0,70 kg/m² | 31,35/kg; 313,50/emb. | 25,71/kg; 257,07/emb. | Grupo de preço/cor |
| Wecryl 333 H | 10 kg | aprox. 1,21 kg/m² de resina | 28,90/kg; 289,00/emb. | 23,70/kg; 236,98/emb. | Mistura |
| Wecryl 333 S N | 23 kg | aprox. 2,79 kg/m² de areia | 1,90/kg; 43,70/emb. | 1,56/kg; 35,83/emb. | Mistura |
| Wecryl R 230 thix | 10 kg | 2,50 kg/m² | 22,30/kg; 223,00/emb. | 18,29/kg; 182,86/emb. | Com tela de reforço |
| WMP 113 | 1 kg | 0,20 kg/m² | 52,30/kg; 52,30/emb. | 42,89/kg; 42,89/emb. | Taxa VOC não incluída |
| WMP 113 | 10 kg | 0,20 kg/m² | 37,25/kg; 372,50/emb. | 30,55/kg; 305,45/emb. | Taxa VOC não incluída |

### Página 3 — [material2.jpeg](/home/l1tren/projetos/cp/docs/backoffice/material2.jpeg)

| Material | Embalagem | Consumo | Preço base | -18% | Observações |
|---|---:|---:|---:|---:|---|
| Wekat 900 | 100 g / 0,1 kg | Sem consumo fixo | 57,85/kg; 5,79/emb. | 47,44/kg; 4,74/emb. | Dosagem depende da resina e temperatura |
| Wekat 900 | 5 kg | Sem consumo fixo | 38,35/kg; 191,75/emb. | 31,45/kg; 157,24/emb. | Dosagem depende da resina e temperatura |
| Wekat 900 | 25 kg | Sem consumo fixo | 31,10/kg; 777,50/emb. | 25,50/kg; 637,55/emb. | Dosagem depende da resina e temperatura |
| WeTraffic 496 BX PG0 | 15 kg | 1,80 kg/m² | 15,15/kg; 227,25/emb. | 12,42/kg; 186,35/emb. | Mistura com bauxite |
| WeTraffic 496 BX PG1 | 15 kg | 1,80 kg/m² | 16,10/kg; 241,50/emb. | 13,20/kg; 198,03/emb. | Mistura com bauxite |
| WeTraffic 496 BX PG2 | 15 kg | 1,80 kg/m² | 20,40/kg; 306,00/emb. | 16,73/kg; 250,92/emb. | Mistura com bauxite |

### Página 4 — [material1.jpeg](/home/l1tren/projetos/cp/docs/backoffice/material1.jpeg)

A página 4 é a continuação da tabela WeVlies e não introduz uma estrutura de preço diferente além da venda por rolo e por m².

## E.3 Desconto

**CONFIRMADO PELOS PRINTS**

O desconto indicado é:

```text
18%
```

Matematicamente:

```text
preço descontado = preço base × 0,82
```

Os valores de preço por unidade e preço por embalagem são apresentados separadamente.

## E.4 Arredondamento dos prints

**CONFIRMADO PELOS PRINTS**

Os prints indicam arredondamento a duas casas apenas depois do cálculo.

Existem diferenças se se tentar recalcular o preço da embalagem a partir do preço unitário já arredondado.

Exemplos:

```text
Wecryl 127:
17,20 × 25 = 430,00
14,10 × 25 = 352,50
mas o print mostra 352,60

WeVlies 0,26:
8,85 × 13 = 115,05
mas o print mostra 115,00

Wekat 900 100 g:
57,85 × 0,1 × 0,82 = 4,7437 → 4,74
```

**CONCLUSÃO**

Os preços por unidade e por embalagem devem ser tratados como valores de origem independentes.

Não se deve:

```text
guardar apenas o preço/kg
e recalcular sempre o preço da embalagem
```

nem:

```text
guardar apenas o preço da embalagem
e dividir para reconstruir o preço/kg
```

O sistema deve guardar os dois valores fornecidos pela tabela.

## E.5 Notas específicas

### WeVlies

**CONFIRMADO PELOS PRINTS**

- consumo de referência de 1 m² de tela por m²;
- sobreposição mínima de 5 cm;
- devem ser considerados cortes e desperdícios;
- vendido em rolos com larguras e áreas diferentes.

**AMBIGUIDADE**

A regra exata para calcular sobreposição e desperdício não está formalizada como fórmula.

### Wecryl 810

**CONFIRMADO PELOS PRINTS**

O consumo é:

```text
1,70 kg/m² por mm aplicado
```

A nota indica que deve ser calculado sobre a área preenchida, não necessariamente sobre o pavimento inteiro em reparações pontuais.

**AMBIGUIDADE**

O Excel atual não possui:

- espessura em mm;
- área preenchida;
- distinção entre reparação total e pontual.

### Wecryl 333

**CONFIRMADO PELOS PRINTS**

A proporção apresentada é:

```text
4,00 kg/m² de mistura
10 kg de resina : 23 kg de areia
```

Daí:

```text
resina = 4 × 10/33 ≈ 1,21 kg/m²
areia = 4 × 23/33 ≈ 2,79 kg/m²
```

O catalisador é separado.

**AMBIGUIDADE**

Não está indicada a dosagem do catalisador.

### Wekat 900

**CONFIRMADO PELOS PRINTS**

Não existe consumo universal por m².

A dosagem depende de:

- resina;
- temperatura;
- ficha técnica;
- percentagem específica.

**CONSEQUÊNCIA**

O sistema não deve preencher automaticamente uma quantidade baseada apenas na área.

Deverá exigir:

- uma regra de dosagem aprovada;
- ou quantidade manual;
- ou seleção de um sistema de aplicação que contenha a receita.

### WeTraffic 496 BX

**CONFIRMADO PELOS PRINTS**

- consumo de referência: `1,80 kg/m²`;
- já contém 20% de bauxite;
- tem variantes PG0, PG1 e PG2.

**AMBIGUIDADE**

Não é completamente explícito se `1,80 kg/m²` representa:

- o produto total já misturado;
- apenas uma componente;
- uma regra que exige bauxite adicional.

### Wecryl R 230

**CONFIRMADO PELOS PRINTS**

A utilização indicada inclui tela de reforço.

**AMBIGUIDADE**

Não está definido:

- se a tela é obrigatória;
- que tela deve ser selecionada;
- se a tela é calculada como material separado;
- como calcular sobreposição e desperdício.

### WMP 113

**CONFIRMADO PELOS PRINTS**

Está indicada uma taxa VOC adicional de:

```text
CHF 1,08/kg
```

Para uma embalagem de 10 kg:

```text
CHF 10,80
```

**AMBIGUIDADE**

Não está decidido:

- se a taxa deve entrar automaticamente no custo;
- se sofre o desconto de 18%;
- se é repercutida no cliente;
- se depende do país/local da obra;
- se é uma taxa atual ou apenas nota informativa.

### PG0 / PG1 / PG2

**CONFIRMADO PELOS PRINTS**

São grupos de preço por cor.

**AMBIGUIDADE**

O catálogo não contém o mapeamento:

```text
cor específica → PG0 / PG1 / PG2
```

## E.6 Modelo de material necessário

**PROPOSTA**

Os materiais não devem ser uma tabela única com apenas:

```text
nome
preço
unidade
```

O modelo precisa separar:

```text
material
  identidade do produto

package
  embalagem/rolo/formato

price version
  preço válido num período

consumption rule
  consumo, unidade e base de aplicação
```

Isto é necessário porque:

- o mesmo produto tem embalagens diferentes;
- o preço por kg varia por embalagem;
- WeVlies é vendido por rolo e por m²;
- alguns produtos têm PG0/PG1/PG2;
- alguns materiais não têm consumo fixo;
- alguns são componentes de sistemas.

---

# F. Regras de negócio

## Regras confirmadas

**CONFIRMADO PELO EXCEL**

1. Uma obra tem uma área global.
2. Materiais podem ser calculados por m² ou como valor fixo.
3. Materiais por m² usam a área global.
4. Mão de obra combina pessoas, trabalho e deslocação.
5. O preço/hora vem de um valor global.
6. Subempreitadas usam quantidade × preço unitário.
7. Equipamento usa quantidade × preço unitário.
8. Custos diretos são a soma de quatro categorias.
9. Acréscimos podem usar bases diferentes.
10. Acréscimos aparecem numa ordem fixa.
11. A Administração pode incluir acréscimos anteriores.
12. Desconto comercial e skonto são compostos.
13. Existe dedução fixa.
14. Existe preço recomendado.
15. Existe override manual.
16. O valor líquido usa o preço bruto usado.
17. O lucro é valor líquido menos custo total.
18. A margem real é lucro dividido pelo valor líquido.
19. O modelo mostra horas totais e faturação por hora.
20. Não há IVA na calculadora atual.
21. Não há transporte na calculadora atual.
22. Não há número de orçamento preenchido no caso fornecido.
23. Não existe histórico no Excel.
24. Não existe catálogo ligado às linhas de materiais.

## Regras confirmadas pelos prints

1. Existe desconto de catálogo de 18%.
2. Os preços estão em CHF.
3. Os preços são apresentados por kg, m² ou embalagem/rolo.
4. WeVlies requer sobreposição e desperdício.
5. Wekat 900 depende de dosagem contextual.
6. Wecryl 333 é composto por resina e areia.
7. WeTraffic 496 BX contém 20% de bauxite.
8. WMP 113 tem nota de taxa VOC.
9. PG0/PG1/PG2 são grupos de preço por cor.
10. Preços apresentados não incluem necessariamente IVA, transporte ou outras taxas.

## Regras que não devem ser assumidas

**AMBIGUIDADE**

Ainda falta decidir:

- consumo exato por sistema;
- arredondamento para embalagens completas;
- custo de material consumido versus custo de compra;
- desperdício;
- preço de catalisadores;
- taxa VOC;
- IVA;
- transporte;
- tratamento de cores;
- aprovação de preço manual;
- validade de propostas;
- condições de pagamento;
- idioma do documento;
- regras para revisão depois de enviado.

---

# G. Ambiguidades e validações humanas

Esta é a parte mais importante antes da implementação.

## G.1 Excel

1. `B74` ignora a dedução fixa `B73`.
2. Valores inválidos nas bases dos acréscimos caem num fallback silencioso.
3. Uma base cumulativa não tem uma branch explícita; depende de fallback.
4. O override manual aceita zero sem confirmação.
5. Não há arredondamentos explícitos.
6. Não há regras de embalagem.
7. Não há validação numérica robusta.
8. Não existem mais duas obras completas para golden tests.
9. Os campos de cliente/local/data/número do exemplo estão vazios.
10. O valor de `52 CHF/h` pode ser apenas específico daquela obra.
11. A margem `10,69%` pode ser específica daquela obra.
12. As taxas 8%, 27%, 3% e 12% podem não ser defaults globais.

## G.2 Materiais

1. Wekat não tem consumo automático universal.
2. Wecryl 333 não tem catalisador quantificado.
3. WeTraffic não esclarece se a quantidade é do produto total.
4. WeVlies não tem fórmula de sobreposição/desperdício.
5. Wecryl 810 exige espessura e área preenchida.
6. R230 requer clarificação da tela.
7. WMP exige decisão sobre VOC.
8. PG0/PG1/PG2 precisam de mapeamento de cores.
9. Não existem URLs ou fichas técnicas estruturadas.
10. Preço por kg e preço de embalagem não são perfeitamente reversíveis após arredondamento.
11. Não está definido se os preços dos prints são atuais ou históricos.

## G.3 Negócio

1. A margem pretendida deve ser margem sobre venda ou markup?
2. As deduções fixas devem ser consideradas no preço recomendado?
3. O orçamento é interno, comercial ou ambos?
4. O cliente deve ver preços de materiais detalhados?
5. O preço manual precisa de aprovação?
6. Um orçamento enviado pode ser editado diretamente?
7. Uma alteração cria revisão?
8. Os estados `accepted` e `rejected` serão usados desde o início?
9. O número é atribuído ao criar draft ou ao emitir?
10. Uma proposta rejeitada pode voltar a ser enviada?
11. Os clientes podem ser arquivados?
12. Existe necessidade de auditoria legal/fiscal?
13. Qual é o idioma principal do backoffice?
14. Qual é o timezone operacional?
15. Qual é a política de retenção dos dados dos clientes?

---

# H. Modelo de dados proposto

## Princípios

**PROPOSTA**

1. `auth.users` pertence ao Supabase Auth.
2. `profiles` contém dados operacionais e role.
3. Um orçamento tem revisões.
4. Uma revisão emitida é imutável.
5. Materiais atuais não alteram orçamentos históricos.
6. Configurações atuais não alteram orçamentos históricos.
7. Valores financeiros usam `numeric`, não floats.
8. Dados repetitivos ficam em tabelas relacionais.
9. JSON fica reservado para auditoria ou metadata realmente variável.
10. Clientes, materiais e orçamentos usam soft archive em vez de delete destrutivo.

## Convenções PostgreSQL

**PROPOSTA**

- IDs: `uuid`, default `gen_random_uuid()`;
- timestamps: `timestamptz not null default now()`;
- dinheiro: `numeric(18,6)` ou maior;
- quantidades: `numeric(18,8)`;
- cálculos: `numeric(24,12)` se necessário;
- rates: frações entre `0` e `1`, não percentagens inteiras;
- moeda: `char(3)`, default `CHF`;
- textos: `text` com `CHECK` de comprimento;
- `updated_at` atualizado por trigger;
- `created_by` e `updated_by` com FK para `profiles`.

## `profiles`

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK, FK `auth.users.id`, `ON DELETE CASCADE` |
| `display_name` | `text` | não | comprimento mínimo |
| `role` | enum/text | não, `read_only` | `admin`, `employee`, `read_only` |
| `is_active` | `boolean` | não, `true` | utilizador desativado não entra |
| `last_login_at` | `timestamptz` | sim | informativo |
| `created_at` | `timestamptz` | não, `now()` | — |
| `updated_at` | `timestamptz` | não, `now()` | trigger |

Índices:

```text
role
is_active
```

Não deve existir insert público em `profiles`.

## `clients`

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `name` | `text` | não | não vazio |
| `email` | `text` | sim | validação server-side |
| `phone` | `text` | sim | normalização |
| `address_line1` | `text` | sim | — |
| `address_line2` | `text` | sim | — |
| `postal_code` | `text` | sim | — |
| `locality` | `text` | sim | — |
| `country_code` | `char(2)` | não, `CH` | ISO |
| `notes` | `text` | sim | texto simples |
| `created_by` | `uuid` | não | FK `profiles` |
| `updated_by` | `uuid` | sim | FK `profiles` |
| `archived_at` | `timestamptz` | sim | soft archive |
| `created_at` | `timestamptz` | não | — |
| `updated_at` | `timestamptz` | não | trigger |

Índices:

```text
lower(name)
lower(email)
phone
archived_at
```

## `materials`

Representa a identidade lógica do produto.

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `brand` | `text` | não | ex. WestWood |
| `product_name` | `text` | não | ex. Wecryl 171 |
| `variant` | `text` | sim | ex. PG0 |
| `price_group` | `text` | sim | PG0, PG1, PG2 |
| `material_kind` | `text` | não | resina, catalisador, tela, agregado, coating, outro |
| `consumption_value` | `numeric(18,8)` | sim | consumo de referência |
| `consumption_unit` | `text` | sim | kg/m², m²/m², etc. |
| `consumption_basis` | `text` | não | `per_m2`, `per_m2_per_mm`, `no_fixed`, `mixture`, `manual` |
| `notes` | `text` | sim | — |
| `source_document` | `text` | sim | print/documento de origem |
| `source_date` | `date` | sim | 02-09-2026 neste catálogo |
| `is_active` | `boolean` | não, `true` | catálogo |
| `created_by` | `uuid` | não | FK |
| `updated_by` | `uuid` | sim | FK |
| `created_at` | `timestamptz` | não | — |
| `updated_at` | `timestamptz` | não | trigger |

Constraint recomendada:

```text
unique(normalized_brand, normalized_product, normalized_variant, price_group)
```

## `material_packages`

Tabela adicional necessária porque o mesmo material tem vários formatos.

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `material_id` | `uuid` | não | FK `materials`, `ON DELETE RESTRICT` |
| `label` | `text` | não | ex. 10 kg, 0,26 × 50 m |
| `package_type` | `text` | não | saco, lata, balde, rolo, outro |
| `content_quantity` | `numeric(18,8)` | não | > 0 |
| `content_unit` | `text` | não | kg, g, m², unidade |
| `width_m` | `numeric(18,8)` | sim | para rolos |
| `length_m` | `numeric(18,8)` | sim | para rolos |
| `coverage_m2` | `numeric(18,8)` | sim | área do rolo |
| `sale_unit` | `text` | não | pacote, kg, m², rolo |
| `is_active` | `boolean` | não, `true` | — |
| `created_at` | `timestamptz` | não | — |
| `updated_at` | `timestamptz` | não | — |

Índice:

```text
material_id, is_active
```

## `material_price_versions`

Tabela adicional para preservar o catálogo ao longo do tempo.

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `package_id` | `uuid` | não | FK `material_packages` |
| `currency` | `char(3)` | não, `CHF` | — |
| `base_unit_price` | `numeric(18,6)` | não | >= 0 |
| `discounted_unit_price` | `numeric(18,6)` | sim | >= 0 |
| `package_base_price` | `numeric(18,6)` | sim | >= 0 |
| `package_discounted_price` | `numeric(18,6)` | sim | >= 0 |
| `discount_rate` | `numeric(9,6)` | sim | entre 0 e 1 |
| `effective_from` | `timestamptz` | não | — |
| `effective_to` | `timestamptz` | sim | posterior a início |
| `source_reference` | `text` | sim | documento/print |
| `source_date` | `date` | sim | — |
| `notes` | `text` | sim | — |
| `created_by` | `uuid` | não | FK |
| `created_at` | `timestamptz` | não | — |

Deverá existir no máximo uma versão ativa por embalagem num determinado período.

## `quotes`

Representa o agregado comercial principal.

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `quote_number` | `text` | sim inicialmente | unique quando atribuído |
| `client_id` | `uuid` | sim | FK `clients`, `ON DELETE SET NULL` |
| `title` | `text` | não | — |
| `description` | `text` | sim | — |
| `site_address_line1` | `text` | sim | — |
| `site_postal_code` | `text` | sim | — |
| `site_locality` | `text` | sim | — |
| `site_country_code` | `char(2)` | não, `CH` | — |
| `area` | `numeric(18,8)` | sim | >= 0 |
| `area_unit` | `text` | não, `m2` | — |
| `status` | `text` | não, `draft` | estado controlado |
| `created_by` | `uuid` | não | FK `profiles` |
| `updated_by` | `uuid` | sim | FK `profiles` |
| `duplicated_from_quote_id` | `uuid` | sim | self-FK |
| `lock_version` | `bigint` | não, `0` | concorrência |
| `sent_at` | `timestamptz` | sim | — |
| `accepted_at` | `timestamptz` | sim | — |
| `rejected_at` | `timestamptz` | sim | — |
| `archived_at` | `timestamptz` | sim | soft archive |
| `created_at` | `timestamptz` | não | — |
| `updated_at` | `timestamptz` | não | trigger |

Índices:

```text
client_id
status
created_at
lower(quote_number)
```

## `quote_revisions`

**PROPOSTA**

Esta tabela é essencial para impedir que uma proposta enviada seja alterada retroativamente.

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `quote_id` | `uuid` | não | FK `quotes`, cascade controlado |
| `revision_no` | `integer` | não | > 0 |
| `revision_status` | `text` | não, `draft` | draft, issued, superseded |
| `created_by` | `uuid` | não | FK |
| `created_at` | `timestamptz` | não | — |
| `locked_at` | `timestamptz` | sim | preenchido ao emitir |
| `formula_engine_version` | `text` | não | ex. `excel-v1` |
| `calculated_at` | `timestamptz` | sim | — |
| `client_name_snapshot` | `text` | não | — |
| `client_email_snapshot` | `text` | sim | — |
| `client_phone_snapshot` | `text` | sim | — |
| `client_address_snapshot` | `text` | sim | — |
| `site_address_snapshot` | `text` | sim | — |
| `title_snapshot` | `text` | não | — |
| `description_snapshot` | `text` | sim | — |
| `direct_cost_total` | `numeric(24,12)` | não | interno |
| `surcharge_total` | `numeric(24,12)` | não | interno |
| `total_cost` | `numeric(24,12)` | não | interno |
| `recommended_gross` | `numeric(24,12)` | sim | interno |
| `manual_gross` | `numeric(24,12)` | sim | interno |
| `gross_used` | `numeric(24,12)` | não | interno |
| `net_price` | `numeric(24,12)` | não | — |
| `estimated_profit` | `numeric(24,12)` | não | interno |
| `actual_margin_rate` | `numeric(18,12)` | não | interno |
| `total_hours` | `numeric(18,8)` | não | — |

Constraint:

```text
unique(quote_id, revision_no)
```

Uma revisão `issued` não deve ser atualizada. Uma alteração deve criar nova revisão draft.

## `quote_settings_snapshots`

Guarda os parâmetros usados no cálculo.

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `quote_revision_id` | `uuid` | não | FK unique |
| `currency` | `char(3)` | não, `CHF` | — |
| `hourly_rate` | `numeric(18,6)` | não | >= 0 |
| `desired_margin_rate` | `numeric(9,6)` | não | normalmente 0–1 |
| `commercial_discount_rate` | `numeric(9,6)` | não | 0–1 |
| `skonto_rate` | `numeric(9,6)` | não | 0–1 |
| `fixed_deduction` | `numeric(18,6)` | não, `0` | >= 0 |
| `created_at` | `timestamptz` | não | — |

## `quote_materials`

Esta tabela contém o snapshot completo da linha usada no orçamento.

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `quote_revision_id` | `uuid` | não | FK |
| `material_id` | `uuid` | sim | FK, `ON DELETE SET NULL` |
| `package_id` | `uuid` | sim | FK, `ON DELETE SET NULL` |
| `line_order` | `integer` | não | >= 0 |
| `stage` | `text` | não | — |
| `brand_snapshot` | `text` | sim | — |
| `product_snapshot` | `text` | não | — |
| `variant_snapshot` | `text` | sim | — |
| `price_group_snapshot` | `text` | sim | — |
| `material_kind_snapshot` | `text` | não | — |
| `package_label_snapshot` | `text` | sim | — |
| `package_quantity_snapshot` | `numeric(18,8)` | sim | — |
| `package_unit_snapshot` | `text` | sim | — |
| `consumption_value_snapshot` | `numeric(18,8)` | sim | — |
| `consumption_unit_snapshot` | `text` | sim | — |
| `consumption_basis_snapshot` | `text` | não | — |
| `mode` | `text` | não | per_m2, fixed, manual, etc. |
| `area_factor_used` | `numeric(18,8)` | não | — |
| `quantity_calculated` | `numeric(18,8)` | sim | antes de override |
| `quantity_used` | `numeric(18,8)` | não | valor efetivo |
| `base_unit_price_snapshot` | `numeric(18,6)` | sim | — |
| `discounted_unit_price_snapshot` | `numeric(18,6)` | sim | — |
| `discount_rate_snapshot` | `numeric(9,6)` | sim | — |
| `price_used` | `numeric(18,6)` | não | preço efetivo |
| `price_source` | `text` | não | catalog/manual_override |
| `is_consumption_overridden` | `boolean` | não, `false` | — |
| `is_factor_overridden` | `boolean` | não, `false` | — |
| `is_price_overridden` | `boolean` | não, `false` | — |
| `cost_amount` | `numeric(24,12)` | não | — |
| `notes` | `text` | sim | — |
| `created_at` | `timestamptz` | não | — |
| `updated_at` | `timestamptz` | não | — |

O `material_id` serve para referência. O snapshot é a fonte histórica.

## `quote_labor`

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `quote_revision_id` | `uuid` | não | FK |
| `line_order` | `integer` | não | >= 0 |
| `day_label` | `text` | não | — |
| `people` | `numeric(18,8)` | não, `0` | >= 0 |
| `work_hours_per_person` | `numeric(18,8)` | não, `0` | >= 0 |
| `travel_hours_per_person` | `numeric(18,8)` | não, `0` | >= 0 |
| `total_hours` | `numeric(18,8)` | não | calculado |
| `hourly_rate_snapshot` | `numeric(18,6)` | não | — |
| `cost_amount` | `numeric(24,12)` | não | — |
| `note` | `text` | sim | — |
| `created_at` | `timestamptz` | não | — |
| `updated_at` | `timestamptz` | não | — |

## `quote_subcontracts`

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `quote_revision_id` | `uuid` | não | FK |
| `line_order` | `integer` | não | >= 0 |
| `description` | `text` | não | — |
| `quantity` | `numeric(18,8)` | não, `0` | >= 0 |
| `unit` | `text` | não | — |
| `unit_price` | `numeric(18,6)` | não, `0` | >= 0 |
| `total_amount` | `numeric(24,12)` | não | calculado |
| `note` | `text` | sim | — |
| `created_at` | `timestamptz` | não | — |
| `updated_at` | `timestamptz` | não | — |

## `quote_equipment`

Mesma estrutura de `quote_subcontracts`, com:

```text
description
quantity
unit
unit_price
total_amount
note
```

A separação é útil porque equipamentos e subempreitadas poderão evoluir para módulos próprios.

## `quote_surcharges`

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `quote_revision_id` | `uuid` | não | FK |
| `line_order` | `integer` | não | ordem do Excel |
| `name` | `text` | não | — |
| `base_type` | `text` | não | lista fechada |
| `base_amount_used` | `numeric(24,12)` | não | snapshot |
| `rate` | `numeric(9,6)` | não | 0–1 |
| `amount` | `numeric(24,12)` | não | — |
| `explanation` | `text` | sim | — |
| `includes_previous` | `boolean` | não, `false` | explícito |
| `is_base_overridden` | `boolean` | não, `false` | — |
| `created_at` | `timestamptz` | não | — |
| `updated_at` | `timestamptz` | não | — |

A base calculada e a ordem devem ser persistidas para a revisão.

## `quote_settings`

Tabela de defaults atuais.

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `currency` | `char(3)` | não, `CHF` | — |
| `default_hourly_rate` | `numeric(18,6)` | não | >= 0 |
| `default_margin_rate` | `numeric(9,6)` | não | 0–1 |
| `default_commercial_discount_rate` | `numeric(9,6)` | não | 0–1 |
| `default_skonto_rate` | `numeric(9,6)` | não | 0–1 |
| `default_fixed_deduction` | `numeric(18,6)` | não, `0` | >= 0 |
| `effective_from` | `timestamptz` | não | — |
| `effective_to` | `timestamptz` | sim | — |
| `updated_by` | `uuid` | não | FK |
| `created_at` | `timestamptz` | não | — |
| `updated_at` | `timestamptz` | não | — |

Não deve ser usado JSON para estes defaults, porque são campos financeiros conhecidos e precisam de constraints.

## `quote_status_history`

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `id` | `uuid` | não | PK |
| `quote_id` | `uuid` | não | FK |
| `from_status` | `text` | sim | — |
| `to_status` | `text` | não | — |
| `actor_id` | `uuid` | não | FK `profiles` |
| `note` | `text` | sim | — |
| `created_at` | `timestamptz` | não | append-only |

Índice:

```text
quote_id, created_at
```

## `quote_number_counters`

| Campo | Tipo | Null/default | Regras |
|---|---|---|---|
| `year` | `smallint` | não | PK |
| `next_value` | `integer` | não | > 0 |
| `updated_at` | `timestamptz` | não | — |

A geração deverá usar transação e lock.

## Entidades futuras

**PROPOSTA, NÃO MVP**

Quando forem aprovadas as regras de sistemas/receitas:

```text
material_systems
material_system_components
```

Seriam adequadas para:

- Wecryl 333;
- catalisadores;
- WeTraffic com bauxite;
- R230 com tela;
- sistemas de várias camadas.

Não recomendo introduzi-las antes de as regras técnicas estarem confirmadas.

---

# I. Relações

```text
auth.users
    1 ─── 1 profiles

profiles
    1 ─── N clients
    1 ─── N quotes
    1 ─── N material_price_versions
    1 ─── N quote_revisions
    1 ─── N quote_status_history

clients
    1 ─── N quotes

quotes
    1 ─── N quote_revisions
    1 ─── N quote_status_history
    0 ─── N quotes duplicados

quote_revisions
    1 ─── 1 quote_settings_snapshots
    1 ─── N quote_materials
    1 ─── N quote_labor
    1 ─── N quote_subcontracts
    1 ─── N quote_equipment
    1 ─── N quote_surcharges

materials
    1 ─── N material_packages

material_packages
    1 ─── N material_price_versions

materials
    1 ─── N quote_materials

material_packages
    1 ─── N quote_materials
```

Os FKs de `quote_materials` são referências auxiliares.

A identidade histórica da linha é o snapshot, não o catálogo atual.

---

# J. Snapshot strategy

## Materiais

**PROPOSTA OBRIGATÓRIA**

Ao adicionar um material a um orçamento, copiar para `quote_materials`:

- marca;
- produto;
- variante;
- grupo de preço;
- tipo;
- embalagem;
- quantidade da embalagem;
- unidade;
- consumo;
- unidade de consumo;
- regra de consumo;
- preço base;
- preço com desconto;
- taxa de desconto;
- preço utilizado;
- origem do preço;
- flags de override;
- notas relevantes;
- referência da fonte.

O `material_id` pode continuar associado.

## Preços

Um orçamento existente nunca deve fazer join dinâmico ao preço atual para recalcular valores históricos.

O catálogo pode mudar:

```text
hoje: CHF 20/kg
daqui a seis meses: CHF 24/kg
```

Mas a revisão histórica deve continuar com:

```text
preço snapshot = CHF 20/kg
```

## Configurações

Ao criar ou recalcular uma revisão, guardar:

- preço/hora;
- margem desejada;
- desconto comercial;
- skonto;
- dedução fixa;
- moeda;
- versão do motor de cálculo.

Alterar `quote_settings` apenas afeta novos drafts ou uma ação explícita de atualização.

## Revisões

**PROPOSTA**

- draft pode ser editado;
- revisão enviada fica bloqueada;
- editar depois de enviada cria nova revisão draft;
- a revisão anterior continua disponível;
- o PDF enviado aponta para uma revisão imutável;
- o preço e a margem do documento enviado não mudam retroativamente.

## Duplicação

Ao duplicar um orçamento:

- criar novo `quote`;
- criar nova revisão draft;
- copiar os snapshots;
- guardar `duplicated_from_quote_id`;
- manter os valores anteriores por defeito;
- oferecer ação explícita “atualizar preços do catálogo”.

Não atualizar preços silenciosamente ao duplicar.

---

# K. Arquitetura do `/backoffice`

## Estrutura recomendada

**PROPOSTA**

```text
src/app/
├── (de)/
├── (pt)/
├── (backoffice)/
│   ├── layout.tsx
│   └── backoffice/
│       ├── login/
│       │   └── page.tsx
│       ├── recuperar-password/
│       │   └── page.tsx
│       ├── alterar-password/
│       │   └── page.tsx
│       └── (protected)/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── orcamentos/
│           │   ├── page.tsx
│           │   ├── novo/
│           │   │   └── page.tsx
│           │   └── [id]/
│           │       ├── page.tsx
│           │       └── revisoes/
│           │           └── [revisionId]/
│           │               └── page.tsx
│           ├── clientes/
│           │   ├── page.tsx
│           │   └── [id]/
│           │       └── page.tsx
│           ├── materiais/
│           │   ├── page.tsx
│           │   └── [id]/
│           │       └── page.tsx
│           └── configuracoes/
│               └── page.tsx
```

Route groups não alteram o URL público. Assim, `(backoffice)/backoffice/page.tsx` continua a gerar:

```text
/backoffice
```

A documentação oficial do Next.js confirma este uso de route groups e layouts: [Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) e [Layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout).

## `/backoffice` versus `/backoffice/dashboard`

**PROPOSTA**

Usar diretamente:

```text
/backoffice
```

como dashboard.

Não é necessário introduzir:

```text
/backoffice/dashboard
```

a menos que surja uma necessidade real de separar uma homepage operacional de um dashboard analítico.

## Layouts

O layout do backoffice deverá:

- criar o seu próprio `<html>` e `<body>`;
- importar CSS interno separado;
- ter navegação interna;
- não usar `DocumentShell` público;
- não importar `SiteHeader`;
- não importar o landing page;
- não carregar animações públicas desnecessárias;
- incluir navegação por role.

A passagem entre website público e backoffice poderá causar full page load por serem root layouts distintos. Esse custo é aceitável e mantém isolamento.

## Proxy

Como o projeto usa Next.js 16, a convenção atual é `proxy.ts`, não `middleware.ts`. A documentação oficial descreve essa alteração em [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

**PROPOSTA**

Criar futuramente:

```text
src/proxy.ts
```

com matcher limitado a:

```text
/backoffice/:path*
/api/backoffice/:path*
```

O proxy poderá:

- atualizar cookies de sessão;
- redirecionar utilizadores não autenticados;
- facilitar UX de proteção.

Não deverá ser a única camada de autorização.

Todas as Server Actions e Route Handlers internos terão de verificar sessão e role no servidor.

---

# L. UX do criador de orçamento

## Estrutura

**PROPOSTA**

A página de criação deverá ser uma ferramenta de operação, não uma spreadsheet.

Secções:

1. Dados da obra
2. Cliente
3. Materiais
4. Mão de obra
5. Subempreitadas
6. Equipamento/outros
7. Custos diretos
8. Acréscimos
9. Preço e margem
10. Resumo

## Layout

Desktop:

```text
┌─────────────────────────────────────┬──────────────────────┐
│ Formulário principal                 │ Resumo sticky        │
│ Dados                                │ Custos diretos       │
│ Materiais                            │ Acréscimos           │
│ Mão de obra                          │ Custo total          │
│ Subempreitadas                       │ Preço recomendado    │
│ Equipamento                          │ Preço utilizado      │
│ Acréscimos                           │ Lucro                │
│ Preço                                │ Margem real          │
└─────────────────────────────────────┴──────────────────────┘
```

Mobile/tablet:

- linhas convertidas em cards;
- resumo colapsável;
- edição de uma linha por vez;
- ações de adicionar/remover acessíveis;
- sem depender de scroll horizontal excessivo.

## Cliente

**PROPOSTA**

- combobox com pesquisa;
- pesquisa por nome, email, telefone;
- possibilidade de criar cliente sem sair do orçamento;
- carregamento dos dados de contacto;
- cópia dos dados para o snapshot quando a revisão é criada;
- aviso se o cliente tiver orçamentos anteriores.

## Materiais

Ao selecionar um material, preencher automaticamente:

- marca;
- produto;
- variante;
- embalagem;
- unidade;
- consumo;
- preço;
- desconto;
- grupo de preço;
- notas;
- regra de cálculo.

A linha deverá mostrar claramente:

```text
valor do catálogo
valor usado
origem
override ativo
```

## Campos automáticos

**PROPOSTA**

- produto;
- variante;
- marca;
- embalagem;
- preço atual;
- desconto de catálogo;
- consumo recomendado;
- modo de cálculo;
- unidade;
- fator de área inicial.

## Campos editáveis

**PROPOSTA**

- etapa;
- ordem;
- descrição interna;
- embalagem selecionada;
- área/fator;
- consumo;
- quantidade;
- preço através de ação de override;
- notas;
- visibilidade futura no documento do cliente.

## Campos de override

**PROPOSTA**

Deverão ter flags explícitas:

```text
is_consumption_overridden
is_factor_overridden
is_price_overridden
```

O utilizador deve ver uma indicação como:

```text
Preço do catálogo
Preço ajustado manualmente
Consumo recomendado
Consumo ajustado manualmente
```

## Materiais especiais

A UX deverá impedir cálculos aparentemente automáticos quando a regra não existe:

- Wekat 900: pedir dosagem manual ou sistema técnico;
- Wecryl 810: pedir espessura e área preenchida;
- Wecryl 333: pedir sistema/proporção aprovada;
- WeVlies: pedir fator de sobreposição/desperdício;
- R230: perguntar se inclui tela;
- WMP: perguntar se aplica VOC.

## Autosave

**PROPOSTA**

- drafts persistidos automaticamente;
- indicador “guardado há X segundos”;
- debounce de escrita;
- save manual disponível;
- `lock_version` para impedir sobrescrever alterações de outra sessão;
- aviso em caso de conflito.

Os cálculos devem ser instantâneos no browser, mas o servidor deve recalcular antes de persistir ou emitir.

## Avisos

Exemplos:

- cliente sem email;
- área vazia;
- preço manual abaixo do custo;
- margem real abaixo da desejada;
- material sem preço;
- material sem consumo;
- embalagem insuficiente;
- base de acréscimo cumulativa;
- preço manual ativo;
- taxa fora do intervalo;
- cálculo baseado numa regra aproximada;
- catálogo desatualizado;
- preço de origem sem validade definida.

## Resumo

Indicadores recomendados:

```text
Materiais
Mão de obra
Subempreitadas
Equipamento
Custos diretos
Acréscimos
Custo total
Preço recomendado
Preço manual
Preço utilizado
Valor líquido
Lucro
Margem real
Custo/m²
Valor líquido/m²
Lucro/m²
Horas totais
Valor líquido/hora
```

Os indicadores internos devem ser visíveis apenas a roles autorizadas.

---

# M. Auth + RLS

## Avaliação de Supabase

**PROPOSTA**

Supabase é adequado neste contexto porque combina:

- PostgreSQL gerido;
- Supabase Auth;
- Row Level Security;
- migrations;
- geração de tipos TypeScript;
- Storage futuro para PDFs;
- crescimento razoável para o volume esperado.

A integração deverá ser feita com `@supabase/ssr`, usando cookies para autenticação server-side, conforme a documentação oficial de SSR do Supabase: [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side).

A documentação oficial também suporta migrations locais e geração de tipos:

- [Database migrations](https://supabase.com/docs/guides/local-development/database-migrations)
- [Generated TypeScript types](https://supabase.com/docs/guides/api/rest/generating-types)

## Login

**PROPOSTA**

Inicialmente:

- login com email/password;
- sem signup público;
- utilizador inicial criado/invitado administrativamente;
- logout;
- recuperação de password;
- alteração de password;
- possibilidade futura de MFA.

O fluxo de recuperação deve responder de forma genérica, sem revelar se um email existe. A documentação de passwords do Supabase cobre login e reset: [Supabase Passwords](https://supabase.com/docs/guides/auth/passwords).

## Sessão server-side

**PROPOSTA**

- cliente browser apenas para interações necessárias;
- cliente server para páginas e mutations;
- `getUser()` no servidor para verificar a identidade;
- cookies seguros;
- páginas protegidas dinâmicas;
- evitar cache de respostas que dependam de sessão;
- `Cache-Control: private, no-store` onde aplicável.

O guia avançado do Supabase recomenda verificar o utilizador no servidor e ter cuidado com ISR/cache em páginas autenticadas: [Advanced Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/advanced-guide).

## Proteção de rotas

A proteção deverá existir em três níveis:

1. proxy para redirecionamento e refresh de sessão;
2. layout protegido server-side;
3. verificação individual em Server Actions e Route Handlers.

Nunca confiar apenas no proxy.

## Roles

### `admin`

- acesso total;
- gerir utilizadores;
- gerir materiais;
- gerir preços;
- gerir configurações;
- consultar todos os clientes e orçamentos;
- arquivar;
- emitir;
- gerir estados.

### `employee`

- consultar clientes;
- criar e editar clientes;
- criar e editar drafts;
- duplicar orçamentos;
- consultar materiais;
- usar o catálogo;
- marcar como ready;
- não gerir roles;
- não alterar configurações globais sem permissão;
- não apagar histórico.

### `read_only`

- consultar informação autorizada;
- sem mutations;
- eventual ocultação de margem, lucro e custo interno.

O RBAC avançado com claims pode ser introduzido mais tarde; para a primeira versão, uma role em `profiles` é mais simples. A documentação de custom claims/RBAC do Supabase está em [Custom Claims and RBAC](https://supabase.com/docs/guides/auth/custom-claims-and-role-based-access-control-rbac).

## RLS

**PROPOSTA OBRIGATÓRIA**

Ativar RLS em todas as tabelas expostas.

Políticas mínimas:

- `anon`: sem acesso às tabelas internas;
- `authenticated`: acesso condicionado à role;
- `admin`: acesso completo;
- `employee`: acesso operacional limitado;
- `read_only`: apenas SELECT;
- perfis não podem alterar a própria role;
- um utilizador não pode promover outro para admin sem autorização.

A documentação oficial recomenda RLS em todas as tabelas expostas e políticas separadas por operação: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## `service_role`

A `SUPABASE_SERVICE_ROLE_KEY`:

- nunca pode estar no browser;
- nunca pode estar num componente client;
- nunca pode estar num bundle público;
- deve existir apenas em contexto server;
- deve ser evitada para operações normais quando RLS é suficiente.

A service role ignora RLS, segundo a documentação oficial de RLS.

## Políticas filhas

As linhas de:

- `quote_materials`;
- `quote_labor`;
- `quote_subcontracts`;
- `quote_equipment`;
- `quote_surcharges`;

devem ser autorizadas através de:

```text
quote_revision → quote
```

Não basta proteger apenas a tabela principal.

## Cache

**RISCO ALTO**

Respostas autenticadas não podem ser servidas por cache público.

Especialmente:

- `/backoffice/*`;
- `/api/backoffice/*`;
- respostas com cookies;
- Server Actions que devolvem dados internos.

## Segurança adicional

- validação Zod server-side;
- allowlist de campos;
- rejeitar mass assignment;
- queries parametrizadas;
- UUIDs opacos;
- quote number não é segredo;
- não expor dados internos em metadata;
- notas tratadas como texto, não HTML;
- escape automático no React;
- sanitização adicional se um dia for aceite rich text;
- validação de Origin/CSRF em Route Handlers com mutações;
- rate limiting para login e mutations sensíveis;
- logs sem preços internos ou PII desnecessária;
- audit log para alterações críticas.

---

# N. Motor de cálculo TypeScript

## Separação

**PROPOSTA**

O motor deve ser independente de:

- React;
- Next.js;
- Supabase;
- Server Actions;
- browser;
- componentes;
- persistência.

Estrutura conceptual:

```text
src/domain/quotes/
├── types.ts
├── validation.ts
├── material-cost.ts
├── labor-cost.ts
├── surcharge-cost.ts
├── pricing.ts
├── quote-totals.ts
└── warnings.ts
```

## Tipos

```ts
type DecimalString = string

type MaterialMode =
  | "per_m2"
  | "fixed"
  | "manual"
  | "per_m2_per_mm"
  | "mixture"

type SurchargeBase =
  | "subcontracts"
  | "materials"
  | "labor"
  | "equipment"
  | "labor_plus_equipment"
  | "direct_costs"
  | "direct_costs_plus_previous"

interface QuoteSettingsSnapshot {
  currency: "CHF"
  hourlyRate: DecimalString
  desiredMarginRate: DecimalString
  commercialDiscountRate: DecimalString
  skontoRate: DecimalString
  fixedDeduction: DecimalString
}

interface QuoteMaterialInput {
  mode: MaterialMode
  area: DecimalString
  consumption: DecimalString
  quantity: DecimalString
  factor: DecimalString
  unitPrice: DecimalString
  isConsumptionOverridden: boolean
  isFactorOverridden: boolean
  isPriceOverridden: boolean
}

interface LaborLineInput {
  people: DecimalString
  workHoursPerPerson: DecimalString
  travelHoursPerPerson: DecimalString
  hourlyRate: DecimalString
}

interface QuoteTotals {
  materials: DecimalString
  labor: DecimalString
  subcontractors: DecimalString
  equipment: DecimalString
  directCosts: DecimalString
  surcharges: DecimalString
  totalCost: DecimalString
  recommendedGross: DecimalString
  grossUsed: DecimalString
  netPrice: DecimalString
  profit: DecimalString
  actualMarginRate: DecimalString
  totalHours: DecimalString
  netPerM2: DecimalString
  profitPerM2: DecimalString
  netPerHour: DecimalString
}
```

## Funções puras

```text
calculateMaterialCost(...)
calculateLaborLine(...)
calculateLaborTotals(...)
calculateSubcontractLine(...)
calculateEquipmentLine(...)
calculateDirectCosts(...)
calculateSurchargeBase(...)
calculateSurcharges(...)
calculateRecommendedPrice(...)
calculateNetPrice(...)
calculateProfit(...)
calculateActualMargin(...)
calculateQuoteTotals(...)
```

## Precisão

**PROPOSTA**

Usar uma biblioteca Decimal no domínio financeiro futuro.

O fluxo deverá ser:

```text
input string
→ Decimal
→ cálculo
→ Decimal
→ string para persistência
→ formatador para UI
```

Não usar `number` para valores financeiros.

## Erros e warnings

As funções devem retornar erros/warnings explícitos:

```ts
interface CalculationWarning {
  code: string
  message: string
  severity: "info" | "warning" | "error"
  field?: string
}
```

Exemplos:

```text
MATERIAL_CONSUMPTION_MISSING
MATERIAL_PRICE_OVERRIDE
MANUAL_GROSS_BELOW_COST
FIXED_DEDUCTION_NOT_INCLUDED_IN_RECOMMENDED_PRICE
CUMULATIVE_SURCHARGE_BASE
NO_FIXED_CATALYST_DOSAGE
```

## Versão do motor

Cada revisão deverá guardar:

```text
formula_engine_version = "excel-v1"
```

Se a regra da dedução fixa for alterada no futuro:

```text
excel-v2
```

Orçamentos antigos continuam a interpretar-se com a versão original.

---

# O. Money e precisão

## PostgreSQL

**PROPOSTA**

Usar `numeric`, que representa números exatos no PostgreSQL: [PostgreSQL Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html).

Para CHF:

```text
numeric(18,6)
```

para inputs/preços.

Para resultados:

```text
numeric(24,12)
```

se os limites máximos do negócio justificarem essa precisão.

## JS

Evitar:

```ts
0.1 + 0.2
```

porque `number` usa floating point binário.

Não converter automaticamente `numeric` do PostgreSQL para `number`.

## Minor units

Minor units, como cêntimos, são adequadas para valores de pagamento fixos.

Aqui existem:

- percentagens;
- consumos;
- quantidades;
- multiplicações;
- divisões;
- cálculo de margem;
- ausência de arredondamento intermédio.

Por isso, **PROPOSTA**:

- usar Decimal para o motor;
- usar `numeric` na base;
- arredondar para 2 casas apenas na apresentação/fatura/PDF;
- não usar apenas inteiros de cêntimos para todos os cálculos.

## Precisões sugeridas

```text
CHF input/preço: numeric(18,6)
CHF calculado: numeric(24,12)
kg/m²: numeric(18,8)
m²: numeric(18,8)
horas: numeric(18,8)
taxas: numeric(9,6)
margens: numeric(9,6)
```

São propostas iniciais, a validar com limites reais.

## Regra de arredondamento

**PROPOSTA**

- cálculo sem arredondamentos intermédios;
- display financeiro a 2 casas;
- mesma regra no resumo e no PDF;
- guardar valor exato;
- definir explicitamente half-up ou a convenção financeira aprovada;
- testar valores exatamente a meio de um cêntimo.

---

# P. Testing strategy

## Unit tests

Cobrir:

- material por m²;
- material fixo;
- material com área zero;
- consumo zero;
- quantidade fixa;
- mão de obra com deslocação;
- várias pessoas;
- preço/hora zero;
- subempreitadas;
- equipamento;
- todas as bases de acréscimos;
- acréscimos cumulativos;
- ordem de acréscimos;
- desconto comercial;
- skonto;
- dedução fixa;
- margem zero;
- margem próxima de 100%;
- taxas inválidas;
- preço manual vazio;
- preço manual zero;
- preço manual abaixo do custo;
- lucro negativo;
- área zero;
- horas zero;
- divisão protegida.

## Golden tests contra o Excel

Criar um fixture versionado:

```text
fixtures/excel-v1/zofingen-example.json
```

Contendo:

- inputs;
- linhas de materiais;
- linhas de mão de obra;
- subempreitadas;
- equipamento;
- acréscimos;
- resultados de cada linha;
- subtotais;
- preço recomendado;
- preço manual;
- líquido;
- lucro;
- margem;
- indicadores.

Comparar:

1. valores exatos Decimal sem arredondamento;
2. valores apresentados a duas casas;
3. resultados de cada etapa;
4. comportamento do override;
5. branch `Fixo`;
6. branch cumulativo.

Não carregar o Excel em runtime da aplicação. O Excel serve para produzir fixtures de referência.

## Cobertura adicional necessária

**AMBIGUIDADE**

São necessários pelo menos dois casos reais adicionais para testar:

- outra área;
- outros materiais;
- preço manual ausente;
- dedução fixa diferente de zero;
- outras bases;
- linhas fixas não nulas;
- margens diferentes.

## Integration tests

Testar:

- criar cliente;
- criar draft;
- guardar linhas;
- guardar snapshot;
- reabrir;
- alterar catálogo;
- confirmar que o orçamento não mudou;
- alterar settings;
- confirmar que a revisão não mudou;
- duplicar orçamento;
- autosave;
- conflitos de `lock_version`.

## RLS/Auth tests

Testar com utilizadores reais de teste:

- anon não acede;
- user sem sessão não acede;
- `read_only` não altera;
- `employee` não gere roles;
- `employee` não altera settings se não autorizado;
- `admin` acede;
- child rows não podem ser acedidas fora da quote;
- não é possível autoelevar role;
- service role não é usada no browser.

A documentação de RLS recomenda testes específicos, incluindo pgTAP.

## E2E

Fluxo principal:

```text
login
→ criar cliente
→ criar orçamento
→ adicionar material
→ confirmar cálculo
→ guardar
→ sair
→ voltar a entrar
→ reabrir orçamento
→ verificar snapshot
```

Também:

```text
URL direta sem sessão
logout
password recovery
public /
public /pt
public /api/contact
robots
sitemap
```

## Regressão pública

Depois de implementação futura, confirmar:

- `/` intacto;
- `/pt` intacto;
- SEO intacto;
- Resend intacto;
- sitemap apenas público;
- backoffice ausente do sitemap;
- backoffice ausente dos resultados de indexação;
- nenhum secret no browser;
- bundle público sem cliente Supabase interno;
- Netlify preview com sessão e cookies corretos.

---

# Q. Roadmap futuro

## B0 — Fecho da auditoria e decisões

Antes de código:

- confirmar margem versus markup;
- decidir dedução fixa;
- decidir embalagem versus consumo;
- clarificar catalisadores;
- clarificar VOC;
- clarificar IVA/transporte;
- obter mais dois casos reais;
- confirmar estados;
- confirmar numbering;
- confirmar roles;
- confirmar idioma;
- confirmar política de revisão.

## B1 — Foundation e Auth

- route group interno;
- root layout separado;
- Supabase local;
- migrations;
- profiles;
- login;
- recovery;
- logout;
- RLS inicial;
- nenhum impacto público.

## B2 — Catálogo de materiais

- normalizar os 28 registos dos prints;
- criar materiais;
- criar embalagens;
- criar versões de preço;
- guardar fonte e data;
- validar preço por unidade e embalagem;
- não inserir regras técnicas não confirmadas.

## B3 — Clientes

- CRUD;
- pesquisa;
- archive;
- validação;
- histórico de orçamentos;
- permissões.

## B4 — Motor de cálculo

- Decimal;
- tipos de domínio;
- funções puras;
- `excel-v1`;
- golden fixture do caso existente;
- casos adicionais após receção.

## B5 — Persistência de orçamentos

- quotes;
- revisions;
- snapshots;
- linhas;
- settings snapshot;
- status history;
- numbering;
- optimistic concurrency.

## B6 — Editor de orçamento

- formulário por secções;
- autocomplete;
- catálogo;
- overrides;
- warnings;
- resumo sticky;
- autosave;
- responsividade.

## B7 — Lifecycle e histórico

- draft;
- ready;
- sent;
- accepted/rejected;
- archived;
- revisão imutável;
- duplicação;
- permissões por estado.

## B8 — PDF e email

- documento customer-facing;
- exclusão de margem/lucro/custos internos;
- PDF versionado;
- storage;
- envio por email;
- registo da revisão enviada.

## B9 — Hardening e lançamento

- RLS completo;
- pgTAP;
- E2E;
- regressão pública;
- análise de bundle;
- cache;
- logging;
- backups;
- Netlify preview;
- deploy controlado.

## Evolução posterior

Só depois do MVP estabilizado:

```text
stock
fornecedores
compras
obras em curso
consumos reais
despesas reais
orçamento versus real
faturação
rentabilidade por obra
CRM
documentos
```

---

# R. Lifecycle proposto

## Estados

**PROPOSTA**

```text
draft
ready
sent
accepted
rejected
archived
```

Uso:

- `draft`: incompleto ou em edição;
- `ready`: validado internamente;
- `sent`: revisão entregue ao cliente;
- `accepted`: cliente aceitou;
- `rejected`: cliente recusou;
- `archived`: encerrado administrativamente.

Se `accepted` e `rejected` não forem necessários na primeira versão, podem ser introduzidos mais tarde.

## Transições

```text
draft → ready
ready → sent
sent → accepted
sent → rejected
draft/ready/sent/rejected → archived
```

Não permitir alterações silenciosas a uma revisão `sent`.

## Edição depois de enviado

**PROPOSTA**

```text
revisão enviada v1 bloqueada
→ criar v2 draft
→ editar
→ recalcular
→ emitir v2
```

## Delete

**PROPOSTA**

- quotes: nunca hard delete operacional;
- clients: archive;
- materials: deactivate;
- prices: terminar validade;
- revisões emitidas: imutáveis;
- histórico: append-only.

---

# S. Numeração

**CONFIRMADO PELO EXCEL**

Não existe uma convenção preenchida no Excel.

A célula `H6` está vazia e não há fórmula de numeração.

## Proposta

```text
2026-0001
2026-0002
```

ou:

```text
CP-2026-0001
CP-2026-0002
```

Isto é apenas **PROPOSTA**.

A geração deverá:

- usar contador anual transacional;
- bloquear a linha do ano;
- não usar `MAX()+1`;
- aceitar gaps;
- nunca reutilizar números;
- impedir duplicados com constraint unique.

**AMBIGUIDADE**

Falta decidir se o número é atribuído:

- ao criar o primeiro draft;
- ao passar para `ready`;
- ao emitir para o cliente.

Recomendo atribuí-lo quando o orçamento é persistido como documento operacional, mesmo que ainda draft, para facilitar referências internas.

---

# T. Separação entre costing interno e documento do cliente

**PROPOSTA OBRIGATÓRIA**

O cálculo interno pode conter:

- custos diretos;
- preço/hora;
- custos de materiais;
- acréscimos;
- margem;
- lucro;
- overrides;
- indicadores de rentabilidade.

O documento do cliente poderá conter:

- descrição do trabalho;
- quantidades comerciais;
- preço final;
- condições;
- validade;
- IVA, quando aplicável;
- prazo;
- exclusões;
- informação de contacto.

O cliente não deverá receber:

- margem;
- lucro;
- custo/hora;
- acréscimos internos;
- custo real de materiais;
- notas internas.

**PROPOSTA**

A revisão deverá servir como fonte imutável, mas o renderer customer-facing deve selecionar explicitamente os campos permitidos.

Se o documento comercial tiver linhas diferentes do costing interno, criar posteriormente:

```text
quote_customer_lines
```

em vez de reutilizar cegamente as linhas internas.

---

# U. Integração com o website público

## Não interferência

**PROPOSTA**

- manter `(de)` e `(pt)` sem alterações conceptuais;
- criar root layout isolado para backoffice;
- CSS interno separado;
- componentes internos separados;
- imports Supabase apenas em código interno;
- APIs internas com prefixo `/api/backoffice`;
- não alterar `/api/contact`;
- não misturar lógica de clientes/orçamentos com `src/lib/resend.ts`;
- manter sitemap exclusivamente público;
- excluir `/backoffice` do robots;
- não incluir links públicos para backoffice por defeito;
- proteger o backoffice mesmo que o URL seja conhecido.

## Bundle

O App Router faz code splitting por rota, mas a separação deve ser reforçada arquiteturalmente:

- não importar componentes públicos pesados no backoffice;
- não importar componentes internos no landing page;
- não criar um provider global Supabase no root público;
- não colocar dados de clientes em `siteConfig`;
- não passar dados internos para componentes client públicos.

---

# V. Riscos técnicos ordenados

## Críticos

### 1. Ground truth insuficiente

Existe apenas uma obra completa/semicompleta.

Sem mais exemplos, não é possível afirmar que todas as regras reais do negócio estão representadas.

### 2. Regras técnicas dos materiais incompletas

Catalisadores, misturas, espessuras, desperdícios e taxas podem produzir custos errados se forem automatizados sem decisão.

### 3. Falha de Auth/RLS/cache

Uma configuração incorreta poderia expor:

- clientes;
- preços;
- margens;
- lucros;
- documentos internos.

### 4. Perda do histórico

Se o orçamento fizer joins vivos ao catálogo ou às configurações atuais, preços históricos mudarão.

O snapshot é obrigatório.

## Altos

### 5. Floats JavaScript

Pode provocar divergências entre UI, base de dados, PDF e Excel.

### 6. Fórmula da dedução fixa

A recomendação atual não compensa `B73`.

### 7. Bases de acréscimos inválidas

O fallback silencioso pode gerar um custo incorreto sem erro visível.

### 8. Override manual

Preço manual zero, consumo alterado ou preço antigo podem passar despercebidos.

### 9. Concorrência

Autosave em duas abas pode perder alterações sem `lock_version`.

### 10. Edição após envio

Sem revisões imutáveis, o documento enviado pode deixar de ser auditável.

### 11. Separação customer/internal

Um PDF criado a partir do objeto errado pode revelar margem ou custos.

### 12. Cache Netlify

Respostas autenticadas mal configuradas podem ser cacheadas indevidamente.

## Médios

### 13. Privacidade

O sistema passará a guardar PII de clientes. É necessário decidir retenção, acesso e política de privacidade.

### 14. Qualidade do catálogo

Os prints não substituem fichas técnicas nem confirmação dos preços atuais.

### 15. Localização

É necessário decidir idioma, moeda, formato de data e timezone.

### 16. Stock futuro

O modelo não deve assumir que custo consumido é sempre igual ao custo de uma embalagem completa.

### 17. PDF comercial

O documento para o cliente provavelmente terá regras diferentes das regras de costing interno.

### 18. Dependência de fornecedor

Supabase é adequado, mas exige decisão sobre região, backups, disponibilidade, custos e requisitos contratuais.

---

# W. Perguntas para decisão humana

Estas são as decisões que considero realmente necessárias antes da implementação.

1. A margem de `10,69%` significa margem sobre o preço líquido de venda, como a fórmula atual indica, ou pretendem markup sobre custo?

2. A dedução fixa deve ser compensada no preço recomendado para preservar a margem desejada?

3. Os materiais devem ser custeados pela quantidade consumida ou pelo número de embalagens completas necessárias?

4. Podem ser fornecidos mais dois orçamentos Excel preenchidos para criar uma base de golden tests real?

5. Qual é a regra aprovada para:
   - Wekat 900;
   - catalisador do Wecryl 333;
   - WeTraffic 496 BX;
   - sobreposição/desperdício WeVlies;
   - espessura do Wecryl 810;
   - tela do R230;
   - taxa VOC do WMP 113?

6. IVA, transporte e outras taxas devem ser adicionados ao costing, ao preço do cliente, ou a ambos?

7. O desconto de 18% dos materiais é:
   - preço atual de compra;
   - desconto comercial de catálogo;
   - default editável;
   - valor que deve aparecer no orçamento?

8. Quando deve ser atribuído o número do orçamento: criação do draft, `ready` ou envio?

9. A convenção proposta `YYYY-NNNN` é aceitável, ou preferem `CP-YYYY-NNNN`?

10. Um orçamento enviado deve ser editado através de nova revisão obrigatória?

11. O primeiro utilizador será criado manualmente como `admin`, sem signup público?

12. Um `employee` poderá editar catálogo, configurações e marcar orçamentos como `sent`?

13. O backoffice será apenas em português, apenas em alemão, ou bilingue?

14. Quais campos devem aparecer no PDF entregue ao cliente?

15. Devem existir validade da proposta, condições de pagamento e prazo de execução já na primeira versão?

---

# Conclusão

O projeto público está tecnicamente saudável e não contém atualmente infraestrutura de backoffice, base de dados ou autenticação.

O Excel contém um motor funcional e relativamente pequeno, mas com limitações importantes:

- apenas uma obra preenchida;
- nenhuma persistência histórica;
- ausência de catálogo ligado;
- ausência de regras de embalagem;
- validações fracas;
- fallback silencioso em bases de acréscimos;
- possível problema na dedução fixa;
- uso de floats;
- regras técnicas dos materiais incompletas.

A arquitetura recomendada é:

```text
website público isolado
+
root layout próprio do backoffice
+
Supabase Auth/PostgreSQL/RLS
+
catálogo versionado
+
snapshots imutáveis
+
revisões de orçamento
+
motor Decimal puro e testável
+
separação entre costing interno e documento do cliente
```

A implementação não deve começar até serem decididas, pelo menos, as ambiguidades da secção W e obtidos mais casos reais para validação matemática.

**Paro aqui, conforme solicitado.**
