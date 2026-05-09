## Problemas e correções

### 1. Botão "Ligar agora" não dispara (mobile/iframe)
**Causa provável:** Em iframe cross-origin, links `tel:` são bloqueados por padrão pela política de sandbox/permissions do `<iframe>` do WordPress se não houver `allow="..."` adequado. Além disso, o `<a href="tel:">` dentro de iframe sem `target="_top"` pode não navegar.

**Correção:**
- Adicionar `target="_top"` ao link `tel:` no `MobileActionBar.tsx` (e ao link `tel:` do `Header.tsx`) para que a navegação escape do iframe e dispare o discador no dispositivo.
- No shortcode `[awr_app]` (`wp-theme/awr-baterias-fast/inc/perf-app-iframe.php`), garantir que o `<iframe>` tenha `allow="autoplay; clipboard-write"` e remover qualquer `sandbox` restritivo (ou incluir `allow-top-navigation-by-user-activation allow-popups`).

### 2. Cabeçalho não aparece no mobile
**Causa:** Em `Index.tsx`, `showHeader` só vira `true` quando `!EMBEDDED`. Em modo iframe (preview e WP) o `Header` nunca monta. O usuário quer o header visível também no mobile dentro do iframe.

**Correção:**
- Em `Index.tsx`, montar o `Header` também em modo embedded (remover o `if (EMBEDDED) return;` do effect que ativa `showHeader`).
- Validar empilhamento: `MobileActionBar` fica em `top:0` (z-60), `Header` fica em `top: 52px+safe-area` (z-50). Ajustar o offset do `Header` no mobile para ficar logo abaixo da MobileActionBar (~52px), e ajustar `padding-top` do `<main>` para acomodar (`MobileActionBar ~52px` + `Header 64px` = ~116px no mobile).

### 3. Adicionar botão "Peça sua bateria" abaixo do campo de busca
**Localização:** `HeroSection.tsx`, logo após o card branco da busca (`<div className="mb-6 rounded-2xl bg-card p-4 ...">`).

**Implementação:**
- Adicionar um botão verde (mesmo estilo `bg-awr-green`) full-width no mobile, com ícone `MessageCircle` e texto "Peça a sua bateria pelo WhatsApp".
- Link: `https://wa.me/5551993199486?text=...` com `target="_blank"` e `rel="noopener noreferrer"`.
- Visível em todos os breakpoints (não esconder no mobile como o `HeroWhatsButton` atual que só aparece em `sm:flex`).
- Disparar `trackLead("hero-below-search")` no clique.

### 4. Ajustes de layout responsivo (mobile)
- Reduzir `min-h-[96px]` do `<h1>` no mobile que cria espaço vazio (usar `min-h-0 md:min-h-[120px]`).
- Reduzir `py-12` para `py-6` no container do hero no mobile.
- Garantir que badges no topo (`Plantão`, `10x sem juros`, etc.) quebrem bem em telas de 360-440px (já usam `flex-wrap`, validar tamanhos).
- Ajustar o `pt` do hero embedded para acomodar Header + MobileActionBar quando ambos estiverem visíveis no mobile.

## Arquivos a editar
- `src/components/MobileActionBar.tsx` — adicionar `target="_top"` no link tel:
- `src/components/Header.tsx` — adicionar `target="_top"` no link tel: e ajustar offset top no mobile
- `src/pages/Index.tsx` — montar Header também em iframe; ajustar padding do main
- `src/components/HeroSection.tsx` — novo botão WhatsApp abaixo da busca; ajustes responsivos de espaçamento
- `wp-theme/awr-baterias-fast/inc/perf-app-iframe.php` — atributo `allow` no iframe para permitir tel: e top-navigation
