#!/usr/bin/env node
/**
 * Lighthouse runner para auditar a URL pública do app.
 *
 * Uso:
 *   node scripts/lighthouse.mjs                    # mobile + desktop, 1 run
 *   node scripts/lighthouse.mjs --mobile           # só mobile
 *   node scripts/lighthouse.mjs --desktop          # só desktop
 *   node scripts/lighthouse.mjs --runs=3           # 3 execuções, usa mediana
 *   URL=https://meusite.com node scripts/lighthouse.mjs --runs=5 --mobile
 *
 * Pré-requisitos: Node 18+, Chrome/Chromium instalado no sistema.
 * Lighthouse é baixado on-demand via npx (sem inflar node_modules).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, def) => {
  const m = args.find((a) => a.startsWith(`--${name}=`));
  return m ? m.split("=")[1] : def;
};

const URL = process.env.URL || "https://energetic-sell-app.lovable.app";
const RUNS = Math.max(1, parseInt(opt("runs", "1"), 10));
const BASELINE_MOBILE = parseInt(opt("baseline", "67"), 10);

let presets;
if (flag("mobile")) presets = ["mobile"];
else if (flag("desktop")) presets = ["desktop"];
else presets = ["mobile", "desktop"];

const OUT_DIR = "lighthouse-reports";
mkdirSync(OUT_DIR, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, "-");

const median = (arr) => {
  const s = [...arr].filter((v) => v != null).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const fmtMs = (n) => (n == null ? "—" : `${Math.round(n)} ms`);
const fmtS = (n) => (n == null ? "—" : `${(n / 1000).toFixed(2)} s`);
const fmtKiB = (n) => (n == null ? "—" : `${(n / 1024).toFixed(0)} KiB`);

function runLighthouse(preset, runIdx) {
  const outBase = join(OUT_DIR, `${ts}-${preset}-run${runIdx}`);
  const lhArgs = [
    "--yes",
    "lighthouse@latest",
    URL,
    `--preset=${preset === "desktop" ? "desktop" : "perf"}`,
    `--form-factor=${preset}`,
    preset === "mobile"
      ? "--screenEmulation.mobile=true"
      : "--screenEmulation.mobile=false",
    "--only-categories=performance",
    "--output=html,json",
    `--output-path=${outBase}`,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
  ];

  console.log(`\n→ [${preset}] run ${runIdx}/${RUNS}`);
  const r = spawnSync("npx", lhArgs, { stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`Lighthouse falhou (exit ${r.status}).`);
    process.exit(r.status || 1);
  }

  const json = JSON.parse(readFileSync(`${outBase}.report.json`, "utf8"));
  const a = json.audits;
  return {
    score: Math.round(json.categories.performance.score * 100),
    lcp: a["largest-contentful-paint"]?.numericValue,
    fcp: a["first-contentful-paint"]?.numericValue,
    tbt: a["total-blocking-time"]?.numericValue,
    cls: a["cumulative-layout-shift"]?.numericValue,
    si: a["speed-index"]?.numericValue,
    tti: a["interactive"]?.numericValue,
    opportunities: Object.values(a)
      .filter(
        (x) =>
          x.details?.type === "opportunity" &&
          ((x.details.overallSavingsMs || 0) > 50 ||
            (x.details.overallSavingsBytes || 0) > 10000),
      )
      .sort(
        (x, y) =>
          (y.details.overallSavingsMs || 0) - (x.details.overallSavingsMs || 0),
      )
      .slice(0, 5)
      .map((x) => ({
        title: x.title,
        ms: x.details.overallSavingsMs,
        bytes: x.details.overallSavingsBytes,
      })),
    htmlPath: `${outBase}.report.html`,
  };
}

function summarise(preset, runs) {
  const med = (k) => median(runs.map((r) => r[k]));
  const score = med("score");
  const last = runs[runs.length - 1];
  const ok = score >= 90 ? "✅" : score >= 75 ? "🟡" : "❌";

  console.log(`\n━━━ [${preset.toUpperCase()}] ━━━`);
  if (RUNS > 1) {
    console.log(
      `  Scores por run: ${runs.map((r) => r.score).join(", ")}  → mediana: ${score}`,
    );
  }
  const baselineLabel =
    preset === "mobile"
      ? `  (baseline ${BASELINE_MOBILE} → ${score - BASELINE_MOBILE >= 0 ? "+" : ""}${score - BASELINE_MOBILE})`
      : "";
  console.log(`  Performance: ${score} ${ok}${baselineLabel}`);
  console.log(
    `  LCP: ${fmtS(med("lcp"))} | FCP: ${fmtS(med("fcp"))} | TBT: ${fmtMs(med("tbt"))} | CLS: ${med("cls")?.toFixed(3) ?? "—"} | SI: ${fmtS(med("si"))} | TTI: ${fmtS(med("tti"))}`,
  );
  if (last.opportunities.length) {
    console.log(`  Top oportunidades (último run):`);
    last.opportunities.forEach((o, i) => {
      console.log(
        `    ${i + 1}. ${o.title}  — ${fmtMs(o.ms)} / ${fmtKiB(o.bytes)}`,
      );
    });
  }
  console.log(`  Relatório HTML: ${last.htmlPath}`);
  return score;
}

console.log(`\n═══ Lighthouse: ${URL} ═══`);
console.log(`Presets: ${presets.join(", ")} | Runs: ${RUNS}`);

const finalScores = {};
for (const preset of presets) {
  const runs = [];
  for (let i = 1; i <= RUNS; i++) runs.push(runLighthouse(preset, i));
  finalScores[preset] = summarise(preset, runs);
}

console.log(`\n═══ Resumo ═══`);
Object.entries(finalScores).forEach(([p, s]) => {
  console.log(`  ${p.padEnd(8)} → ${s}`);
});

const mobileScore = finalScores.mobile;
if (mobileScore != null && mobileScore < 90) {
  console.log(
    `\n⚠️  Mobile abaixo de 90 (${mobileScore}). Veja as oportunidades acima.`,
  );
  process.exit(1);
}
console.log(`\n✅ Todos os scores ≥ 90.`);
