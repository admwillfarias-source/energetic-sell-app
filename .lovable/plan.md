

## Análise Moura Fácil → Melhorias para AWR Baterias

Estudei o site mourafacil.moura.com.br (referência do mercado) e comparei com a sua landing atual. Abaixo estão as melhorias recomendadas, separadas por prioridade e por dispositivo.

---

### O que a Moura faz bem (e a AWR ainda não usa)

1. **Indicador social ao vivo** — badge "27 entregas em andamento" no hero, gera urgência e prova social.
2. **Selo de parcelamento destacado** — "10x sem juros" em badge circular grande no hero.
3. **Stepper visual de 3 passos** — "Selecione local → Pagamento na entrega → Entrega e instalação grátis", logo abaixo do hero.
4. **Depoimentos com avatar/iniciais + cidade + data** (não apenas estrelas).
5. **Linhas de produto segmentadas** — seções dedicadas a moto e caminhão, com CTA próprio.
6. **Bloco de formas de pagamento** no rodapé (PIX, Master, Visa, Elo) com ícones.
7. **Selo de segurança** (Site Blindado) no rodapé.
8. **Botão flutuante de WhatsApp no desktop** (canto inferior direito).
9. **FAQ na home** com 3 perguntas-chave + link "ver mais".

---

### Melhorias prioritárias — MOBILE

| # | Melhoria | Onde | Impacto |
|---|---|---|---|
| M1 | Adicionar **stepper "1. Busque seu carro → 2. Confirme entrega → 3. Pagamento na entrega"** abaixo do hero | novo componente `HowToOrder` no `Index.tsx` | Reduz fricção de primeira compra |
| M2 | Mostrar **badge "10x sem juros"** sempre visível dentro do hero (hoje só aparece no texto) | `HeroSection.tsx` | Conversão |
| M3 | **Depoimentos com avatar + cidade + data** (3 cards, swipe horizontal no mobile) | novo `Testimonials.tsx` | Confiança |
| M4 | Reduzir altura do `MobileActionBar` em 4px e dar **mais contraste** ao texto (atualmente fundo escuro pode confundir com sistema iOS) | `MobileActionBar.tsx` | Usabilidade |
| M5 | **FAQ resumida (3 perguntas)** na home antes do footer | `FaqHome.tsx` usando `faqData.ts` | SEO + objeções |
| M6 | Adicionar **microcópia "Pagamento só na entrega"** nos botões de checkout do `BatteryCard` | `BatteryCard.tsx` | Reduz abandono |

### Melhorias prioritárias — DESKTOP

| # | Melhoria | Onde | Impacto |
|---|---|---|---|
| D1 | **Botão flutuante de WhatsApp** no canto inferior direito (só desktop, mobile já tem barra) | novo `FloatingWhatsApp.tsx` | CTA persistente |
| D2 | **Contador de entregas "X entregas em andamento hoje"** no hero (pode ser número simulado entre 8-25 com leve variação por hora) | `HeroSection.tsx` | Urgência |
| D3 | **Seções de linha de produto** (Moto, Caminhão, Estacionária) como cards horizontais clicáveis filtrando o catálogo | novo `ProductLines.tsx` | Descoberta |
| D4 | **Bloco de formas de pagamento** no footer com ícones PIX/Visa/Master/Elo + parcelamento | `Footer.tsx` | Confiança |
| D5 | **Selo de segurança** (cadeado SSL + "Site seguro") no footer | `Footer.tsx` | Confiança |
| D6 | Stepper visual de 3 passos lado-a-lado (mesmo do mobile, layout horizontal) | `HowToOrder.tsx` | Conversão |

### Performance / técnico (ambos)

| # | Melhoria |
|---|---|
| P1 | Pré-carregar logo da fonte de hero no `<head>` (`<link rel="preload" as="image">`) — ganha LCP |
| P2 | `loading="lazy"` nos logos das montadoras |
| P3 | Remover `animate-pulse-glow` do botão WhatsApp do hero quando `prefers-reduced-motion` |
| P4 | Adicionar `Schema.org/Review` nos depoimentos para rich snippets |

---

### Escopo proposto para implementar agora (Fase 1)

Sugiro entregar em duas fases. A **Fase 1** captura o maior ganho com baixo esforço:

1. **HowToOrder** (stepper 3 passos) — M1/D6
2. **Testimonials** com avatar + cidade + data — M3
3. **Badge "10x sem juros" no hero** — M2
4. **Botão flutuante WhatsApp desktop** — D1
5. **Bloco de pagamentos + selo no footer** — D4/D5
6. **FAQ resumida na home** — M5
7. **Contador "entregas em andamento"** no hero — D2

Fase 2 (depois): seções de linha de produto (Moto/Caminhão), microcópias de checkout, melhorias de performance P1–P4.

### Detalhes técnicos da Fase 1

- Novos arquivos: `src/components/HowToOrder.tsx`, `src/components/Testimonials.tsx`, `src/components/FaqHome.tsx`, `src/components/FloatingWhatsApp.tsx`, `src/components/PaymentMethods.tsx`.
- Edições: `HeroSection.tsx` (badge 10x + contador), `Footer.tsx` (pagamentos + selo), `Index.tsx` (incluir as novas seções com `LazySection`/`Suspense`), `MobileActionBar.tsx` (ajuste contraste).
- Reuso: `faqData.ts` já existe → alimenta o `FaqHome`. Depoimentos ficam em um array constante dentro do componente (3-5 itens iniciais).
- Ícones de pagamento: SVGs locais em `src/assets/payments/` (PIX, Visa, Master, Elo).
- Sem alterações de banco. Sem novas dependências.

