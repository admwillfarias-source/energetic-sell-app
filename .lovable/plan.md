# Pré-carregar SearchOverlay ao entrar parcialmente em viewport

Hoje o `SearchOverlay` é `lazy()` em `HeroSection.tsx` e só baixa quando o usuário foca/clica. Vamos antecipar: assim que o herói aparecer parcialmente na tela, disparamos o `import()` do chunk em background.

## Mudança

Em `src/components/HeroSection.tsx`:

1. Adicionar uma `ref` no `<section id="inicio">`.
2. Em um `useEffect`, criar um `IntersectionObserver` com `threshold: 0.1` (10% visível). Ao primeiro `isIntersecting`:
   - chamar `import("@/components/SearchOverlay")` para puxar o chunk em background;
   - desconectar o observer (one-shot).
3. Guardar o estado de "já pré-carregado" em um `useRef<boolean>` para evitar imports duplicados se o efeito reexecutar.
4. Fallback: se `IntersectionObserver` não existir (browser muito antigo), agendar via `requestIdleCallback` em ~1s.

Como o herói está acima da dobra, o observer dispara já no primeiro frame após o mount — bem antes do usuário clicar/focar. Quando o `setOverlayOpen(true)` rodar, o `Suspense` resolve em ~0 ms.

## Arquivos tocados

- `src/components/HeroSection.tsx` — único arquivo alterado.

Sem mudança visual, sem novos chunks. Apenas antecipa o download do chunk existente.
