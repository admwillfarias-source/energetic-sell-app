
Vou usar o site da Moura como referência visual e de produto para construir o app de venda de baterias automotivas.

## O que vou construir

Uma loja online de baterias automotivas inspirada no Moura Fácil, com tipografia tech moderna (Space Grotesk + DM Sans) e identidade visual de confiança automotiva (azul profundo + amarelo/âmbar de destaque, similar à marca Moura).

## Estrutura inicial (MVP visual + catálogo)

**1. Header**
- Logo "BateriaJá" (placeholder, fácil de trocar)
- Nav: Início, Baterias, Como funciona, Contato
- Busca rápida + ícone de carrinho

**2. Hero section**
- Título forte: "Bateria nova em casa, em até 2 horas"
- Subtítulo sobre instalação grátis e troca da bateria antiga
- Busca por veículo (Marca → Modelo → Ano) — campo principal de conversão
- CTA: "Encontrar minha bateria"

**3. Bloco "Como funciona"** (3 passos)
- Escolha sua bateria → Agende a entrega → Instalamos no local

**4. Catálogo de baterias** (grid de cards)
- 8–12 baterias mock (Moura 60Ah, 70Ah, Heliar, etc.)
- Cada card: imagem, nome, amperagem, garantia, preço, botão "Comprar"
- Filtros laterais: amperagem, marca, faixa de preço

**5. Página/seção de detalhe** (modal ou rota)
- Specs completas, garantia, compatibilidade, botão adicionar ao carrinho

**6. Carrinho** (drawer lateral)
- Itens, subtotal, CTA checkout

**7. Seção de benefícios**
- Instalação grátis · Troca da bateria velha · Garantia de fábrica · Pagamento na entrega

**8. Footer**
- Contato, WhatsApp, formas de pagamento, redes sociais

## Decisões de design
- **Cores**: azul-marinho profundo (#0a1f44) + amarelo Moura (#ffd400) como accent + branco/cinza claro
- **Tipografia**: Space Grotesk (títulos) + DM Sans (corpo) — tech moderno
- **Layout**: hero-grid com busca em destaque, cards limpos, muito espaço em branco
- **Tom**: confiança, rapidez, profissional

## Funcionalidades nesta primeira versão
- Catálogo navegável com filtros (estado local)
- Busca por veículo (UI funcional, retorna resultados mock)
- Carrinho persistente (localStorage)
- Tudo client-side, sem backend ainda

## Próximos passos (não nesta entrega)
- Checkout real + pagamento (Stripe/Mercado Pago)
- Backend (Lovable Cloud) para produtos, pedidos e área admin
- Integração WhatsApp
- Cálculo de frete por CEP
- Agendamento de instalação

## Detalhes técnicos
- Atualizar `src/index.css` com tokens HSL (azul/amarelo) e fontes Google
- Atualizar `tailwind.config.ts` com fontFamily customizada
- Componentes em `src/components/`: Header, Hero, VehicleSearch, BatteryCard, BatteryGrid, CartDrawer, HowItWorks, Benefits, Footer
- Dados mock em `src/data/batteries.ts`
- Carrinho via Context + localStorage em `src/context/CartContext.tsx`
- `src/pages/Index.tsx` monta a landing completa
