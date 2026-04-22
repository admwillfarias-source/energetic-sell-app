

## WhatsApp via Meta Cloud API (oficial, gratuito até 1.000 conversas/mês)

Implementação do envio direto do pedido pelo WhatsApp sem o cliente sair do site, usando a API oficial da Meta.

### O que você precisa fazer antes (uma vez, ~30 min)

1. Criar conta no [Meta Business Manager](https://business.facebook.com)
2. Em [Meta for Developers](https://developers.facebook.com): criar app → adicionar produto **WhatsApp**
3. Cadastrar um **número dedicado** (não pode ser um WhatsApp já em uso). Pode usar chip novo ou número virtual.
4. Aprovar **2 templates de mensagem** em português (categoria UTILITY, aprovação leva ~1h):

   **Template `novo_pedido_loja`** (vai para a loja):
   ```
   🔔 Novo pedido AWR
   Cliente: {{1}}
   Telefone: {{2}}
   Veículo: {{3}}
   Bateria: {{4}}
   Total: R$ {{5}}
   Entrega: {{6}}
   ```

   **Template `confirmacao_pedido_cliente`** (vai para o cliente):
   ```
   Olá {{1}}! Recebemos seu pedido na AWR Baterias 🔋
   Bateria: {{2}}
   Total: R$ {{3}}
   Em instantes nossa equipe confirma a entrega. Dúvidas? Responda esta mensagem.
   ```

5. Coletar 2 dados no painel da Meta:
   - **Phone Number ID** (em WhatsApp → API Setup)
   - **Permanent Access Token** (System User token, não o temporário de 24h)

### O que vou implementar

**1. Edge function `send-whatsapp-order`** (`supabase/functions/send-whatsapp-order/index.ts`)
- Valida payload com Zod (cliente, items, total, telefone)
- Faz 2 chamadas paralelas para `https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages`:
  - Para `5551993199486` usando template `novo_pedido_loja`
  - Para o telefone do cliente usando template `confirmacao_pedido_cliente`
- CORS liberado, retorna `{ ok, lojaId, clienteId, errors }`
- Não falha se uma das mensagens der erro (loga e continua) — pedido nunca é bloqueado por falha de WhatsApp
- Secrets necessários: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`

**2. Integração no `CheckoutDialog.tsx`**
- No clique do botão WhatsApp do passo 3, em paralelo com `wc-create-order`:
  - `supabase.functions.invoke("send-whatsapp-order", { body })`
  - Toast de sucesso: "Pedido enviado! Você receberá a confirmação no WhatsApp em instantes."
  - Limpa carrinho e fecha diálogo — **cliente permanece no site**
- Se a API falhar, mostra toast com botão fallback "Abrir WhatsApp" que usa o `wa.me` atual
- Adiciona pequeno texto abaixo do botão: "Confirmação automática no seu WhatsApp"

**3. config.toml**
- Adiciona bloco `[functions.send-whatsapp-order]` com `verify_jwt = false` (chamada pública do checkout)

### O que NÃO muda

- `wc-create-order` continua disparando em paralelo (pedido vai pro WooCommerce)
- Botão "Finalizar na loja online" no desktop, layout do checkout, fluxo do carrinho, número da loja

### Próximos passos depois de aprovar este plano

1. Você cria o app na Meta e aprova os 2 templates (eu te ajudo se travar em algum ponto)
2. Você me confirma quando tiver os 2 dados → eu peço pelo formulário seguro de secrets
3. Implemento a edge function + integração no checkout
4. Testamos juntos com um pedido real

