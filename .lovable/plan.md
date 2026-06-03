# Plano: Snippet iframe atualizado para WordPress

## Objetivo
Garantir que o bloco HTML colado no WordPress carregue corretamente o app React de `https://bateria-facil.lovable.app/?embed=1` em iframe full-viewport, com auto-resize via postMessage e fallback de altura.

## Ações

### 1. Atualizar `wp-theme/_snippets/iframe-app.html`
Revisar o snippet existente para garantir:
- `src="https://bateria-facil.lovable.app/?embed=1"` (URL atual)
- `preconnect` + `dns-prefetch` para `bateria-facil.lovable.app`
- Wrapper `.lovable-fullscreen-wrapper` com altura `100dvh` + fallback `100vh` + `-webkit-fill-available` para iOS
- `sandbox` permissivo para o app funcionar (`allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation`)
- `allow="clipboard-write; payment; geolocation"`
- Listener de `postMessage` para `awr:height` ajustar altura dinamicamente
- `loading="lazy"` + `decoding="async"`
- Comentário no topo explicando como colar (Gutenberg HTML personalizado / Elementor widget HTML)

### 2. Sincronizar a cópia em `wp-theme/awr-baterias-fast/snippets/iframe-app.html`
Manter o snippet do tema ativo idêntico ao de `_snippets/`.

### 3. Gerar artefato pronto para o usuário
Copiar o snippet final para `/mnt/documents/iframe-app.html` e expor via `<presentation-artifact>` para download direto.

## Fora do escopo
- Não alterar o app React em si.
- Não mexer no `landing.html` standalone gerado anteriormente.
- Não tocar em PHP do tema (apenas o arquivo HTML do snippet).
