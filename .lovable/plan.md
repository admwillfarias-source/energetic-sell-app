

## Novo Checkout no estilo Moura Fácil — Wizard 3 passos

Vou refatorar o `CheckoutDialog` para um fluxo guiado em 3 passos com barra de progresso e card de resumo do pedido sempre visível, mantendo as duas finalizações (WhatsApp principal + Loja online no desktop).

### Layout do diálogo

```text
┌──────────────────────────────────────────┐
│  Finalizar pedido                    [X] │
│  ●━━━━━━○━━━━━━○                         │  ← Stepper (1/3, 2/3, 3/3)
│  Endereço   Veículo   Pagamento          │
├──────────────────────────────────────────┤
│                                          │
│   [conteúdo do passo atual]              │
│                                          │
│   ┌─ Resumo do pedido ────────────────┐  │
│   │ 1x Moura M60GD ........ R$ 549,00 │  │  ← Card sticky no rodapé
│   │ Instalação ............... Grátis │  │     (visível em todos os passos)
│   │ Total ................. R$ 549,00 │  │
│   └───────────────────────────────────┘  │
│                                          │
│  [ Voltar ]            [ Continuar → ]   │
└──────────────────────────────────────────┘
```

### Passo 1 — Entrega
- Cards grandes selecionáveis: **Entrega rápida** / **Agendar** / **Retirar na loja** (mesmo componente atual, só promovido para o topo).
- Se rápida/agendada: campos **CEP** (com ViaCEP), **Endereço**, **Número**.
- Se agendada: data + hora.
- Se retirada: select de loja (sem endereço).
- Botão **Continuar** valida só os campos deste passo.

### Passo 2 — Veículo e bateria
- Bloco somente-leitura mostrando a(s) bateria(s) do carrinho com imagem, nome, qtd, preço (estilo Moura).
- Campo **Carro e ano** com autocomplete (já existe), pré-preenchido pela busca anterior.
- Microcópia: "Confirme que esta bateria atende seu veículo. Se tiver dúvida, escolhemos pelo modelo na entrega."
- Botões **Voltar** / **Continuar**.

### Passo 3 — Contato e pagamento
- Campos **Nome**, **CPF/CNPJ**, **Telefone**.
- Campo **Forma de pagamento** (Pix/cartão/dinheiro).
- Aviso destacado: **"Pagamento somente na entrega"** + badge "10x sem juros no cartão".
- Botões finais (mantidos): **Enviar pelo WhatsApp** (verde, principal) e, no desktop, **Finalizar na loja online** (outline secundário) com o divisor "ou".

### Detalhes técnicos

- Arquivo único editado: `src/components/CheckoutDialog.tsx`. Sem novas dependências.
- Estado `step: 1 | 2 | 3` controla o conteúdo. Validação por passo usa subsets do schema Zod já existente (`baseSchema`, `enderecoSchema`); o `schema` final continua valendo no submit.
- Stepper visual: 3 bolinhas + label + linha conectora, usando Tailwind. Verde (`success`) para passos concluídos, primary para atual, muted para futuros. Clicável para voltar a passo anterior.
- Card de resumo: extraído para componente interno `OrderSummary` reutilizado no rodapé do dialog. Usa `items` e `subtotal` do `useCart`.
- Navegação: botões "Voltar"/"Continuar"; Enter no input do último passo dispara WhatsApp (comportamento atual preservado).
- Reset: ao fechar o dialog, volta para `step: 1`.
- Mantém: ViaCEP, autocomplete de carro, integração `wc-create-order`, mensagem WhatsApp formatada, toasts e `clear()` do carrinho.
- Mobile: cada passo ocupa a tela inteira; stepper compacto (só números, sem labels) abaixo de 380px.
- Acessibilidade: `aria-current="step"` no passo ativo, `aria-label` nos botões de navegação, foco automático no primeiro campo de cada passo.

### O que NÃO muda

- `CartDrawer`, `CartContext`, edge function `wc-create-order`, schema Zod, número do WhatsApp, lojas de retirada, lista de modalidades de entrega.

