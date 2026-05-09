// Gera wp-theme/awr-baterias/inc/seo-routes.php a partir dos dados
// estáticos em src/data/*.ts. Roda em build-time, sem dependências externas:
// usa import dinâmico via tsx (executado pelo build-wp-theme.sh).
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const { neighborhoodPages } = await import(resolve(root, "src/data/neighborhoodContent.ts"));
const { cityPages } = await import(resolve(root, "src/data/cityContent.ts"));
const { brandPages } = await import(resolve(root, "src/data/brandContent.ts"));
const { amperagePages } = await import(resolve(root, "src/data/amperageContent.ts"));
const { blogPosts } = await import(resolve(root, "src/data/blogPosts.ts"));

type Route = { title: string; description: string; jsonLd?: unknown };
const routes: Record<string, Route> = {};

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

for (const c of cityPages as Array<{ slug: string; name: string; state: string; intro: string; tagline: string }>) {
  routes[`/baterias/${c.slug}`] = {
    title: `Baterias em ${c.name} ${c.state} — Entrega e instalação grátis | AWR`,
    description: clip(c.intro || c.tagline, 158),
  };
}

for (const n of neighborhoodPages as Array<{ slug: string; name: string; citySlug: string; city: string; intro: string }>) {
  routes[`/baterias/${n.citySlug}/${n.slug}`] = {
    title: `Bateria em ${n.name}, ${n.city} — Entrega rápida | AWR Baterias`,
    description: clip(n.intro, 158),
  };
}

for (const b of brandPages as Array<{ slug: string; name: string; description: string; tagline: string }>) {
  routes[`/baterias/marca/${b.slug}`] = {
    title: `Baterias ${b.name} — Preço, garantia e instalação grátis | AWR`,
    description: clip(b.description || b.tagline, 158),
  };
}

for (const a of amperagePages as Array<{ slug: string; ah: number; description: string; tagline: string }>) {
  routes[`/baterias/amperagem/${a.slug}`] = {
    title: `Bateria ${a.ah}Ah — Modelos, preço e instalação grátis | AWR`,
    description: clip(a.description || a.tagline, 158),
  };
}

for (const p of blogPosts as Array<{ slug: string; title: string; excerpt?: string; description?: string }>) {
  routes[`/blog/${p.slug}`] = {
    title: `${p.title} | Blog AWR Baterias`,
    description: clip(p.excerpt || p.description || p.title, 158),
  };
}
routes["/blog"] = {
  title: "Blog AWR Baterias — Dicas, garantia e instalação de baterias",
  description: "Conteúdo sobre baterias automotivas: como escolher, sintomas de bateria fraca, garantia, instalação e dicas para Gravataí, Porto Alegre e região.",
};

// PHP map
const phpEntries = Object.entries(routes)
  .map(
    ([path, r]) =>
      `    ${JSON.stringify(path)} => array(\n` +
      `        'title' => ${JSON.stringify(r.title)},\n` +
      `        'description' => ${JSON.stringify(r.description)},\n` +
      `    ),`
  )
  .join("\n");

const php = `<?php
/**
 * Mapa de rotas SEO gerado automaticamente por scripts/generate-seo-routes.ts.
 * NÃO editar à mão — rode \`npm run build:wp-theme\` para regenerar.
 * Total de rotas: ${Object.keys(routes).length}
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function awr_seo_routes() {
    static $map = null;
    if ( $map !== null ) return $map;
    $map = array(
${phpEntries}
    );
    return $map;
}
`;

const targets = [
  "wp-theme/awr-baterias/inc",
  "wp-theme/awr-baterias-fast/inc",
];
for (const rel of targets) {
  const outDir = resolve(root, rel);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "seo-routes.php"), php);
  console.log(`✓ ${Object.keys(routes).length} rotas SEO → ${rel}/seo-routes.php`);
}
