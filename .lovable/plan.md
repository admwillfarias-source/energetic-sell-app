

## Objetivo
Substituir a busca atual (que envia só o nome do modelo para o WooCommerce) por uma **busca por aplicação veicular real**, baseada nos catálogos oficiais Moura/Heliar. Reformular os filtros do catálogo com a lista correta de marcas e amperagens.

## Como vai funcionar

```text
Cliente seleciona: Marca → Modelo → Ano (ex: Fiat → Uno → 2015)
        ↓
Sistema consulta catálogo de aplicações local (JSON gerado dos PDFs)
        ↓
Encontra o(s) código(s) técnico(s) compatíveis: ex "M50ED", "M60AD"
        ↓
Busca esses códigos no WooCommerce (via edge function wc-products)
        ↓
Mostra produtos compatíveis + aviso "Compatível com seu Fiat Uno 2015"
```

## Etapas de implementação

### 1. Extrair catálogo de aplicações (build-time)
- Script Node em `scripts/build-fitments.ts` que lê o PDF Moura via `pdf-parse`, extrai linhas `VEÍCULO | ANO | CÓDIGO MOURA` e gera `src/data/fitments.json` no formato:
  ```json
  [{ "brand": "Fiat", "model": "Uno", "yearStart": 2010, "yearEnd": 2018, "codes": ["M50ED"] }]
  ```
- Heliar: o PDF não pôde ser parseado (provavelmente escaneado). Vou tentar OCR via `pdftoppm + tesseract` no script. Se falhar, uso só Moura no MVP e adiciono Heliar depois.
- O JSON final fica versionado no repo (~200-500KB) — sem custo em runtime.

### 2. Helper de lookup
- `src/lib/fitments.ts`:
  - `getCarBrands()` — lista única de marcas extraída do JSON
  - `getModels(brand)` — modelos daquela marca
  - `getYears(brand, model)` — anos disponíveis
  - `findCompatibleCodes(brand, model, year): string[]` — códigos de bateria

### 3. Hero busca real
- `Hero.tsx`: trocar `carBrands`/`years` mocks por dados de fitments (cascata Marca→Modelo→Ano só com opções válidas).
- Ao buscar, navega para `/?codes=M50ED,M60AD&v=Fiat+Uno+2015#catalogo`.

### 4. BatteryGrid usa códigos
- Lê `?codes` do query string e chama `fetchBatteries({ codes })`.
- `wc-products` (edge function) aceita `?codes=M50ED,M60AD` e faz uma busca por SKU/título no WooCommerce para cada código (em paralelo), deduplicando.
- Banner no topo do catálogo: "Mostrando baterias compatíveis com **Fiat Uno 2015**" + botão "Limpar".

### 5. Reformular filtros (corrigir lista)
Atualizar em `BatteryGrid.tsx` e `src/data/batteries.ts`:
- **Marcas**: Moura, Heliar, Excell, Freedom, Moura Nobreak, Moura Moto, Motobatt, Zetta, Eletran
- **Amperagens**: 5, 6, 7, 45, 50, 60, 70, 72, 80, 90, 92, 95, 100, 150, 180
- Melhorar `detectBrand`/`detectAmperage` em `src/lib/api/batteries.ts` para reconhecer todas essas marcas (hoje só detecta 4) e amperagens pequenas (5-7Ah de moto/nobreak).
- Filtros aplicados sobre o resultado da API (client-side), igual hoje, mas com a lista correta.

## Arquivos
- `scripts/build-fitments.ts` (novo) — parser dos PDFs
- `src/data/fitments.json` (gerado)
- `src/lib/fitments.ts` (novo) — API de lookup
- `src/components/Hero.tsx` — selects em cascata reais
- `src/components/BatteryGrid.tsx` — banner de compatibilidade + filtros corrigidos
- `src/lib/api/batteries.ts` — aceitar `codes[]`, melhorar detecção
- `supabase/functions/wc-products/index.ts` — suportar busca multi-código
- `src/data/batteries.ts` — atualizar listas `brands` e `amperageOptions`

## Observações
- Heliar: se o OCR falhar no script, sigo só com Moura (cobre ~80% do mercado BR) e te aviso para gerarmos Heliar depois.
- Os PDFs ficam só em build-time — não vão para o bundle do cliente.
- Não precisa de novas tabelas no Cloud — tudo em JSON estático.

