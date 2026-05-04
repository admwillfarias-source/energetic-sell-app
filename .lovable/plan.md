Plano para corrigir o `awr-baterias_v3.zip` e gerar uma versão nova instalável:

1. Tornar o PHP do tema mais compatível
   - Reescrever `functions.php` sem closures/funções anônimas, usando funções nomeadas.
   - Remover dependência de `wp_parse_url`, usando `parse_url` com fallback para compatibilidade.
   - Evitar qualquer chamada que possa gerar erro fatal em WordPress antigo.
   - Manter `Requires PHP: 7.0` e compatibilidade prática com WP 5.x.

2. Corrigir carregamento do site após ativar
   - Ajustar o enqueue do Vite para WordPress usando `script_loader_tag` compatível com assinaturas antigas.
   - Garantir `type="module"` no `app.js` e no widget sem quebrar filtros de instalações antigas.
   - Revisar o `template_include` para não capturar admin, login, REST, uploads, arquivos físicos, `robots.txt`, `sitemap.xml` e assets do tema.
   - Adicionar/confirmar flush seguro das rewrite rules na ativação do tema para as rotas `/baterias/*` e `/blog/` funcionarem sem precisar salvar permalinks manualmente.

3. Fortalecer o pacote do tema
   - Ajustar `scripts/build-wp-theme.sh` para empacotar sempre com a estrutura exata:
     ```text
     awr-baterias/
       style.css
       functions.php
       index.php
       inc/
       assets/
       widget/
     ```
   - Excluir arquivos desnecessários ou potencialmente problemáticos no ZIP: `.DS_Store`, `__MACOSX`, `_headers`, `robots.txt`/`sitemap.xml` duplicados dentro de `assets/` e `widget/`, se não forem necessários para WordPress.
   - Gerar um novo artifact `awr-baterias_v4.zip` em `/mnt/documents/`.

4. Validação antes de entregar
   - Validar integridade do ZIP com `unzip -t`.
   - Conferir se `style.css`, `functions.php`, `index.php`, `inc/seo.php`, `inc/seo-routes.php`, `assets/app.js`, `assets/app.css`, `widget/awr-busca.js` e `widget/awr-busca.css` existem dentro da pasta raiz `awr-baterias/`.
   - Rodar uma checagem estática de compatibilidade PHP para detectar sintaxe incompatível.
   - Inspecionar o build para confirmar que os imports dos chunks JS apontam para `assets/chunks/...` corretamente.

Observação: eu não consigo publicar diretamente no seu WordPress sem acesso ao painel/FTP, mas vou entregar o ZIP corrigido e validado para upload em `Aparência > Temas > Adicionar novo > Enviar tema`. Se ainda houver erro após essa versão, o próximo passo será usar a mensagem exata do WordPress ou o `wp-content/debug.log`, porque o ZIP atual está estruturalmente íntegro e o problema provavelmente é compatibilidade/erro fatal do PHP no ambiente da hospedagem.