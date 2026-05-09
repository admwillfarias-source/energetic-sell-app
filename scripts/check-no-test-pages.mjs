#!/usr/bin/env node
/**
 * Falha o build se houver páginas/rotas de teste/diagnóstico/debug no projeto.
 * Roda em CI antes do deploy.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PAGES_DIR = join(ROOT, "src", "pages");
const APP_TSX = join(ROOT, "src", "App.tsx");

const FORBIDDEN_FILE_PATTERNS = [/Test\.tsx?$/i, /Diagnose\.tsx?$/i, /Debug\.tsx?$/i, /Sandbox\.tsx?$/i, /Validation\.tsx?$/i];
const FORBIDDEN_ROUTE_PATTERNS = [/path=["'`][^"'`]*\/(test|teste|diagnostico|diagnose|debug|sandbox)[^"'`]*["'`]/i];

const errors = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (FORBIDDEN_FILE_PATTERNS.some((re) => re.test(entry))) {
      errors.push(`Página de teste detectada: ${relative(ROOT, full)}`);
    }
  }
}

try {
  walk(PAGES_DIR);
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

try {
  const app = readFileSync(APP_TSX, "utf8");
  app.split("\n").forEach((line, i) => {
    if (FORBIDDEN_ROUTE_PATTERNS.some((re) => re.test(line))) {
      errors.push(`Rota de teste em src/App.tsx:${i + 1} -> ${line.trim()}`);
    }
  });
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

if (errors.length) {
  console.error("\n❌ Bloqueando deploy. Páginas/rotas de teste encontradas:\n");
  for (const err of errors) console.error("  - " + err);
  console.error("\nRemova esses arquivos/rotas antes de publicar.\n");
  process.exit(1);
}

console.log("✓ Nenhuma página ou rota de teste encontrada.");
