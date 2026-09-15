# Setup do Backoffice CP Peixoto

Esta V1 usa Supabase Auth (email/password) e Supabase PostgreSQL. O website público não precisa de Supabase para compilar nem para funcionar.

## 1. Criar o projeto Supabase

1. Criar um projeto novo no painel do Supabase.
2. Em **Project Settings → API**, copiar:
   - **Project URL**;
   - **Publishable key** (ou a chave `anon` legada, se o projeto ainda a apresentar).
3. Em **Authentication → Providers**, confirmar que **Email** está ativo.
4. Não criar signup público na aplicação.

## 2. Configurar o ambiente local

Copiar `.env.example` para `.env.local` e preencher:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

A aplicação também aceita `NEXT_PUBLIC_SUPABASE_ANON_KEY` como fallback para projetos que ainda usam a nomenclatura antiga.

Nunca colocar `SUPABASE_SERVICE_ROLE_KEY` em `NEXT_PUBLIC_*` nem no browser. Esta V1 não precisa da service role key.

## 3. Aplicar as migrations

A partir da raiz do repositório, com a Supabase CLI autenticada e o projeto ligado:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

As migrations são aplicadas por ordem:

```text
supabase/migrations/202609150001_backoffice_mvp.sql
supabase/migrations/202609150002_seed_westwood_materials.sql
supabase/migrations/202609150003_quote_blank_financial_fields.sql
```

Se não quiser usar a CLI, executar os três ficheiros, pela mesma ordem, no SQL Editor do projeto Supabase. Não executar o seed antes da migration principal.

## 4. Criar o primeiro utilizador

No painel Supabase:

1. Abrir **Authentication → Users**.
2. Escolher **Add user → Create new user**.
3. Criar o email operacional e uma password forte.
4. Não é necessário criar uma tabela de perfis nesta V1.

Não existe signup público. Qualquer utilizador autenticado tem acesso completo nesta primeira versão, conforme as policies RLS.

## 5. Testar localmente

Com as envs definidas:

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000/backoffice/login
```

Testar:

1. login;
2. lista e criação de clientes;
3. catálogo e edição/desativação de materiais;
4. novo orçamento;
5. pesquisa de `Wecryl`;
6. seleção de material e edição de overrides;
7. linhas de mão de obra, subempreitada e equipamento;
8. acréscimos;
9. guardar;
10. reabrir a partir da lista.

## 6. Configurar a Netlify

No site Netlify, em **Site configuration → Environment variables**, adicionar as mesmas duas variáveis para os contextos usados no deploy:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Depois executar um novo deploy. Não adicionar a service role key ao frontend.

## 7. Configuração de produção do Auth

No Supabase, em **Authentication → URL Configuration**:

- adicionar `https://cp-peixoto.ch` como Site URL, se for o domínio principal;
- adicionar `https://cp-peixoto.ch/backoffice` ou a origem correspondente em Redirect URLs quando necessário pelos fluxos de Auth.

O login desta V1 usa sessão por cookie SSR e não depende de redirects externos para o login normal.

## 8. Verificação rápida de segurança

Confirmar no SQL Editor:

```sql
select relname, relrowsecurity
from pg_class
where relname in (
  'clients',
  'materials',
  'quotes',
  'quote_materials',
  'quote_labor',
  'quote_subcontracts',
  'quote_equipment',
  'quote_surcharges',
  'quote_counters'
);
```

Todas as tabelas devem apresentar `relrowsecurity = true`.

O acesso anónimo deve devolver zero registos. O acesso autenticado usado pelo backoffice deve conseguir ler o catálogo e gravar através das Server Actions.
