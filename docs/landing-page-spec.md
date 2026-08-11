# Especificação inicial da landing page — CP Peixoto

## Estado atual

A fundação técnica e a primeira fase visual estão concluídas. O website tem Header e Hero responsivos, design system base e conteúdo bilingue em alemão suíço e português. As restantes secções e o formulário visual continuam reservados para próximas iterações.

Os dados empresariais confirmados encontram-se em `src/content/site.ts`; o conteúdo localizado completo está em `src/content/de.ts` e `src/content/pt.ts`. O domínio continua pendente.

## Direção visual futura

A referência visual prevista utiliza:

- preto, branco e dourado;
- fotografia em grande destaque;
- tipografia forte;
- composição premium e profissional;
- cards de serviços;
- secção before/after;
- CTAs fortes para pedido de orçamento.

Esta direção orienta o Header e o Hero já implementados e deverá manter-se nas próximas secções.

## Secções previstas

### 1. Header

Implementado com logo oficial, navegação localizada, CTA, seletor DE/PT e menu mobile acessível.

### 2. Hero

Implementado com conteúdo real DE/PT, CTA para contacto e composição visual neutra preparada para receber posteriormente uma imagem estática local através de `next/image`.

### 3. Serviços

Apresentação das áreas de serviço, potencialmente incluindo revestimentos de pavimentos, impermeabilizações e pavimentos decorativos. Os dados devem ser modelados em conteúdo estruturado antes de serem apresentados em cards.

### 4. Antes / Depois

Galeria de referências com comparação antes/depois, contexto do trabalho e imagens autorizadas. Deve existir cuidado com consentimento e identificação de locais.

### 5. Benefícios / Porquê CP Peixoto

Razões verificáveis para escolher a empresa. Não adicionar promessas, certificações ou números sem confirmação.

### 6. Pedido de orçamento

Formulário com nome e pelo menos um meio de contacto, além de telefone, localização, serviço pretendido e mensagem. A API pública `POST /api/contact` valida os dados no servidor e envia o pedido para o endereço definido em `CONTACT_EMAIL_TO` através da Resend.

O formulário deverá incluir uma declaração de privacidade quando for implementado. O campo `website` existe apenas como honeypot técnico e não deve ser apresentado como conteúdo visível.

### 7. Contactos

Telefone, email, morada, região e ligações sociais apenas depois de a informação ser confirmada. Não inventar dados empresariais.

### 8. Footer

Informação institucional, contactos, navegação secundária, links legais e futura política de privacidade.

## Conteúdo e idiomas

Alemão suíço (`de-CH`) é o idioma principal em `/`; português (`pt-PT`) está disponível em `/pt`. Dicionários TypeScript tipados alimentam os mesmos componentes, sem duplicação da UI. O seletor preserva a âncora atual quando aplicável.

## SEO e dados estruturados

A base inclui metadata localizada, alternates/hreflang, `robots.ts` e `sitemap.ts` com `/` e `/pt`. Antes do lançamento deve ser definido o domínio real em `NEXT_PUBLIC_SITE_URL`.

A arquitetura deve permitir adicionar structured data Schema.org adequada a um negócio local/contractor quando existirem nome legal, área de atuação, contactos, morada e outras informações verificadas. Não adicionar schema com dados inventados nesta fase.

Não implementar analytics, trackers ou cookies de marketing nesta fase.

## Privacidade

O formulário irá processar dados pessoais como:

- nome;
- email;
- telefone;
- localização e serviço pretendido;
- mensagem.

Será necessária uma política de privacidade antes do lançamento público, incluindo informação sobre finalidade, base legal, conservação, destinatários e direitos. O envio para a Resend deve ser tratado nessa documentação.

## Segurança e operação

A API deve manter validação server-side, limites de tamanho, honeypot, segredo Resend apenas no servidor, respostas sem stack traces e logs sem conteúdo de mensagens ou PII.

Não há autenticação, CAPTCHA ou base de dados nesta fase. Rate limiting real deve ser avaliado antes do lançamento público e implementado através de uma solução adequada ao ambiente serverless, não através de um contador em memória.
