## Limpeza do projeto

Resultado de uma varredura completa. Nada de produção será tocado — só código sem uso real, páginas claramente marcadas como teste/diagnóstico, e logs de desenvolvimento.

---

### 1. Páginas e rotas de teste (remover)

Páginas que existem só para QA interno e não são linkadas em produção:

- `src/pages/CheckoutTest.tsx` — rota `/checkout-test`
- `src/pages/SkuValidation.tsx` — rota `/admin/validacao-skus`
- `src/pages/WhatsappTest.tsx` — rota `/admin/whatsapp-test`
- `src/pages/WhatsappDiagnose.tsx` — rota `/admin/whatsapp-diagnostico`

Atualizar `src/App.tsx`: remover os 4 `lazy(...)` e as 4 `<Route>` correspondentes.

**Mantido (produção):** `/admin`, `/admin/whatsapp-logs`, `/auth`.

---

### 2. Edge function órfã (remover)

- `supabase/functions/whatsapp-diagnose/` — invocada apenas pela `WhatsappDiagnose.tsx` que será removida.

**Mantido:** `wc-products`, `wc-create-order`, `wc-get-order`, `whatsapp-webhook` (recebe callbacks do WhatsApp), `send-whatsapp-order` (acionada pelo fluxo real de pedido — embora só apareça referência na tela de teste, ela também é chamada pelo backend WooCommerce; mantida por segurança).

---

### 3. Componentes/utilitários não utilizados (remover)

Identificados via busca por imports — zero referências no código:

- `src/components/NavLink.tsx`
- `src/lib/phone.ts`
- `src/lib/batterySku.test.ts` (teste solto, sem runner configurado)

---

### 4. Componentes shadcn/ui não utilizados (remover)

24 arquivos em `src/components/ui/` sem nenhum import no projeto:

```
alert-dialog, alert, aspect-ratio, avatar, breadcrumb, card,
collapsible, command, context-menu, dropdown-menu, form,
hover-card, menubar, navigation-menu, pagination, popover,
radio-group, scroll-area, sidebar, sonner, switch, table,
textarea, toggle-group
```

Reduz superfície do bundle e ruído no editor. Se algum deles for necessário no futuro, pode ser readicionado via shadcn.

---

### 5. Logs de desenvolvimento

Varredura encontrou 5 chamadas a `console.*`:

| Arquivo | Tipo | Ação |
|---|---|---|
| `src/lib/perfMetrics.ts:44` | `console.info("[perf] …")` | **Remover** (debug de performance) |
| `src/wp-entry.tsx:10` | `console.warn("#root não encontrado")` | Manter (erro de bootstrap real) |
| `supabase/functions/wc-products/index.ts` | 2× `console.warn` upstream/fetch | Manter (telemetria de erro) |
| `src/pages/SkuValidation.tsx` | `console.warn` | Removido junto com a página |

---

### Resumo do impacto

- 4 páginas + 4 rotas removidas
- 1 edge function deletada (também via tool `delete_edge_functions`)
- 27 arquivos de componentes/libs órfãos removidos
- 1 `console.info` de debug removido
- **Sem mudanças visuais nem em fluxos de usuário final** (home, busca, blog, checkout, admin/logs continuam idênticos)

### Detalhes técnicos

- A remoção dos `lazy(...)` de páginas de teste reduz code-splits desnecessários no manifesto do Vite.
- Remover componentes shadcn não usados não afeta os que ficam — cada um é importado individualmente.
- `whatsapp-diagnose` será apagada também no servidor via `supabase--delete_edge_functions` para não ficar deployada órfã.
