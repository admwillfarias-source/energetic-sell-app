## Objetivo
Reduzir o espaço vertical entre o cabeçalho fixo e o conteúdo do Hero (badges, H1, parágrafo, busca) para o usuário ler e agir mais rápido — sem mudar layout, cores ou copy.

## Onde está o espaço hoje (`src/components/HeroSection.tsx`)
- `section`: `min-h-[80vh] flex items-center pt-2 lg:pt-16` → centraliza verticalmente em 80vh, gerando muito “ar” no topo.
- container interno: `py-12 md:py-20` → 48–80px extra acima/abaixo.
- badges row: `mb-6`
- H1: `mb-4`
- parágrafo: `mb-6`

## Mudanças propostas (só CSS/Tailwind, presentation-only)
1. `section`: trocar `min-h-[80vh] flex items-center` por `min-h-0` e remover o centramento vertical → o conteúdo encosta no topo logo após o header.
2. `section`: ajustar padding de topo para compensar o header fixo (mobile 120px / desktop 64px já vêm do `<main>` no `Index.tsx`) — manter `pt-2 lg:pt-4` apenas como respiro.
3. Container interno: `py-12 md:py-20` → `py-4 md:py-8`.
4. Linha de badges: `mb-6` → `mb-3`.
5. H1: `mb-4` → `mb-2`.
6. Parágrafo subtítulo: `mb-6` → `mb-3`.
7. Card de busca: manter como está (já é o foco visual).

Resultado: ~120–160px a menos entre o topo do header e o H1 em mobile, ~80–100px em desktop. O CTA e a busca sobem para a primeira dobra mais rapidamente.

## Fora de escopo
- Não mexer em `index.html` (shell estático do hero) — só no componente React que substitui o shell ao montar. Se quiser que o shell estático também encolha, faço num passo separado.
- Sem mudanças em copy, ícones, cores, fontes, lógica ou tracking.
- Sem alteração no `Index.tsx` (`pt-[120px] lg:pt-16` do `<main>` continua igual).

## Arquivos afetados
- `src/components/HeroSection.tsx` (somente classes Tailwind nas linhas 158, 180, 182, 209, 215)
