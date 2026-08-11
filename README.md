# CP Peixoto

Landing page bilingue da CP Peixoto para revestimentos de pavimentos, impermeabilizações e pavimentos decorativos. A página está implementada em alemão suíço (`/`) e português (`/pt`), com formulário de pedido de orçamento e Footer.

## Stack

- Next.js 16 com App Router
- React 19 e TypeScript strict
- Tailwind CSS 4 e ESLint
- Zod para validação
- Resend para entrega de pedidos de contacto
- Vitest
- `next/image` e `next/font`

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local
npm run dev
```

- Alemão suíço: `http://localhost:3000`
- Português: `http://localhost:3000/pt`

## Variáveis de ambiente

| Variável | Utilização |
| --- | --- |
| `RESEND_API_KEY` | Chave privada usada apenas no servidor para a Resend. |
| `RESEND_FROM_EMAIL` | Remetente do email; deve pertencer a um domínio verificado na Resend. |
| `CONTACT_EMAIL_TO` | Único destinatário dos pedidos. Em produção deverá ser `contactoxvstudio@gmail.com`. |
| `NEXT_PUBLIC_SITE_URL` | Origem HTTPS pública, sem barra final; usada por metadata, canonical, hreflang, `robots.txt` e sitemap. |

Não colocar valores reais no repositório. Localmente, sem `NEXT_PUBLIC_SITE_URL`, o website usa `http://localhost:3000` apenas para metadata de desenvolvimento. Os builds na Netlify exigem esta variável para evitar canonicals ou sitemaps com uma origem errada.

## Contact API

`POST /api/contact` aceita exclusivamente JSON com `name`, `email`, `phone`, `location`, `service`, `message` e o honeypot técnico `website`.

- `name`, `message` e pelo menos um entre `email` ou `phone` são obrigatórios.
- O schema é strict, tem limites por campo e limita o body a 16 KiB.
- O destinatário é configurado no servidor; nunca vem do browser.
- Emails válidos são usados como `replyTo`.
- Falhas de configuração ou entrega devolvem um erro genérico e não registam PII.

## SEO e acessibilidade

As rotas `/` e `/pt` têm metadata localizada, canonical, hreflang, Open Graph textual, `robots.txt`, sitemap e `lang` correto. O logo oficial é usado como ícone. A landing usa landmarks semânticos, labels de formulário, foco visível, skip link, sliders acessíveis por teclado e suporte a `prefers-reduced-motion`.

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Produção na Netlify

A Netlify deteta automaticamente projetos Next.js; este repositório não precisa de `netlify.toml` enquanto não houver regras específicas de build, redirects ou imagens remotas. O App Router, `next/image` com imagens locais e o Route Handler `POST /api/contact` são compatíveis com a integração atual de Next.js da Netlify.

Ao criar o projeto Netlify, configurar as quatro variáveis acima no contexto de produção. Usar o comando de build sugerido pela Netlify (`next build`) e deixar a integração atual do Next.js gerir as funções e imagens. Não instalar nem fixar o plugin legado `@netlify/plugin-nextjs`.

## Antes do lançamento público

1. Escolher e configurar o domínio final; definir `NEXT_PUBLIC_SITE_URL` com a origem HTTPS correta.
2. Criar uma página de Política de Privacidade aprovada juridicamente e só então adicionar o respetivo link no Footer.
3. Criar a chave de produção da Resend, verificar o domínio remetente, definir `RESEND_FROM_EMAIL` e `CONTACT_EMAIL_TO`, e testar um envio após deploy.
4. Criar o projeto Netlify, configurar as variáveis de ambiente e validar `/`, `/pt`, `/api/contact`, sitemap e robots no URL de preview.
5. Decidir e implementar rate limiting numa camada partilhada caso o volume/risco de spam o justifique. Não usar rate limiting em memória.
6. Rever o Open Graph visual quando existir uma imagem de partilha aprovada.

Não há analytics, pixels, cookie banner, CMS, base de dados, uploads ou redes sociais neste projeto.
