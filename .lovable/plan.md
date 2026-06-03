# Plano: Landing HTML standalone + limpeza do projeto

## 1. Gerar `landing.html` (HTML estático standalone)

Criar `/mnt/documents/landing.html` — arquivo único pronto para colar no WordPress (bloco HTML personalizado do Gutenberg ou widget HTML do Elementor). Sem React, sem dependência de bundle, sem busca dinâmica.

**Estrutura visual** (espelha o Hero atual com paleta azul/amarelo/branco):
- `<head>` com fontes Plus Jakarta Sans + Inter via Google Fonts, CSS embutido em `<style>` usando tokens HSL alinhados ao `src/index.css`.
- **Hero**: background gradient azul escuro, badge "Plantão 6h–22h", título "Bateria Entregue e Instalada em até 35 Minutos" com destaque amarelo, lista de benefícios, banner amarelo informativo.
- **Bloco de busca substituído por CTAs diretos** (não há React): botão WhatsApp (verde) + botão Ligar (azul) apontando para `https://wa.me/5551993199486` e `tel:+5551993199486`.
- **Seções estáticas** abaixo do hero, derivadas dos componentes atuais: TrustBar, Benefícios (4 cards), Como Funciona (3 passos), Marcas atendidas (texto), FAQ (accordion CSS-only com `<details>`), CTA final, rodapé com endereço e horário.
- Tudo responsivo via media queries puras, sem framework.
- WhatsApp flutuante via `<a>` fixo com CSS.

**Entrega**: emitido como `<presentation-artifact path="landing.html" mime_type="text/html">` para download direto.

## 2. Limpeza do projeto

### Remover temas WP antigos
- `wp-theme/awr-baterias/` (tema legado com chunks pré-compilados)
- `wp-theme/awr-baterias-wc/` (variante WooCommerce não usada)
- `wp-theme/awr-baterias-wordpress.zip` (build antigo)
- Manter apenas `wp-theme/awr-baterias-fast/` (tema ativo) e `wp-theme/_snippets/`.

### Remover scripts de teste/lighthouse
- `scripts/lighthouse.mjs`
- `scripts/README-lighthouse.md`
- `lighthouse-reports/`
- `src/test/` (`example.test.ts`, `setup.ts`)
- `src/lib/parseCodesParam.test.ts`
- `vitest.config.ts`
- Remover deps de teste do `package.json` (`vitest`, `@testing-library/*` se presentes) e script `test` se ficar órfão.
- Atualizar `.github/workflows/ci.yml` removendo passo de testes/lighthouse.

### Remover páginas SEO não usadas
Após verificar referências em `src/App.tsx` (rotas) e `scripts/generate-seo-routes.ts`:
- `src/pages/Blog.tsx`, `BlogPost.tsx`, `BlogTag.tsx` + `src/data/blogPosts.ts`
- `src/pages/VehicleSeo.tsx` + dados associados se órfãos
- `src/pages/Amperage.tsx` + `src/data/amperageContent.ts`
- `src/pages/Brand.tsx` + `src/data/brandContent.ts` (se não linkado)
- `src/pages/Neighborhood.tsx` + `src/data/neighborhoodContent.ts`
- `src/pages/City.tsx` + `src/data/cityContent.ts`
- `src/pages/Servicos.tsx`, `Catalogo.tsx`, `WhatsappLogs.tsx`, `Admin.tsx`, `Auth.tsx` (avaliar e remover os que não tiverem rota ativa em uso real)
- Remover rotas correspondentes em `src/App.tsx`.
- Atualizar `scripts/generate-seo-routes.ts` ou removê-lo se não houver mais SEO routes.
- Atualizar `public/sitemap.xml` removendo URLs órfãs.

**Critério de segurança**: antes de excluir qualquer página, confirmar via `rg` que não há imports/links internos para ela. Páginas com rota mas sem links serão listadas e confirmadas antes da exclusão.

### Validação final
- Rodar `knip` (já configurado) para detectar exports órfãos remanescentes.
- Garantir que o build passa.

## Fora do escopo
- Não alterar lógica de carrinho, checkout, busca por veículo ou integrações Supabase.
- Não tocar em `awr-baterias-fast` (tema ativo).
- Não modificar a paleta nem componentes visuais atuais do app React.
