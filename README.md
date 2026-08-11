# CP Peixoto

Fundação técnica para a futura landing page institucional da CP Peixoto, uma empresa de revestimentos, impermeabilizações e pavimentos decorativos. A primeira fase visual inclui um design system base, Header e Hero responsivos, com alemão suíço como idioma principal e português como alternativa. O projeto permanece preparado para deploy posterior na Vercel.

## Stack

- Next.js com App Router
- TypeScript em modo strict
- Tailwind CSS
- ESLint
- Resend
- Zod
- Vitest
- Dicionários TypeScript tipados para DE/PT
- npm

## Instalação

```bash
npm install
```

Cria `.env.local` a partir de `.env.example` e preenche as variáveis necessárias:

```bash
cp .env.example .env.local
```

### Variáveis de ambiente

| Variável | Utilização |
| --- | --- |
| `RESEND_API_KEY` | Chave privada usada exclusivamente no servidor para enviar emails. |
| `RESEND_FROM_EMAIL` | Remetente usado pela Resend. Deve ser um endereço, ou nome/endereço, num domínio autorizado. |
| `CONTACT_EMAIL_TO` | Único destinatário dos pedidos de contacto, definido no servidor. |
| `NEXT_PUBLIC_SITE_URL` | URL pública do website, usada na metadata, robots e sitemap. |

Antes de enviar emails em produção, `RESEND_FROM_EMAIL` deve utilizar um domínio autorizado/verificado na Resend. Não colocar credenciais reais no repositório.

## Desenvolvimento

```bash
npm run dev
```

A versão alemã fica disponível em [http://localhost:3000](http://localhost:3000) e a versão portuguesa em [http://localhost:3000/pt](http://localhost:3000/pt).

## Scripts

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## API de contacto

A fundação inclui `POST /api/contact`. O endpoint recebe JSON com `name`, `email`, `phone`, `location`, `service`, `message` e o honeypot técnico `website`. O nome e pelo menos um meio de contacto são necessários; os restantes campos têm limites de tamanho.

A API aceita apenas propriedades conhecidas, rejeita JSON inválido, payloads fora do schema e honeypots preenchidos. O destinatário nunca vem do browser. Quando existe um email válido, é enviado como `reply-to`.

Sem configuração válida da Resend, a API responde com um erro genérico de disponibilidade e não expõe detalhes internos.

## Estrutura relevante

- `src/app/` — App Router, layouts localizados, metadata, sitemap, robots e API.
- `src/components/` — Header, Hero e composição partilhada entre idiomas.
- `src/content/` — dicionários DE/PT e configuração tipada central do website.
- `src/emails/` — templates React para emails.
- `src/lib/` — environment server-side, Resend e validação Zod.
- `src/types/` — tipos partilhados do domínio.
- `tests/` — testes de valor imediato para a validação do contacto.
- `docs/landing-page-spec.md` — especificação do frontend futuro.

## Próxima fase

Antes do lançamento público será necessário definir o domínio, concluir as restantes secções visuais, adicionar imagens estáticas licenciadas, preparar a política de privacidade e decidir uma estratégia de rate limiting.
