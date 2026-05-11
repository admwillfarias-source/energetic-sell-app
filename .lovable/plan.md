# Plano — Landing page focada em conversão

Reaproveita os componentes existentes (`Benefits`, `HowItWorks`, `ManufacturerLogos`, `Testimonials`, `FaqHome`, `Footer`) atualizando cópia/ordem, e cria 1 novo bloco (CTA final). Mantém o tema atual (dark + laranja/amarelo).

## 1. Hero (`src/components/HeroSection.tsx`)

- **H1:** "Sua bateria nova em até 35 minutos — entregue e instalada" (manter destaque em laranja na expressão "35 minutos").
- **Subtítulo:** "Selecione o modelo ideal para o seu veículo e solicite agora. Atendemos Porto Alegre e região com Moura, Heliar, Zetta e Excell."
- **CTA principal:** o botão laranja "Buscar" ao lado do input vira "Pedir minha bateria agora", largura total abaixo do input (não inline), centralizado, `h-14`, `text-base/lg`, fundo `bg-primary` (laranja já no tema), `shadow-lg`. Mantém comportamento atual de abrir o overlay de busca.
- **Linha de urgência abaixo do CTA:** badge sutil `🟢 Técnicos disponíveis agora · Pagamento em 10x sem juros` (texto sm, cor `awr-green`).
- Manter chips "Buscas frequentes" e botão WhatsApp existentes.
- Remover o callout `AlertTriangle` ("Precisando de bateria…") para reduzir ruído acima do CTA.

## 2. Reordenar seções da home (`src/components/home/HomeMiddle.tsx` + `HomeBottom.tsx`)

Nova ordem (logo abaixo do Hero + TrustBar):
1. **Diferenciais** → `Benefits` (atualizado, ver abaixo) — título adicionado: "Por que escolher a AWR?"
2. **Marcas** → `ManufacturerLogos` — título: "Trabalhamos com as melhores marcas"
3. **Como funciona** → `HowItWorks` (atualizado, 3 passos) — título: "Simples assim:"
4. **Depoimentos** → `Testimonials` — título: "O que nossos clientes dizem" (substituir 3 primeiros por Carlos M./Ana P./Roberto S.)
5. **FAQ** → `FaqHome` (estender para 5 perguntas) — título: "Dúvidas frequentes"
6. **CTA Final** → novo `FinalCtaBanner`
7. **Footer** existente

`HomeMiddle` passa a conter Diferenciais + Marcas + Como funciona + Depoimentos.
`HomeBottom` passa a conter FAQ + FinalCtaBanner + Footer + FloatingWhatsApp. Remove `QuickNavigation` e `HowToOrder`/`BestSellers` da home (mantidos no projeto, só não exibidos).

## 3. Atualizações de cópia em componentes existentes

- **Benefits**: trocar 4 itens para Zap/35min, Battery/Marcas originais, CreditCard/10x, Shield/Desde 2009. Adicionar título de seção centralizado.
- **HowItWorks**: reduzir para 3 passos numerados (Escolha → Endereço → Receba) com cópia exata do briefing.
- **ManufacturerLogos**: garantir título "Trabalhamos com as melhores marcas" e fundo claro/sutil contraste; usar logos existentes.
- **Testimonials**: garantir 3 depoimentos do briefing como primeiros, 5 estrelas, nome + cidade.
- **FaqHome**: ler 5 perguntas do briefing (sobrepor `homepageFaqs.slice` para usar lista local com as 5 perguntas exatas).

## 4. Novo `src/components/FinalCtaBanner.tsx`

- Fundo `bg-secondary` (escuro do tema), gradiente sutil.
- Título grande "Precisa de bateria agora?", subtítulo "Técnicos disponíveis. Entrega em até 35 minutos."
- Botão grande `Pedir minha bateria` que abre WhatsApp (`https://wa.me/5551993199486?text=…`) — em mobile.
  No desktop, mostra também botão secundário "Voltar ao topo" que faz scroll para `#inicio`.
- Importado em `HomeBottom`.

## 5. Footer (`src/components/Footer.tsx`)

- Verificar se já contém logo, links rápidos (Início, Como funciona, Contato), WhatsApp clicável e linha de copyright. Atualizar copyright para "© 2026 AWR Baterias — Porto Alegre, RS" se necessário (sem reescrever todo o footer).

## 6. Verificação

- Build passa sem erros TS.
- Sanity manual: scroll completo na `/` mostra Hero novo → Benefits → Marcas → Como funciona → Depoimentos → FAQ → CTA Final → Footer.
- CTA principal no hero abre o overlay; CTA final abre WhatsApp.
- Mobile: botão CTA do hero ocupa 100% da largura; layout dos cards quebra para 1 coluna.

## Notas técnicas

- Não alterar lógica de fitments / `parseCodesParam` / overlay — apenas cópia, layout e ordem.
- Manter `id="inicio"` no Hero para o scroll do CTA final.
- Tokens semânticos do design system (`primary`, `secondary`, `accent`, `awr-green`) — sem cores hardcoded novas.
