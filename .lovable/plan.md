## Objetivo

Criar um script local que roda Lighthouse contra a URL publicada (`https://energetic-sell-app.lovable.app`) em mobile e/ou desktop, com suporte a múltiplas execuções e mediana, comparando com o baseline mobile 67.

## Arquivos

### 1. `scripts/lighthouse.mjs` (novo)

Script Node ESM (sem dependências instaladas — usa `npx lighthouse@latest` on-demand).

**Flags suportadas:**
- `--mobile` / `--desktop` — roda só um preset (default: ambos)
- `--runs=N` — número de execuções por preset (default: 1). Usa **mediana** de todas as métricas.
- `--baseline=N` — baseline mobile pra comparar (default: 67)
- `URL=...` (env) — sobrescreve a URL alvo

**O que faz por run:**
1. Chama `npx lighthouse <URL> --preset=perf|desktop --form-factor=mobile|desktop --only-categories=performance --output=html,json --output-path=lighthouse-reports/{ts}-{preset}-runN`
2. Lê o JSON e extrai: score Performance, LCP, FCP, TBT, CLS, Speed Index, TTI, top 5 opportunities
3. Headless Chrome via `--chrome-flags="--headless=new --no-sandbox --disable-gpu"`

**Lógica de mediana (`--runs=N`):**
- Roda N vezes, guarda métricas de cada run
- Calcula mediana de score, LCP, FCP, TBT, CLS, SI, TTI separadamente
- Imprime: `Scores por run: 88, 91, 89 → mediana: 89`
- Mostra opportunities do último run (lista varia pouco entre runs)

**Saída no terminal (exemplo com `--runs=3 --mobile`):**
```
═══ Lighthouse: https://energetic-sell-app.lovable.app ═══
Presets: mobile | Runs: 3

→ [mobile] run 1/3
→ [mobile] run 2/3
→ [mobile] run 3/3

━━━ [MOBILE] ━━━
  Scores por run: 88, 91, 89  → mediana: 89
  Performance: 89 🟡  (baseline 67 → +22)
  LCP: 1.85 s | FCP: 1.20 s | TBT: 80 ms | CLS: 0.010 | SI: 2.10 s | TTI: 2.40 s
  Top oportunidades (último run):
    1. Reduce unused JavaScript          — 180 ms / 45 KiB
    2. Properly size images              — 90 ms  / 22 KiB
  Relatório HTML: lighthouse-reports/2026-...-mobile-run3.report.html

═══ Resumo ═══
  mobile   → 89

⚠️  Mobile abaixo de 90 (89). Veja as oportunidades acima.
```

**Exit codes:** 0 se mobile ≥ 90 (ou se só rodou desktop), 1 caso contrário — útil pra CI.

### 2. `package.json` — adicionar 4 scripts

```json
"lh": "node scripts/lighthouse.mjs",
"lh:mobile": "node scripts/lighthouse.mjs --mobile",
"lh:desktop": "node scripts/lighthouse.mjs --desktop",
"lh:median": "node scripts/lighthouse.mjs --runs=3"
```

Sem adicionar `lighthouse` em `devDependencies` — `npx` baixa sob demanda. (Se quiser fixar versão depois, é trivial.)

### 3. `lighthouse-reports/.gitignore` (novo)

```
*
!.gitignore
```

Mantém a pasta versionada mas ignora os relatórios gerados.

### 4. `scripts/README-lighthouse.md` (novo)

Documentação curta com exemplos de uso, pré-requisitos (Node 18+, Chrome) e dica sobre variação ±5 pontos do Lighthouse (por isso `--runs=3` é recomendado).

## Como usar

```bash
# Padrão: mobile + desktop, 1 run cada
npm run lh

# Mediana de 3 runs no mobile (recomendado pra comparar com baseline)
npm run lh:median -- --mobile

# 5 runs em ambos, baseline customizado
node scripts/lighthouse.mjs --runs=5 --baseline=67

# Outra URL (ex.: WordPress)
URL=https://awrbaterias.com.br npm run lh:mobile
```

## Observações

- **Por que mediana e não média**: Lighthouse oscila ±5 pontos por execução (variação de rede/CPU). Mediana é robusta a outliers; média seria puxada por um run ruim.
- **Throttling**: presets `perf` (mobile) e `desktop` do Lighthouse usam o mesmo throttling do PageSpeed Insights (Slow 4G + 4x CPU para mobile). Os números devem bater de perto com o PSI online.
- **Sandbox Lovable não roda**: Chrome não está disponível aqui, então o script é pra rodar **na sua máquina**.
