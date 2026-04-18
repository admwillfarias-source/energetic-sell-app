# Como atualizar o catálogo de baterias

Tudo está em **2 arquivos JSON** dentro de `src/data/`. Não precisa mexer em código.

---

## 1. Adicionar / corrigir aplicações por carro

Arquivo: **`src/data/fitments.json`**

Cada item liga `marca + modelo + intervalo de anos` a **um código Moura**.

```json
{
  "brand": "Chevrolet",
  "model": "Onix",
  "yearStart": 2013,
  "yearEnd": 2018,
  "code": "M50ED"
}
```

### Adicionar um carro novo
Inclua um bloco novo no array. Exemplo:
```json
{ "brand": "Fiat", "model": "Cronos", "yearStart": 2018, "yearEnd": 2024, "code": "M60AD" }
```

### Corrigir um carro com modelo errado
Procure pela linha (ex: `"model": "Onix"`), ajuste `code`, `yearStart` ou `yearEnd`.

### Um carro que aceita mais de uma bateria
Crie **um bloco para cada código**:
```json
{ "brand": "Fiat", "model": "Toro", "yearStart": 2016, "yearEnd": 2024, "code": "M60AD" },
{ "brand": "Fiat", "model": "Toro", "yearStart": 2016, "yearEnd": 2024, "code": "M70KD" }
```

---

## 2. Cadastrar equivalências entre marcas

Arquivo: **`src/data/equivalents.json`**

Cada bloco diz: "esses códigos das 4 marcas são equivalentes entre si".

```json
{
  "moura":  ["M50ED", "M50EX"],
  "heliar": ["H50GD"],
  "zetta":  ["50ED"],
  "excell": []
}
```

- `moura` — todos os códigos Moura equivalentes (ex: M50ED e M50EX são o mesmo modelo).
- `heliar`, `zetta`, `excell` — equivalentes nas outras marcas.
- Se uma marca **não tem** equivalente, deixe lista vazia: `"excell": []`.

### Adicionar nova equivalência
Inclua um bloco novo:
```json
{
  "moura":  ["M60AD"],
  "heliar": ["H60GD"],
  "zetta":  ["60AD"],
  "excell": ["E60AD"]
}
```

### Como o sistema usa isso
1. Cliente seleciona Chevrolet Onix 2016 → sistema acha `M50EX` no `fitments.json`.
2. `equivalents.json` diz que M50EX = M50ED = H50GD = 50ED.
3. O catálogo busca esses códigos no WooCommerce e mostra **1 bateria de cada marca** (até 4), do mais caro ao mais barato.

### Fallback automático
Se um código Moura **não estiver** no `equivalents.json`, o sistema busca por amperagem genérica (ex: "Heliar 60Ah"). Funciona, mas é menos preciso. Por isso, vale cadastrar as equivalências mais vendidas.

---

## Como pedir alterações

Você pode falar comigo no chat:
- *"Adicione Fiat Cronos 2018-2024 com M60AD"*
- *"Corrija o Onix: o ano certo vai até 2019, não 2018"*
- *"M70KD equivale a H70JD na Heliar e 70KD na Zetta"*

Eu edito os JSONs direto.
