# AWR Baterias WC — Tema WordPress (WooCommerce + Elementor)

Tema clássico, leve e compatível com **WooCommerce** e **Elementor / Elementor Pro**.

## Pré-requisitos

- WordPress 6.0+
- PHP 7.4+
- Plugin **WooCommerce** ativo
- Plugin **Elementor** (e opcionalmente **Elementor Pro** para Theme Builder)

## Instalação

1. Em **Aparência → Temas → Adicionar novo → Enviar tema**, envie `awr-baterias-wc.zip`.
2. Ative o tema.
3. Em **WooCommerce → Página inicial**, conclua o onboarding (cria as páginas Loja, Carrinho, Finalizar compra e Minha conta).
4. Em **Aparência → Menus**, crie um menu e atribua à localização **Menu principal**.
5. (Opcional) Em **Aparência → Personalizar → AWR Baterias — Marca**, defina cor primária, telefone e WhatsApp do header.

## Elementor Theme Builder (Pro)

O tema registra todas as core locations (`header`, `footer`, `single`, `archive`, `single-product`, `archive-product`). Basta criar o template no Elementor e definir a Display Condition desejada — o tema usa automaticamente.

## Construir o ZIP

```bash
bash scripts/build-wc-theme.sh
```

Gera `wp-theme/awr-baterias-wc.zip`.
