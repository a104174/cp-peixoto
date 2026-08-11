# CP Peixoto — landing page e produção

## Estado atual

A landing institucional está concluída funcionalmente em alemão suíço (`/`) e português (`/pt`). Mantém uma única composição partilhada e conteúdo tipado por dicionário.

Secções implementadas, por esta ordem:

1. Header com navegação, seletor DE/PT e menu mobile.
2. Hero com imagem estática local e CTA.
3. Serviços.
4. Referências com três comparadores antes/depois independentes.
5. Sobre nós.
6. Pedido de orçamento.
7. Footer.

## Direção visual

Preto/carvão, branco quente e dourado; tipografia Host Grotesk nos headings principais, Barlow Condensed no lockup e Manrope no corpo. A composição deve manter-se premium, arquitetónica, com bordas finas e sem elementos decorativos ou funcionalidades inventadas.

## Estrutura técnica

- `src/app/` contém App Router, layouts localizados, metadata, sitemap, robots e Contact API.
- `src/components/` contém a composição da landing, layouts e secções.
- `src/content/` contém dicionários DE/PT e a configuração empresarial central.
- `src/lib/` contém validação, ambiente server-only, metadata, fontes e Resend.
- `src/emails/` contém o template do pedido recebido.

As imagens são estáticas e locais em `public/images/`; o logo oficial está em `public/brand/`. Não há uploads, ficheiros submetidos por clientes nem infraestrutura de storage.

## Contacto

O formulário envia para `POST /api/contact` os campos `name`, `email`, `phone`, `location`, `service`, `message` e `website` (honeypot). Nome, mensagem e pelo menos um meio de contacto são obrigatórios. A validação client-side usa os mesmos limites que o schema Zod strict no servidor.

O Route Handler limita o body, rejeita JSON/propriedades inválidas e não aceita destinatários do browser. A Resend é usada apenas no servidor, com `replyTo` quando existe email. Erros de entrega são genéricos e sem logging de dados pessoais.

## Navegação, performance e acessibilidade

Os anchors `#start`, `#leistungen`, `#referenzen`, `#ueber-uns` e `#kontakt` são partilhados pelos idiomas e têm compensação para o Header sobreposto. O Hero é a única imagem preloaded; as restantes usam o lazy loading padrão de `next/image` e têm `sizes` responsivos. Apenas Header, formulário e comparadores before/after são Client Components por necessitarem de interação.

O documento inclui `header`, `main` e `footer`, skip link localizado, labels explícitos, focus-visible, alts localizados, sliders range operáveis por teclado, `touch-action: pan-y` e redução de movimento para utilizadores que a preferirem.

## SEO e configuração pública

Cada idioma define title, description, canonical, hreflang, Open Graph textual e `lang`. `robots.ts` e `sitemap.ts` publicam as duas rotas. A origem vem de `NEXT_PUBLIC_SITE_URL`; sem esta variável, desenvolvimento local usa `http://localhost:3000`. Builds Netlify requerem a origem final para impedir metadata pública incorreta.

Não há Schema.org nem imagem Open Graph própria: ambos aguardam dados e assets aprovados.

## Produção na Netlify

Não é necessária configuração adicional neste momento. A deteção de Next.js da Netlify suporta App Router, Route Handlers, imagens locais e variáveis de ambiente. Não adicionar `netlify.toml` ou o plugin legado apenas por precaução.

Antes do deploy, configurar `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL_TO` e `NEXT_PUBLIC_SITE_URL` nas environment variables do projeto Netlify. O domínio, a verificação do remetente Resend e o teste de entrega após deploy continuam pendentes.

## Blockers de lançamento

- Definir domínio e `NEXT_PUBLIC_SITE_URL`.
- Política de Privacidade aprovada para o processamento dos dados do formulário; só depois criar a página e o link no Footer.
- Configurar e verificar Resend em produção; testar envio real apenas após deploy controlado.
- Decidir se é necessário rate limiting partilhado para mitigar spam.
- Criar asset Open Graph aprovado, se for desejada uma pré-visualização visual em partilhas.

Não adicionar analytics, pixels, consentimento de cookies, redes sociais, CMS, base de dados ou novas páginas sem requisitos aprovados.
