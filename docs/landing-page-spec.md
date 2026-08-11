# Especificação inicial da landing page — CP Peixoto

## Estado atual

Esta fase cria apenas a fundação técnica do website institucional da CP Peixoto. A página pública é temporária e não implementa ainda o design final, componentes visuais ou formulário visível.

O conteúdo empresarial que ainda não foi confirmado deve permanecer como placeholder ou valor vazio. A configuração central encontra-se em `src/content/site.ts`.

## Direção visual futura

A referência visual prevista utiliza:

- preto, branco e dourado;
- fotografia em grande destaque;
- tipografia forte;
- composição premium e profissional;
- cards de serviços;
- secção before/after;
- CTAs fortes para pedido de orçamento.

Esta direção fica documentada para a próxima fase e não deve ser implementada durante a criação da fundação.

## Secções previstas

### 1. Header

Navegação principal, identificação da CP Peixoto e CTA para pedido de orçamento. Os itens de navegação devem vir da configuração central.

### 2. Hero

Mensagem principal sobre revestimentos, impermeabilizações e pavimentos decorativos, com fotografia de destaque e CTA principal. O texto final, região de atuação e contactos ainda precisam de confirmação.

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

Não implementar i18n nesta fase. Para facilitar a evolução, manter textos e dados empresariais em módulos de conteúdo/configuração e evitar espalhar copy diretamente pelos componentes. Numa fase posterior, o conteúdo pode ser organizado por locale (por exemplo, `pt-PT` e outros idiomas) sem reescrever a estrutura da aplicação.

## SEO e dados estruturados

A base inclui metadata, `robots.ts` e `sitemap.ts`, usando a configuração central. Antes do lançamento, devem ser definidos o domínio real e os dados locais confirmados.

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
