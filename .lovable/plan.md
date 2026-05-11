# Plano de Ajustes — Fluxo de busca / Resultado

## 1. Sincronizar autocomplete do SearchOverlay com `codes` + `v`

**Arquivos:** `src/components/SearchOverlay.tsx`, `src/components/HeroSection.tsx`

- Adicionar nova prop opcional `initialCodes?: string[]` em `SearchOverlay`.
- Quando o overlay abre via fallback (chip sem fitment), passar `initialCodes` (vazio nesse caso) e manter `initialQuery`/`notFoundLabel` já existentes.
- Em `VehicleAutocomplete`: aceitar nova prop `autoSelectFirst?: boolean`. Quando `initialQuery` é fornecido + `autoSelectFirst`, ao terminar de carregar o catálogo, se houver exatamente uma sugestão de alta confiança (modelo+ano), pré-selecioná-la (highlight=0, abrir dropdown automaticamente). Sem auto-navegar — apenas refletir filtros visíveis (lista de sugestões + badge de códigos compatíveis), evitando exigir nova interação para começar a ver opções.
- Repassar `autoSelectFirst` do `SearchOverlay` quando ele recebe `initialQuery` ou `notFoundLabel`.

## 2. Robustez do estado de carregamento (chip + overlay)

**Arquivo:** `src/components/HeroSection.tsx`

- `handleQuickSearch`: envolver toda a lógica em `try/catch/finally`. No `finally`, sempre `setChipLoading(null)` para garantir que erros (rede, exceção em `getStrictVehicleCodes`, navegação bloqueada) não prendam o overlay de loading.
- Adicionar timeout de segurança (e.g. `setTimeout(() => setChipLoading(null), 8000)`) limpado quando navegação acontece, para o caso da navegação não desmontar o componente.
- Tratar erro de `ensureCatalogLoaded` exibindo um toast curto ("Não conseguimos carregar o catálogo, tente novamente") e mantendo a UI utilizável.

## 3. Mensagem do WhatsApp enriquecida com `codes` e `v`

**Arquivos:** `src/pages/Resultado.tsx`, `src/components/SearchOverlay.tsx`

- Centralizar um helper `buildWhatsAppMessage({ vehicle, codes })` em `src/lib/whatsapp.ts` (novo arquivo pequeno) ou inline nos dois arquivos. Formato sugerido:
  ```
  Olá! Preciso de uma bateria.
  Veículo: <v>
  Códigos pesquisados: <codes.join(", ")>
  Podem me ajudar a confirmar a opção certa?
  ```
- Quando `vehicle` não existir, omitir a linha "Veículo:". Quando `codes` vazios, omitir "Códigos pesquisados:".
- Substituir as construções atuais em `Resultado.tsx` (botão WhatsApp do empty state) e `SearchOverlay.tsx` (`buildWhatsAppUrl`) por esse helper.

## 4. Testes do parsing de `codes` em `/resultado`

**Arquivos novos:** `src/lib/parseCodesParam.ts`, `src/lib/parseCodesParam.test.ts`

- Extrair a lógica de parsing atual de `Resultado.tsx` (linhas 41-53) para uma função pura `parseCodesParam(raw: string): string[]` exportada de `src/lib/parseCodesParam.ts`. Substituir o uso inline em `Resultado.tsx`.
- Testes (vitest) cobrindo:
  - vírgula simples: `"A,B,C"` → `["A","B","C"]`
  - barra: `"A/B/C"` → `["A","B","C"]`
  - mistura vírgula + barra + espaço + pipe + ponto-e-vírgula: `"A, B/C;D|E F"` → `["A","B","C","D","E","F"]`
  - duplicados case-insensitive: `"a,A,b"` → `["A","B"]`
  - vazio / só separadores: `""`, `",,,"`, `" / / "` → `[]`
  - encoding já decodificado com `+`: aceito como espaço pelo `URLSearchParams`, validar comportamento esperado.
  - preserva ordem da primeira ocorrência.

## 5. Verificação

- `bunx vitest run src/lib/parseCodesParam.test.ts` (ou via tool de testes).
- Sanity manual no preview: navegar `/resultado?codes=MF60AD/ECON60EFB,HEFB60HD&v=Renault+Kwid+2025` e confirmar 3 códigos parseados; clicar chip Hero sem fitment para validar que loading se limpa e overlay abre com query refletida.

## Detalhes técnicos

- Manter API pública dos componentes retrocompatível (todas as novas props são opcionais).
- Não tocar em `src/integrations/supabase/*` nem em lógica de fetch.
- `parseCodesParam` permanece puro/sem dependências para teste rápido.
