## Diagnóstico

O iframe carrega em branco porque a URL aponta para `https://energetic-sell-app.lovable.app/?embed=1`, que retorna **HTTP 404** — esse domínio não existe (ou foi renomeado). A URL publicada **atual** do projeto é `https://bateria-facil.lovable.app`.

Verificado via `curl -I`:
- `energetic-sell-app.lovable.app` → `HTTP/2 404`
- `bateria-facil.lovable.app` → `HTTP/2 200`

Nenhum bloqueio de CSP / X-Frame-Options / sandbox está envolvido — é puramente a URL antiga.

## Correção

Trocar `energetic-sell-app.lovable.app` por `bateria-facil.lovable.app` em **todos os snippets/temas** onde o iframe é referenciado, mais os `<link rel="preconnect">` correspondentes.

### Arquivos a atualizar

1. **`wp-theme/_snippets/landing-completa.html`** ← o que você está colando agora
   - 2× preconnect/dns-prefetch
   - 1× `<img src="…/hero-bg.webp">` (URL da imagem do hero)
   - 1× `<iframe src="…/?embed=1">`

2. **`wp-theme/_snippets/iframe-app.html`** — mesmo snippet em versão "só iframe"
3. **`wp-theme/_snippets/README.md`** — referências de documentação
4. **`wp-theme/awr-baterias/snippets/iframe-app.html`** — cópia no tema
5. **`wp-theme/awr-baterias-fast/snippets/iframe-app.html`** — cópia no tema
6. **`wp-theme/awr-baterias-wc/snippets/iframe-app.html`** — cópia no tema

Em cada um: substituir as 2-3 ocorrências do domínio antigo.

> Os shortcodes PHP (`wp-theme/awr-baterias-fast/inc/perf-app-iframe.php`) lêem a URL do Customizer (`get_theme_mod('awrf_lovable_url', 'https://energetic-sell-app.lovable.app')`), então o default também será atualizado para `bateria-facil.lovable.app`. Usuários que já configuraram outra URL no Customizer não são afetados.

## Como você confere depois

1. Recopiar o conteúdo atualizado de `wp-theme/_snippets/landing-completa.html` no bloco HTML do WordPress.
2. Recarregar a página — o iframe deve mostrar o app AWR Baterias.
3. Se ainda aparecer em branco, abrir DevTools (F12) → aba **Network** → procurar a requisição pra `bateria-facil.lovable.app` e me mandar o status.

## Observação (próximo passo opcional)

A solução mais robusta é conectar o domínio próprio (`awrbaterias.com.br`) ao projeto Lovable em **Project Settings → Domains** e apontar o iframe pra ele. Aí você não depende do subdomínio `*.lovable.app` mudar nunca mais. Posso fazer isso depois se quiser.
