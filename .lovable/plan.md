## Objetivo

Gerar **um único arquivo HTML autocontido** que reproduz o visual Navy Trust da landing atual (hero split-screen 60/40, tipografia Archivo Black + Hind, paleta `#0f1b3d / #1e3a5f / #3b6fa0 / #e8edf3`) e embute o app React do Lovable via iframe. O usuário cola num bloco "HTML personalizado" do Gutenberg (ou widget HTML do Elementor) e tem a landing completa rodando dentro do WordPress, sem PHP nem shortcode.

## O que será entregue

Arquivo novo: **`wp-theme/_snippets/landing-completa.html`**

Estrutura do snippet (tudo inline, sem dependências externas exceto Google Fonts):

```text
1. <link> preconnect + Google Fonts (Archivo Black + Hind)
2. <link> preconnect ao domínio do app Lovable
3. <style> escopado em .awr-lp-* (não vaza pro tema WP)
   - Tokens Navy Trust (CSS vars)
   - Reset leve só dentro de .awr-lp-root
   - Componentes: hero split 60/40, badges, search visual, trust stats,
     benefits grid, FAQ accordion (via <details>), CTA WhatsApp
4. <div class="awr-lp-root"> com as seções:
   a) Hero split-screen 60/40
      - Eyebrow "Porto Alegre & Região · Desde 2009"
      - H1 "Bateria entregue e instalada em até 35 minutos"
      - Parágrafo de apoio
      - Caixa de busca VISUAL (input + botão) que faz scroll suave
        até o iframe (o app é quem executa a busca real)
      - Chips de buscas frequentes (links âncora pro iframe)
      - CTA verde WhatsApp (wa.me direto)
      - Trust stats: +15 anos / 10x sem juros / Desde 2009
      - Lado visual 40%: imagem hero + badge flutuante de marcas
   b) Faixa TrustBar (Moura, Heliar, Zetta, Excell)
   c) Seção "Benefícios" (4 cards: entrega 35min, garantia, 10x sem
      juros, atendimento 24/7)
   d) Seção "Como funciona" (3 passos)
   e) ★ Seção iframe do app (id="buscar-bateria")
      - Wrapper responsivo, altura inicial 900px com auto-resize via
        postMessage "awr:height" (igual ao snippet atual)
      - src="https://energetic-sell-app.lovable.app/?embed=1"
   f) FAQ (4-5 perguntas via <details>/<summary> — sem JS)
   g) CTA final WhatsApp
5. <script> mínimo:
   - Listener postMessage pra auto-resize do iframe
   - Scroll suave do botão "Buscar Bateria" do hero até #buscar-bateria
```

## Decisões técnicas

- **Escopo de CSS**: tudo prefixado com `.awr-lp-` e dentro de `.awr-lp-root` pra não conflitar com CSS do tema WP / Elementor.
- **Sem framework**: HTML + CSS puros + ~30 linhas de JS. Nenhum Tailwind, nenhum React no parent — o React fica só dentro do iframe.
- **Tipografia**: Google Fonts (`Archivo Black` 400 + `Hind` 400/600/700) carregada com `display=swap`.
- **Imagem hero**: usa `/wp-content/uploads/hero-bg.webp` por padrão, com fallback comentado pra apontar pro asset do app Lovable. O usuário troca a URL pra um upload do WP.
- **Busca do hero**: o input do hero é decorativo/visual — submeter rola até o iframe e foca nele. A busca real acontece dentro do app. Isso evita ter que reimplementar o catálogo fora do iframe.
- **Auto-resize do iframe**: reusa o protocolo `awr:height` que o app já emite (`src/lib/iframeAutoResize.ts`), idêntico ao `wp-theme/_snippets/iframe-app.html`.
- **FAQ acessível**: `<details>`/`<summary>` nativos — sem JS, com schema JSON-LD `FAQPage` inline pra SEO.
- **SEO**: JSON-LD `AutomotiveBusiness` + `FAQPage` inline no snippet. Title/meta description ficam por conta do WordPress (página onde o snippet é colado).

## Como o usuário vai usar

1. WordPress → Páginas → Adicionar nova → criar "Bateria em Porto Alegre".
2. Inserir bloco **HTML personalizado** (Gutenberg) ou widget **HTML** (Elementor).
3. Colar o conteúdo de `wp-theme/_snippets/landing-completa.html`.
4. Trocar a URL da imagem hero (linha comentada no topo do `<style>`).
5. Publicar.

Opcional: usar a página como **front page** em Configurações → Leitura.

## Arquivos alterados

- **Criar**: `wp-theme/_snippets/landing-completa.html`
- **Atualizar**: `wp-theme/_snippets/README.md` — adicionar seção descrevendo o novo snippet, quando usar `iframe-app.html` (só iframe) vs `landing-completa.html` (página completa).

Nenhum código React, build ou config existente é alterado.
