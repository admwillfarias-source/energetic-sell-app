# Conversões Google Ads + GA4 via dataLayer/GTM

Implementação em duas frentes: (1) ajustes no código para o payload ficar 100% compatível com Google Ads/GA4 e instalação direta do gtag de conversão, (2) passo a passo de configuração no painel do GTM para você publicar.

## 1. Ajustes no código

### 1.1 Instalar gtag.js de Google Ads (`AW-994517528`) — `index.html` e `wp-theme/awr-baterias/index.php`
Logo após o snippet do GTM, no `<head>`:

```html
<!-- Google tag (gtag.js) - Google Ads -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-994517528"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-994517528');
</script>
```

E expor `gtag_report_conversion` global (mesma assinatura que o Google forneceu, `send_to: 'AW-994517528/axHrCPb1w6gcEJjEnNoD'`) para uso em botões/links de "Compra".

### 1.2 Ajustar payload do `purchase` — `src/pages/PedidoConfirmado.tsx`
Hoje os `items` enviam `item_name`, `quantity`, `price`. Google Ads/GA4 esperam também `item_id`. Atualizar para:

```ts
pushEvent("purchase", {
  transaction_id: String(order.number),
  value: Number(order.total) || 0,
  currency: order.currency || "BRL",
  items: order.line_items.map((li) => ({
    item_id: String(li.product_id ?? li.sku ?? li.name),
    item_name: li.name,
    quantity: li.quantity,
    price: li.quantity ? (Number(li.total) || 0) / li.quantity : Number(li.total) || 0,
  })),
});
```

E disparar **também** o `gtag` direto (redundância para garantir registro mesmo se a tag do GTM falhar):

```ts
window.gtag?.('event', 'conversion', {
  send_to: 'AW-994517528/axHrCPb1w6gcEJjEnNoD',
  value: Number(order.total) || 0,
  currency: 'BRL',
  transaction_id: String(order.number),
});
```

Tipar `WCOrder.line_items` com `product_id?: number` e `sku?: string` (campos que a API do Woo já retorna).

### 1.3 Ajustar payload do `begin_checkout` — `src/components/CheckoutDialog.tsx`
Mesma normalização: incluir `item_id` (usar `battery.id`/`battery.sku`) nos items.

## 2. Configuração no painel do GTM (`tagmanager.google.com`, container `GTM-5JTRM2L`)

### 2.1 Variáveis (Variables → User-Defined → New → Data Layer Variable)
Criar uma variável para cada campo que vamos reaproveitar:

| Nome da variável | Data Layer Variable Name |
|---|---|
| `dlv.transaction_id` | `transaction_id` |
| `dlv.value` | `value` |
| `dlv.currency` | `currency` |
| `dlv.items` | `items` |

### 2.2 Triggers (Triggers → New → Custom Event)
- `CE - purchase` → Event name: `purchase`
- `CE - begin_checkout` → Event name: `begin_checkout`
- `CE - lead_whatsapp` → Event name: `lead_whatsapp`
- `CE - lead_call` → Event name: `lead_call`

### 2.3 Tags Google Ads (Tags → New → Google Ads Conversion Tracking)
- **Compra** — Conversion ID `AW-994517528`, Label `axHrCPb1w6gcEJjEnNoD`, Value `{{dlv.value}}`, Currency `{{dlv.currency}}`, Order ID `{{dlv.transaction_id}}` → Trigger `CE - purchase`.
- **Lead WhatsApp** — criar conversão própria no Google Ads, copiar o label e usar Trigger `CE - lead_whatsapp`.
- **Lead Ligação** — idem para `CE - lead_call`.

### 2.4 Tags GA4 (Tags → New → Google Analytics: GA4 Event)
Você precisa do `Measurement ID` (G-XXXXXXX) do GA4. Na tag:
- Configuration Tag: criar primeiro um `GA4 Configuration` com seu `G-XXXXXXX` e trigger `All Pages`.
- `GA4 - purchase` → Event name `purchase`, Event Parameters: `transaction_id={{dlv.transaction_id}}`, `value={{dlv.value}}`, `currency={{dlv.currency}}`, `items={{dlv.items}}` → Trigger `CE - purchase`.
- `GA4 - begin_checkout` → mesmos parâmetros (sem `transaction_id`) → Trigger `CE - begin_checkout`.
- Opcional: `GA4 - generate_lead` para `lead_whatsapp`/`lead_call`.

No GA4 (`analytics.google.com` → Admin → Events → Conversions), marcar `purchase`, `begin_checkout` e `generate_lead` como conversões.

### 2.5 Validar no Preview Mode
1. GTM → botão **Preview** (Tag Assistant) → digitar a URL do site → Connect.
2. Na aba do site:
   - Abrir o Checkout → confirmar `begin_checkout` em **Summary**, com `value`, `currency`, `items` preenchidos.
   - Clicar no botão WhatsApp → conferir `lead_whatsapp`.
   - Clicar em "Ligar agora" (mobile) → conferir `lead_call`.
   - Finalizar um pedido de teste → na página `/pedido-confirmado` conferir `purchase` com `transaction_id`, `value`, `items[*].item_id`.
3. Em cada evento, verificar que as tags **Google Ads Conversion** e **GA4 Event** aparecem em "Tags Fired".
4. Se algo cair em "Tags Not Fired", clicar para inspecionar a condição que falhou.

### 2.6 Publicar
GTM → **Submit** → nome da versão (ex.: `conversoes-ads-ga4-v1`) → **Publish**.

## Arquivos a alterar

- `index.html` — adicionar gtag de `AW-994517528` + `gtag_report_conversion`.
- `wp-theme/awr-baterias/index.php` — mesmo snippet.
- `src/pages/PedidoConfirmado.tsx` — payload `purchase` com `item_id` + chamada direta `gtag('event','conversion',...)`.
- `src/components/CheckoutDialog.tsx` — payload `begin_checkout` com `item_id`.
- `src/lib/gtm.ts` — declarar `window.gtag` para tipagem TS.

## O que preciso de você

1. **Measurement ID do GA4** (`G-XXXXXXX`) — para configurar a tag GA4 Configuration. Sem ele, configuro só Google Ads agora e GA4 depois.
2. Existe **conversão de Lead** já criada no Google Ads (com label próprio para WhatsApp e Ligação)? Se sim, me passe os labels; se não, dá pra criar no painel do Google Ads e depois plugar no GTM.
