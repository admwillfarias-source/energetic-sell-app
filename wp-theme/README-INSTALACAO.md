# Tema WordPress — AWR Baterias

Pacote: `awr-baterias.zip` (gerado por `bash scripts/build-wp-theme.sh`).

## O que está incluso

- **Site completo**: home, busca de bateria por veículo, páginas de bairro/cidade/marca/amperagem, blog, página de produto e checkout via WhatsApp — todo o app React do projeto rodando dentro do WordPress.
- **Shortcode `[awr_busca_bateria]`**: cole em qualquer página/post do WordPress para exibir a busca por veículo.
  - Opcional: `[awr_busca_bateria site_url="https://awrbaterias.com.br"]` faz o resultado abrir no domínio principal.
- **SEO server-side**: tags `<title>`, `meta description`, Open Graph, Twitter, canonical e JSON-LD `LocalBusiness`/`AutoPartsStore` impressas em PHP **antes** do React montar — Google e crawlers leem direto. Conteúdo das páginas é renderizado pelo React (Helmet) no client.
- **Backend inalterado**: continua usando as Edge Functions Supabase (`wc-products`, `send-whatsapp-order`, `wc-create-order`) e a loja WooCommerce já configurada.

## Instalação

1. Em `WordPress → Aparência → Temas → Adicionar novo → Enviar tema`, suba `awr-baterias.zip` e ative.
2. Em `Configurações → Links permanentes`, escolha **"Nome do post"** e salve (necessário para as rotas funcionarem).
3. Pronto. Acesse o domínio: as rotas `/baterias/porto-alegre/sarandi`, `/baterias/marca/moura`, `/blog`, etc. já respondem.

## Usar a busca em uma página WordPress comum

Crie uma página no WP e cole no editor (bloco "Shortcode"):

```
[awr_busca_bateria]
```

## Atualizar conteúdo SEO (bairros, cidades, marcas, posts)

Os textos vivem em `src/data/*.ts` no projeto Lovable. Para alterar:

1. Edite os arquivos `src/data/{cityContent,neighborhoodContent,brandContent,amperageContent,blogPosts}.ts`.
2. Rode `bash scripts/build-wp-theme.sh`.
3. Reinstale o `.zip` resultante (ou substitua a pasta `/wp-content/themes/awr-baterias/`).

## Requisitos

- WordPress ≥ 6.0
- PHP ≥ 8.0
- Permalinks no formato "Nome do post"

## Limitações conhecidas

- Editar conteúdo de bairros/cidades pelo painel do WP **não funciona** — esses textos são bundled no JS. Use o fluxo acima.
- O bundle React assume os endpoints Supabase já configurados no projeto Lovable. Para apontar para outra instância, recompile o app trocando `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
