# Lighthouse local

Roda o Lighthouse oficial do Google contra a URL pública do app, salva relatórios HTML+JSON em `lighthouse-reports/` e imprime um resumo no terminal.

## Pré-requisitos

- Node 18+
- Chrome ou Chromium instalado no sistema (o Lighthouse usa o do sistema em modo headless)
- Sem instalação extra: `npx lighthouse@latest` baixa sob demanda

## Uso rápido

```bash
# Mobile + desktop, 1 run cada (URL padrão: energetic-sell-app.lovable.app)
npm run lh

# Só mobile
npm run lh:mobile

# Só desktop
npm run lh:desktop

# Mediana de 3 runs (recomendado — Lighthouse oscila ±5 pontos por execução)
npm run lh:median

# Mediana de 3 runs só no mobile
npm run lh:median -- --mobile

# 5 runs com baseline customizado
node scripts/lighthouse.mjs --runs=5 --baseline=67

# Outra URL (ex.: WordPress em produção)
URL=https://awrbaterias.com.br npm run lh:mobile
```

## Flags

| Flag           | Default                                  | Descrição                                  |
| -------------- | ---------------------------------------- | ------------------------------------------ |
| `--mobile`     | —                                        | Roda só preset mobile                      |
| `--desktop`    | —                                        | Roda só preset desktop                     |
| `--runs=N`     | `1`                                      | Número de execuções; usa mediana das métricas |
| `--baseline=N` | `67`                                     | Baseline mobile pra comparar (delta)       |
| `URL=...`      | `https://energetic-sell-app.lovable.app` | URL alvo (env var)                         |

## Saída

- `lighthouse-reports/{timestamp}-{preset}-run{N}.report.html` — relatório completo
- `lighthouse-reports/{timestamp}-{preset}-run{N}.report.json` — métricas brutas
- Terminal: score, LCP/FCP/TBT/CLS/SI/TTI (mediana), top 5 opportunities, delta vs baseline
- Exit code 1 se score mobile < 90 (útil pra CI)

## Por que mediana, não média

Lighthouse varia ±5 pontos entre runs por causa de flutuação de rede/CPU. A média seria puxada por um run ruim; a mediana é robusta a outliers. Use `--runs=3` ou `--runs=5` pra resultados confiáveis.

## Throttling

Os presets `perf` (mobile) e `desktop` usam o mesmo throttling do PageSpeed Insights online (Slow 4G + 4x CPU pra mobile), então os números devem bater de perto.
