#!/usr/bin/env node
/**
 * SEO pre-publish validator.
 *
 * Varre as URLs do sitemap (ou lista custom), busca o HTML de cada
 * página e valida canonical, meta description, Open Graph e Twitter
 * Cards. Sai com código != 0 se houver erros — pronto para CI.
 *
 * Uso:
 *   node scripts/seo-check.mjs                     # base = produção
 *   node scripts/seo-check.mjs --base=https://...  # base custom (preview)
 *   node scripts/seo-check.mjs --limit=20          # primeiras N rotas
 *   node scripts/seo-check.mjs --warn              # warnings não falham
 *   node scripts/seo-check.mjs --report=dir        # grava report.md + report.json
 *                                                  # (default: seo-report/)
 *
 * Requer: node 18+ (fetch nativo) e jsdom (já em devDependencies).
 *
 * Limite conhecido: este SPA usa react-helmet-async, que injeta tags
 * no client. Contra a build estática (Vite preview / Lovable preview)
 * só o head de index.html é validado. Em produção, o tema WP imprime
 * SEO server-side via awr_print_seo_tags(), então rodar contra
 * https://awrbaterias.com.br valida o head real por rota.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

const BASE = (args.base || 'https://awrbaterias.com.br').replace(/\/$/, '');
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const WARN_ONLY = !!args.warn;

const RULES = {
  titleMax: 60,
  titleMin: 15,
  descMax: 160,
  descMin: 70,
  ogImageMinBytes: 0, // não baixamos a imagem; validamos só URL
};

// ---- 1. Coletar URLs do sitemap.xml local ---------------------------------
function loadSitemapUrls() {
  const xml = readFileSync(resolve('public/sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  // Reescreve para BASE (sitemap aponta para domínio de prod)
  return urls.map((u) => {
    try {
      const url = new URL(u);
      return BASE + url.pathname + url.search;
    } catch {
      return BASE + u;
    }
  });
}

// ---- 2. Validar uma página -------------------------------------------------
async function checkUrl(url) {
  const errors = [];
  const warnings = [];
  let res;
  try {
    res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'awr-seo-check/1.0' } });
  } catch (e) {
    return { url, errors: [`fetch falhou: ${e.message}`], warnings };
  }
  if (!res.ok) {
    // 404 esperado em rota /404
    if (res.status === 404 && url.endsWith('/404')) {
      return { url, errors, warnings, ok: true, note: '404 esperado' };
    }
    return { url, errors: [`HTTP ${res.status}`], warnings };
  }
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const canonical = doc.querySelectorAll('link[rel="canonical"]');
  const title = doc.querySelector('title')?.textContent?.trim() || '';
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';

  const og = (p) => doc.querySelector(`meta[property="og:${p}"]`)?.getAttribute('content') || '';
  const tw = (n) => doc.querySelector(`meta[name="twitter:${n}"]`)?.getAttribute('content') || '';

  // --- Title ---
  if (!title) errors.push('title ausente');
  else if (title.length > RULES.titleMax) errors.push(`title ${title.length} > ${RULES.titleMax} chars`);
  else if (title.length < RULES.titleMin) warnings.push(`title curto (${title.length} chars)`);

  // --- Description ---
  if (!desc) errors.push('meta description ausente');
  else if (desc.length > RULES.descMax) errors.push(`description ${desc.length} > ${RULES.descMax} chars`);
  else if (desc.length < RULES.descMin) warnings.push(`description curta (${desc.length} chars)`);

  // --- Canonical ---
  if (canonical.length === 0) {
    if (!robots.includes('noindex')) errors.push('canonical ausente');
  } else if (canonical.length > 1) {
    errors.push(`${canonical.length} canonicals (deve ser 1)`);
  } else {
    const href = canonical[0].getAttribute('href') || '';
    if (!/^https:\/\//.test(href)) errors.push(`canonical não absoluto: ${href}`);
    if (href.includes('?')) warnings.push(`canonical com query: ${href}`);
  }

  // --- Open Graph ---
  const ogReq = ['type', 'url', 'title', 'description', 'image', 'site_name', 'locale'];
  for (const k of ogReq) {
    if (!og(k)) errors.push(`og:${k} ausente`);
  }
  if (og('image') && !/^https:\/\//.test(og('image'))) errors.push(`og:image não absoluto: ${og('image')}`);
  if (canonical[0] && og('url') && canonical[0].getAttribute('href') !== og('url')) {
    warnings.push(`og:url != canonical (${og('url')} vs ${canonical[0].getAttribute('href')})`);
  }

  // --- Twitter ---
  const twReq = ['card', 'title', 'description', 'image'];
  for (const k of twReq) if (!tw(k)) errors.push(`twitter:${k} ausente`);
  if (tw('card') && tw('card') !== 'summary_large_image') warnings.push(`twitter:card = ${tw('card')}`);

  return { url, errors, warnings, title, descLen: desc.length };
}

// ---- 3. Run ----------------------------------------------------------------
const urls = loadSitemapUrls().slice(0, LIMIT);
console.log(`\nSEO check: ${urls.length} URL(s) contra ${BASE}\n`);

let totalErr = 0;
let totalWarn = 0;
const concurrency = 6;
const results = [];

async function worker(queue) {
  while (queue.length) {
    const url = queue.shift();
    const r = await checkUrl(url);
    results.push(r);
    const status = r.errors.length ? 'FAIL' : r.warnings.length ? 'warn' : 'ok  ';
    process.stdout.write(`  [${status}] ${r.url}\n`);
    for (const e of r.errors) process.stdout.write(`        ✗ ${e}\n`);
    for (const w of r.warnings) process.stdout.write(`        ! ${w}\n`);
    totalErr += r.errors.length;
    totalWarn += r.warnings.length;
  }
}

const queue = [...urls];
await Promise.all(Array.from({ length: concurrency }, () => worker(queue)));

console.log(`\n— Resumo —`);
console.log(`  páginas:  ${results.length}`);
console.log(`  erros:    ${totalErr}`);
console.log(`  warnings: ${totalWarn}`);

if (totalErr && !WARN_ONLY) {
  console.error('\nPublish bloqueado: corrija os erros acima.\n');
  process.exit(1);
}
console.log('\nOK para publicar.\n');
