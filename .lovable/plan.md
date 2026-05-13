## Objetivo

Entregar um **bloco HTML + CSS auto-contido** (sem shortcode, sem PHP) que embuta o app React (`https://energetic-sell-app.lovable.app`) dentro de qualquer página/post do WordPress, com:

- altura cheia da viewport (`100vh`) com correção iOS Safari (`-webkit-fill-available`);
- sem scroll lateral indesejado (`overflow-x:hidden` no body);
- auto-resize opcional via `postMessage` (o app já envia `awr:height`), caindo de volta para `100vh` se o JS não rodar;
- atributos de performance (`loading="lazy"`, `decoding="async"`, `fetchpriority="low"`, `referrerpolicy`, `allow`, `sandbox`);
- preconnect ao domínio do app para encurtar handshake;
- title acessível.

## Entregáveis

1. **`wp-theme/_snippets/iframe-app.html`** — snippet único, copy-paste, com `<style>` + `<link rel="preconnect">` + `<iframe>` + `<script>` de auto-resize. É o arquivo "fonte da verdade" que o usuário cola no editor de bloco HTML do WordPress.
2. **`wp-theme/_snippets/README.md`** — instruções curtas de uso (onde colar, como trocar a URL, como travar altura fixa em vez de viewport).
3. Cópias do mesmo snippet em cada tema, para ficar versionado junto:
   - `wp-theme/awr-baterias-fast/snippets/iframe-app.html`
   - `wp-theme/awr-baterias-wc/snippets/iframe-app.html`
   - `wp-theme/awr-baterias/snippets/iframe-app.html`

Nenhum arquivo PHP de tema, shortcode, `functions.php` ou enqueue será alterado — é só asset estático para colar.

## Conteúdo do snippet (resumo)

```text
<link rel="preconnect" href="https://energetic-sell-app.lovable.app" crossorigin>
<style>
  .lovable-fullscreen-wrapper{position:relative;width:100%;height:100vh;height:100dvh}
  @supports (-webkit-touch-callout:none){
    .lovable-fullscreen-wrapper{height:-webkit-fill-available}
  }
  .lovable-fullscreen-wrapper>iframe{
    position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:#fafafa
  }
  body{overflow-x:hidden}
</style>

<div class="lovable-fullscreen-wrapper">
  <iframe
    data-awr-app="1"
    src="https://energetic-sell-app.lovable.app/?embed=1"
    title="AWR Baterias"
    loading="lazy" decoding="async" fetchpriority="low"
    referrerpolicy="no-referrer-when-downgrade"
    allow="clipboard-write; payment; geolocation"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"></iframe>
</div>

<script>
/* auto-resize opcional — se o app enviar awr:height, ajusta a altura
   para o conteúdo real e libera o 100vh */
(function(){
  window.addEventListener('message',function(e){
    var d=e.data;if(!d||typeof d!=='object'||d.type!=='awr:height')return;
    var w=document.querySelector('.lovable-fullscreen-wrapper');
    if(w&&typeof d.height==='number'&&d.height>200){
      w.style.height=Math.ceil(d.height)+'px';
    }
  });
})();
</script>
```

## Detalhes técnicos

- `100dvh` é incluído como progressive enhancement para navegadores modernos (resolve barra de URL móvel); `100vh` continua como fallback; `-webkit-fill-available` cobre Safari iOS legado.
- `?embed=1` na URL faz o React entrar no caminho `EMBEDDED` (já presente em `src/pages/Index.tsx` e `src/lib/iframeAutoResize.ts`), evitando renderizar header/footer/SEO duplicado.
- O listener de `awr:height` é compatível com o que `src/lib/iframeAutoResize.ts` já envia. Se a página WP já tem o listener do shortcode `[awr_app]`, este script extra não conflita (ambos só ajustam altura).
- `body{overflow-x:hidden}` fica dentro do `<style>` colado, então só afeta páginas que receberem o snippet — sem efeito colateral global.
- Para travar altura fixa (ex.: 900px) em vez de viewport, basta trocar `height:100vh;height:100dvh` por `height:900px` no `.lovable-fullscreen-wrapper` — instrução incluída no README.

## Fora de escopo

- Não mexer em `perf-app-iframe.php` (shortcode `[awr_app]`) — continua funcionando para quem prefere shortcode.
- Não alterar `functions.php`, enqueue de assets, nem o app React.
- Sem mudanças de SEO, build ou edge functions.
