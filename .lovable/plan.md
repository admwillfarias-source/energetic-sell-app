## O que vai mudar

Hoje o cliente clica no campo de busca do Hero e digita carro+ano à mão. Vamos copiar a melhor parte do Moura Fácil: ao clicar/focar no campo, **abre um overlay em tela cheia por cima do site** com:

1. Um campo de busca grande, já focado e pronto para digitar.
2. Logo abaixo, **atalhos visuais com os modelos mais vendidos no Brasil dos últimos 10 anos** — basta clicar no card, escolher o ano e ir direto para o resultado.
3. Botão "fechar" / clique fora / tecla `Esc` para voltar ao site.

O overlay funciona tanto no desktop quanto no celular, sem mudar de rota (mantém o `/`), abrindo instantaneamente.

## Fluxo do usuário

```text
[Home] clique no campo de busca
   │
   ▼
[Overlay tela cheia]
 ┌────────────────────────────────┐
 │  ✕                              │
 │  Encontre a bateria do seu carro│
 │  ┌──────────────────────────┐   │
 │  │ 🔍  Onix 2018...         │   │
 │  └──────────────────────────┘   │
 │                                 │
 │  Mais buscados                  │
 │  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
 │  │Onix│ │HB20│ │Strd│ │Polo│    │
 │  └────┘ └────┘ └────┘ └────┘    │
 │  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
 │  │Argo│ │Mobi│ │Kwid│ │Coro│    │
 │  └────┘ └────┘ └────┘ └────┘    │
 │  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
 │  │Tcrs│ │Trck│ │Comp│ │Hilx│    │
 │  └────┘ └────┘ └────┘ └────┘    │
 └────────────────────────────────┘
   │
   ▼ (clicou em "Onix")
[Mini-stepper de ano]
   │ 2024 · 2023 · 2022 · 2021 · 2020 · 2019 · 2018 · 2017 · 2016 · 2015
   ▼
[/resultado?codes=...&v=Chevrolet Onix 2018]
```

## Carros propostos (top vendidos no BR — últimos 10 anos)

12 atalhos no overlay, em ordem de popularidade:

1. Chevrolet Onix
2. Hyundai HB20
3. Fiat Strada
4. Volkswagen Polo
5. Fiat Argo
6. Fiat Mobi
7. Renault Kwid
8. Toyota Corolla
9. Volkswagen T-Cross
10. Chevrolet Tracker
11. Jeep Compass
12. Toyota Hilux

Cada card mostra: marca + modelo + um ícone/silhueta (lucide `Car`/`Truck` por enquanto, sem precisar de imagens externas).

## Detalhes técnicos

**Novos arquivos**
- `src/components/SearchOverlay.tsx` — Dialog full-screen (usando `@/components/ui/dialog` que já existe), contém:
  - `<VehicleAutocomplete variant="inline" />` reaproveitado (já tem toda a lógica de busca, sugestões, navegação para `/resultado`).
  - Grid responsiva (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4`) com os 12 cards.
  - Sub-componente local `YearPicker` que aparece ao clicar num card: lista os 10 anos (atual − 9 .. atual) como pílulas. Ao escolher, chama a mesma função de busca do `VehicleAutocomplete` (`searchVehicles("Onix 2018")` → pega os codes → `navigate("/resultado?codes=...&v=...")`).
- `src/data/topVehicles.ts` — array com `{ brand, model, label, icon }` dos 12 modelos, fácil de editar depois.

**Arquivos editados**
- `src/components/HeroSection.tsx`
  - O `SearchPlaceholder` já tem `onActivate` — em vez de só carregar o autocomplete inline, chama `setOverlayOpen(true)`.
  - Quando o overlay fecha, foco volta para o campo do Hero.
  - Mantém o autocomplete inline atual como fallback (caso JS falhe / SSR), mas no fluxo normal o overlay é a porta de entrada.
- (Opcional) `src/components/Header.tsx` — se houver um botão de busca no header mobile, ele também abre o mesmo overlay.

**Lógica de seleção do carro**
- Ao clicar num card + escolher ano, montamos `query = "${model} ${year}"` e usamos `searchVehicles(query, 1)` (já existe em `src/lib/fitments.ts`).
- Se retornar 1 sugestão → `navigate("/resultado?codes=...&v=...")` igual ao autocomplete.
- Se retornar 0 (ex.: ano sem fitment cadastrado) → toast "Sem aplicação cadastrada para esse ano, tente outro" e mantém o overlay aberto.
- O catálogo (`ensureCatalogLoaded`) precisa estar pronto antes de resolver os codes — já é o que o `VehicleAutocomplete` faz.

**Acessibilidade & UX**
- `Dialog` do shadcn já cuida de focus trap, `Esc` para fechar, `aria-modal`, `aria-labelledby`.
- Auto-foco no input ao abrir.
- Animação rápida de fade/scale (já incluída no Dialog).
- No mobile, overlay ocupa 100vh com scroll interno.

**Performance**
- `SearchOverlay` é `lazy()` — só baixa o chunk quando o cliente realmente clica no campo. Não impacta o LCP.
- Marca um evento `markEvent("search_overlay_opened")` no `perfMetrics` para medirmos o ganho.

## O que NÃO muda
- A página `/resultado` continua igual.
- A seção "Mais vendidas" (cards de baterias abaixo do "Como pedir") continua igual — são coisas diferentes (baterias × carros).
- O autocomplete inline antigo continua funcionando como fallback dentro do overlay.