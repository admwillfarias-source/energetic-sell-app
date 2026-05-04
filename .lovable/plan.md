Vou corrigir o pacote do tema WordPress para atacar as causas mais prováveis da página em branco após ativar.

Plano:

1. Corrigir carregamento dos assets no WordPress
   - Ajustar o build do Vite para não depender de caminho fixo `/wp-content/themes/awr-baterias/assets/` nos chunks dinâmicos.
   - Isso evita tela branca quando o WordPress está instalado em subpasta, usa URL diferente, staging, HTTPS/proxy ou caminho personalizado.
   - O JavaScript passará a carregar chunks relativos ao próprio `app.js`.

2. Tornar o template mais compatível com temas WordPress reais
   - Manter `index.php` como template catch-all, mas garantindo que `wp_head()` e `wp_footer()` carreguem corretamente CSS/JS.
   - Evitar que a rota SPA capture URLs administrativas, REST, arquivos do WordPress e assets.

3. Melhorar compatibilidade PHP/WordPress
   - Remover qualquer ponto restante que possa quebrar em hospedagens antigas.
   - Substituir flags JSON modernas por fallbacks seguros se necessário.
   - Garantir que `functions.php`, `inc/seo.php` e `inc/seo-routes.php` funcionem em PHP 7.0+.

4. Corrigir script de empacotamento
   - Atualizar `scripts/build-wp-theme.sh` para gerar sempre um ZIP final com a estrutura correta:

```text
awr-baterias/
  style.css
  functions.php
  index.php
  inc/
  assets/
  widget/
```

   - Excluir arquivos desnecessários como `_headers`, `public/_headers`, `.DS_Store` e pastas inválidas.

5. Gerar novo arquivo `awr-baterias_v5.zip`
   - Rebuild do app React para WordPress.
   - Rebuild do widget `[awr_busca_bateria]`.
   - Regenerar rotas SEO server-side.
   - Empacotar em `/mnt/documents/awr-baterias_v5.zip` para download.

6. Validar antes de entregar
   - Testar integridade do ZIP.
   - Conferir se `style.css` está dentro de `awr-baterias/`.
   - Conferir se `functions.php` não tem erro de sintaxe PHP.
   - Conferir se `app.js` referencia chunks de forma relativa, não por caminho absoluto fixo.
   - Conferir se todos os chunks e assets referenciados existem no ZIP.

Depois disso, você deverá instalar o novo `awr-baterias_v5.zip` em:

```text
WordPress > Aparência > Temas > Adicionar novo > Enviar tema
```

Se o site ainda ficar branco após essa versão, o próximo passo será analisar o erro exato do navegador ou do log do WordPress, mas primeiro vou gerar uma versão mais robusta porque o pacote atual ainda tem risco claro de falha no carregamento dos assets.