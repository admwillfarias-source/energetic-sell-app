
## Objetivo
Substituir os dados mock de baterias por uma busca real no seu site WordPress.com (posts/produtos de bateria).

## Como vai funcionar

1. **Conectar o WordPress.com** via connector da Lovable (OAuth — você autoriza o site).
2. **Ativar o Lovable Cloud** (necessário para rodar a edge function que chama a API do WordPress com segurança — a chave nunca fica exposta no navegador).
3. **Edge function `search-batteries`**: recebe `marca`, `modelo`, `ano` (ou texto livre) e consulta posts do WP via `/rest/v1.1/sites/{site}/posts?search=...`.
4. **Mapear posts → Battery**: extrai do post título, imagem destacada, preço/amperagem/garantia (de campos customizados, tags ou do conteúdo), e devolve no mesmo formato `Battery` que o catálogo já usa.
5. **Frontend**: 
   - Hero "Encontrar minha bateria" passa a chamar a edge function e rola para os resultados.
   - `BatteryGrid` carrega via React Query (loading skeletons + estado vazio).
   - Mantém os filtros locais (marca, amperagem, preço) sobre os resultados.

## Decisões que preciso confirmar

```text
Pergunta 1: Qual a URL do seu site WordPress.com? (ex: meusite.wordpress.com)
Pergunta 2: Onde estão as informações estruturadas (preço, amperagem, garantia)?
  a) Campos customizados (ACF / custom fields)
  b) Tags / categorias do post
  c) Só no texto/título — extraio por parsing
Pergunta 3: Os "modelos de bateria" são posts normais, uma categoria específica,
            ou um custom post type? (se custom, qual o slug?)
```

## Arquivos que vou criar/editar

- `supabase/functions/search-batteries/index.ts` — proxy autenticado para o WordPress via gateway
- `src/lib/api/batteries.ts` — cliente React Query que chama a function
- `src/components/Hero.tsx` — submit dispara a busca real
- `src/components/BatteryGrid.tsx` — consome resultados da API + estados de loading/erro/vazio
- `src/data/batteries.ts` — vira fallback para dev (opcional)

## Próximos passos quando aprovar
1. Pergunto as 3 dúvidas acima
2. Ativo Lovable Cloud
3. Conecto o WordPress.com (você escolhe o site na tela do OAuth)
4. Implemento a function + integração no frontend
