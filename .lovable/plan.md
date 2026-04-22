

## Criar templates pt_BR no Meta WhatsApp Manager

O erro #132001 confirma: a edge function está 100% funcional, faltam apenas os 2 templates aprovados. Esta é uma tarefa **manual sua no painel da Meta** — eu não consigo criar templates via API (a API de Management exige permissões `whatsapp_business_management` que normalmente não estão no token do app).

### Passo a passo no painel da Meta

1. Acesse [business.facebook.com/wa/manage/message-templates](https://business.facebook.com/wa/manage/message-templates)
2. Selecione a WABA do app `3503109783187532`
3. Clique em **Criar modelo** → categoria **UTILITY** → idioma **Português (BR)**

### Template 1 — `novo_pedido_loja`

- **Nome (exato, sem acento):** `novo_pedido_loja`
- **Categoria:** UTILITY
- **Idioma:** Português (BR) — `pt_BR`
- **Cabeçalho:** nenhum
- **Corpo (cole exatamente, com as variáveis na ordem):**

```
🔔 Novo pedido AWR
Cliente: {{1}}
Telefone: {{2}}
Veículo: {{3}}
Bateria: {{4}}
Total: R$ {{5}}
Entrega: {{6}}
```

- **Exemplos para aprovação** (a Meta exige exemplo de cada variável):
  - `{{1}}` = João Silva
  - `{{2}}` = 5551999998888
  - `{{3}}` = Fiat Palio Weekend 2010
  - `{{4}}` = 1x Heliar 60Ah
  - `{{5}}` = 450,00
  - `{{6}}` = Rua Exemplo 123, Porto Alegre

- **Rodapé / botões:** nenhum

### Template 2 — `confirmacao_pedido_cliente`

- **Nome (exato):** `confirmacao_pedido_cliente`
- **Categoria:** UTILITY
- **Idioma:** Português (BR) — `pt_BR`
- **Corpo:**

```
Olá {{1}}! Recebemos seu pedido na AWR Baterias 🔋
Bateria: {{2}}
Total: R$ {{3}}
Em instantes nossa equipe confirma a entrega. Dúvidas? Responda esta mensagem.
```

- **Exemplos:**
  - `{{1}}` = João
  - `{{2}}` = 1x Heliar 60Ah
  - `{{3}}` = 450,00

### Cuidados que evitam rejeição

- Categoria **deve ser UTILITY** (não MARKETING) — pedidos transacionais cabem aqui e aprovam mais rápido (~30 min a 2h)
- Nome do template **idêntico** ao código (`novo_pedido_loja`, `confirmacao_pedido_cliente`) — a função busca exatamente esses nomes
- Idioma **deve ser** Português (BR) / `pt_BR`
- Não inclua links, emojis em excesso ou texto promocional ("aproveite", "desconto") — isso joga pra MARKETING
- Preencha os exemplos de cada variável — sem isso a Meta rejeita

### O que eu faço depois (parte de código, modo padrão)

Quando os templates estiverem com status **Aprovado** no painel:

1. **Adicionar uma checagem no `whatsapp-diagnose`** que liste os templates da WABA e mostre o status de cada um (`APPROVED`, `PENDING`, `REJECTED`) — assim você confirma na página `/admin/whatsapp-diagnostico` antes de testar
2. **Melhorar mensagens de erro no `send-whatsapp-order`**: detectar erro 132001 e devolver um texto claro tipo *"Template ainda não aprovado ou idioma errado — confira em /admin/whatsapp-diagnostico"* em vez do JSON cru da Meta
3. **Testar de ponta a ponta em `/admin/whatsapp-test`** com seu telefone e validar:
   - Mensagem chega na loja (`5551993199486`)
   - Mensagem chega no cliente
   - Logs aparecem em `/admin/whatsapp-logs` com `ok = true`

### Fluxo completo

```text
Você → cria 2 templates no painel Meta (manual, ~30 min + 1h aprovação)
   ↓
Você → me avisa "templates aprovados"
   ↓
Eu → adiciono listagem de templates no /admin/whatsapp-diagnostico
Eu → melhoro mensagens de erro da edge function
Eu → testo via /admin/whatsapp-test com seu número
   ↓
Pronto: pedido sai do checkout direto pro WhatsApp da loja + cliente
```

### Próxima ação sua

Crie os 2 templates agora seguindo os textos acima. Quando aparecerem como **Aprovado** no painel da Meta, me responde **"templates aprovados"** que eu sigo com os passos 1–3.

