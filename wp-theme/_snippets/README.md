# Snippets HTML para WordPress

Snippets auto-contidos (HTML + CSS + JS) para embutir o app React no
WordPress, **sem shortcode e sem PHP**.

| Arquivo | Quando usar |
|---|---|
| [`iframe-app.html`](./iframe-app.html) | Só o **app em tela cheia** (100vh), sem nada ao redor. |
| [`landing-completa.html`](./landing-completa.html) | **Landing page completa** Navy Trust: hero split-screen 60/40, trust bar, benefícios, como funciona, **iframe do app embutido no meio**, FAQ e CTA final. Inclui JSON-LD (AutomotiveBusiness + FAQPage). Ideal pra home / página de captação. |

Ambos funcionam em bloco "HTML personalizado" (Gutenberg) ou widget HTML (Elementor).

---

## `iframe-app.html` — só o app

Embute o app `https://bateria-facil.lovable.app` em qualquer
página/post do WordPress, ocupando a tela inteira.

## Como usar

1. Abra a página/post no editor do WordPress.
2. Adicione um bloco **HTML personalizado** (Gutenberg) ou um widget
   **HTML** (Elementor).
3. Copie o conteúdo de `iframe-app.html` e cole no bloco.
4. Salve e publique.

## Personalizações comuns

### Trocar a URL do app
No `<iframe src="...">`, substitua `https://bateria-facil.lovable.app`
pelo seu domínio. Mantenha `?embed=1` no final — é isso que faz o React
pular header/footer próprios.

### Travar altura fixa em vez de viewport cheia
No `<style>`, troque:

```css
.lovable-fullscreen-wrapper{
  height:100vh;
  height:100dvh;
}
```

por:

```css
.lovable-fullscreen-wrapper{
  height:900px; /* ou o valor que quiser */
}
```

E remova o bloco `@supports (-webkit-touch-callout:none)`.

### Desabilitar o auto-resize
Se preferir altura sempre fixa (sem o app esticar/encolher o iframe),
apague o `<script>` no final do snippet.

## Notas técnicas

- `100dvh` é progressive enhancement (resolve a barra de URL no
  mobile); `100vh` é fallback; `-webkit-fill-available` cobre Safari iOS
  legado via `@supports (-webkit-touch-callout:none)`.
- `?embed=1` aciona o caminho `EMBEDDED` em `src/pages/Index.tsx` e
  ativa o `postMessage` de altura em `src/lib/iframeAutoResize.ts`.
- O listener `awr:height` é compatível com o emitido pelo app — se você
  já usa o shortcode `[awr_app]` em outras páginas, os dois listeners
  coexistem sem conflito.
- `body{overflow-x:hidden}` fica dentro do `<style>` colado, então só
  afeta a página que recebe o snippet.
