## Estado atual vs. Passo 1

Boa notícia: **a maior parte do Passo 1 já está implementada** (foi feita em passos anteriores). Verifiquei:

- ✅ `index.html` **não tem** scripts síncronos de GTM/GA4/Ads no `<head>`. Só tem o stub de `dataLayer` + `gtag` + `gtag_report_conversion`.
- ✅ `src/lib/loadTracking.ts` já existe com `initDeferredTracking()` carregando GTM + GA4 + Ads via interação OU `requestIdleCallback` (timeout 4s / 3.5s fallback).
- ✅ `src/main.tsx` já chama `initDeferredTracking()` após o `createRoot().render(...)`.
- ✅ `<noscript>` do GTM já está no `<body>` do `index.html`.
- ❌ **Não existem** no projeto: `call-tracking_9.js`, `wcm/loader.js`, `~flock.js`. Esses scripts vinham do tema WordPress antigo e não fazem parte deste app React. **Não há nada para remover/diferir**.

Ou seja: o objetivo do Passo 1 (TBT alto causado por GTM/GA4/Ads síncronos) **já foi atingido na arquitetura atual**. Não faz sentido reescrever `loadTracking.ts` no formato do prompt — isso seria regressão (perderia o helper `gtag_report_conversion` que já redireciona corretamente, perderia o `pushEvent` integrado, e re-introduziria `console.log`s em produção).

## O que proponho fazer neste passo

Como o "carregar deferred" já está pronto, vou focar nas **2 melhorias reais** que ainda dão ganho de TBT no estado atual:

### 1. Acelerar gatilho idle (3.5s → 2s)
Hoje o tracking carrega no máx em 3.5s. Para Lighthouse mobile (que não simula interação), antecipar para 2s reduz a janela em que GTM concorre com hidratação React tardia, melhorando consistência do TBT medido. Mantém a lógica de "primeira interação dispara antes" intacta.

### 2. Garantir que GTM/GA não rodem durante a janela do LCP
Atualmente `requestIdleCallback` pode disparar **antes** do LCP em conexões rápidas. Vou adicionar uma trava: o tracking só carrega quando **(LCP já ocorreu) OU (interação) OU (timeout 2s)**, o que vier primeiro. Implementação: escutar o `PerformanceObserver` de `largest-contentful-paint` e marcar uma flag; o `idle` callback espera essa flag antes de injetar scripts. Isso é o que mais reduz TBT no Lighthouse.

### 3. Limpar `console.log` de tracking em produção
Não há logs hoje (já está limpo) — só vou confirmar.

### Arquivos afetados
- `src/lib/loadTracking.ts` — ajustar timeout para 2s e adicionar gate de LCP via `PerformanceObserver`.
- Nenhum outro arquivo precisa mudar.

### O que **não** vou fazer (e por quê)
- ❌ Não vou remover scripts de `index.html` — já foram removidos.
- ❌ Não vou criar `loadCallTracking/loadWebCM/loadFlock` — esses scripts não existem no projeto React (só existiam no tema WP).
- ❌ Não vou reescrever `loadTracking.ts` do zero no formato do prompt — perderia funcionalidade já correta (redirect do `gtag_report_conversion`, integração com `pushEvent`).
- ❌ Não vou adicionar `console.log` em produção.

## Validação após implementação
1. Rodar Lighthouse mobile no preview e confirmar TBT.
2. Conferir no DevTools Network que `gtm.js`/`gtag/js` carregam só após LCP ou interação.
3. Confirmar que clicar em CTA de conversão (WhatsApp/checkout) ainda dispara `gtag_report_conversion` corretamente — se o usuário clicar antes do tracking carregar, o stub atual já redireciona via `window.location.href`.

Posso prosseguir?