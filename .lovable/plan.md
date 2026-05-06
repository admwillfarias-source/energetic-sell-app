# Instalar Google Tag Manager + eventos de conversão

O ID informado (`GTM-5JTRM2L`) é de um container do **Google Tag Manager**. A melhor prática é instalar o GTM no site e, dentro do GTM, configurar a tag de conversão do Google Ads (AW-XXXX) apontando para os eventos do dataLayer que o site dispara. Assim você não precisa mexer no código toda vez que mudar uma conversão.

## O que será feito

### 1. Instalar o GTM no app React (`index.html`)
- Adicionar o snippet `<script>` do GTM no `<head>` com `GTM-5JTRM2L`.
- Adicionar o `<noscript><iframe>` no início do `<body>` (fallback).
- Inicializar `window.dataLayer` antes do snippet.

### 2. Instalar o GTM no tema WordPress
- O tema `wp-theme/awr-baterias-fast` já tem um carregador lazy (`inc/perf-gtm.php`) que lê o ID do Customizer.
- Plano: setar `awrf_gtm_id = GTM-5JTRM2L` por padrão, ou o usuário configura em Customizer → AWR Fast.
- O tema `wp-theme/awr-baterias` (SPA) receberá o snippet direto no `index.php` (head + noscript no body).

### 3. Disparar eventos de conversão no dataLayer
Criar helper `src/lib/gtm.ts` com `pushEvent(name, payload)` e disparar:

| Evento dataLayer | Onde dispara | Uso no GTM |
|---|---|---|
| `lead_whatsapp` | clique no botão WhatsApp (Floating, Hero, MobileBar) | conversão "Lead WhatsApp" |
| `lead_call` | clique em link `tel:` | conversão "Ligação" |
| `begin_checkout` | abertura do `CheckoutDialog` | remarketing |
| `purchase` | página `/pedido-confirmado` (com `value` e `transaction_id` quando disponível) | conversão "Compra" |

### 4. Configuração no painel do GTM (passo a passo, fora do código)
Depois do deploy, no painel `tagmanager.google.com`:
1. Criar tag **Google Ads Conversion Tracking** com seu `AW-XXXX` + label.
2. Criar **Trigger** do tipo *Custom Event* com o nome do evento (ex.: `purchase`).
3. Publicar o container.

## Detalhes técnicos

- `index.html`: snippet GTM padrão (head + noscript), sem alterar CSP/headers.
- O GTM substitui a necessidade do bloco lazy em `inc/perf-gtm.php` quando estamos no app React puro; mantemos o lazy só no tema fast (já existe).
- `src/lib/tracking.ts` ganha implementação real para `trackLead` / `trackCall` empurrando para `window.dataLayer` (hoje é no-op).
- `src/pages/PedidoConfirmado.tsx`: push de `purchase` no mount, usando dados do pedido se existirem.

## Arquivos a alterar
- `index.html` (snippet GTM)
- `src/lib/gtm.ts` (novo helper)
- `src/lib/tracking.ts` (substituir no-ops por dataLayer push)
- `src/pages/PedidoConfirmado.tsx` (evento `purchase`)
- `src/components/CheckoutDialog.tsx` (evento `begin_checkout`)
- `wp-theme/awr-baterias/index.php` (snippet GTM no tema SPA do WP)

## O que você precisa me confirmar antes de implementar
1. Confirma que `GTM-5JTRM2L` é o container correto (do Google Tag Manager, não Google Ads direto)?
2. Quer que eu dispare os 4 eventos acima ou só `purchase` (pedido confirmado)?
3. Tem o `AW-XXXX` + label de conversão do Google Ads para eu deixar documentado, ou você mesmo configura dentro do GTM?
