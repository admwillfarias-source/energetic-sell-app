## Objetivo
Reduzir o número de sugestões exibidas no autocomplete de busca por veículo no Hero, de 10 para 3, evitando confusão do cliente.

## Mudança
- `src/components/VehicleAutocomplete.tsx` (linha 91): trocar o limite do modo padrão de `10` para `3`. O modo `"list"` (usado em outras telas, como mais buscados) continua com 30.

```ts
return searchVehicles(query, suggestionsMode === "list" ? 30 : 3);
```

Sem alterações em estilos, lógica de busca ou outras seções.
