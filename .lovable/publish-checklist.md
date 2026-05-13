# Checklist de Publicação — SEO

Rodar antes de cada clique em **Publish → Update**. Marque cada item; só publique com tudo OK.

---

## 1. `index.html` (head sitewide / home)

- [ ] `<title>` presente, único, **≤ 60 caracteres**, contém marca + keyword principal
- [ ] `<meta name="description">` presente, **≤ 160 caracteres**, com CTA/diferencial
- [ ] `<link rel="canonical" href="https://awrbaterias.com.br/" />` apontando para o domínio de produção
- [ ] `<html lang="pt-BR">`
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
- [ ] **Não** existe `<meta name="robots" content="noindex">` no head global

### Open Graph
- [ ] `og:type` = `website`
- [ ] `og:url` = canonical
- [ ] `og:site_name` = `AWR Baterias`
- [ ] `og:locale` = `pt_BR`
- [ ] `og:title` igual (ou equivalente curto) ao `<title>`
- [ ] `og:description` igual (ou equivalente curto) à meta description
- [ ] `og:image` aponta para imagem **pública, ≥ 1200×630, < 5 MB**, URL absoluta HTTPS

### Twitter
- [ ] `twitter:card` = `summary_large_image`
- [ ] `twitter:site` = `@awrbaterias`
- [ ] `twitter:title`, `twitter:description`, `twitter:image` presentes e coerentes com OG

---

## 2. Páginas dinâmicas (City, Neighborhood, Brand, Amperage, BatterySku, BlogPost, VehicleSeo, NotFound)

Para cada template, abrir 2 amostras e conferir:

- [ ] `<title>` único por rota, **≤ 60 chars**, com cidade/bairro/marca/modelo no início
- [ ] `description` única, **≤ 160 chars**, sem repetir literal o título
- [ ] `canonical` aponta para a **própria URL absoluta** em `https://awrbaterias.com.br/...` (sem query strings)
- [ ] Apenas **um** `<link rel="canonical">` no DOM final (Helmet não duplica o do `index.html`)
- [ ] `og:url` = canonical da rota
- [ ] `og:title` / `og:description` / `og:image` sobrescrevem os do `index.html`
- [ ] `NotFound` carrega `noindex,follow`

### Como verificar rapidamente no preview
```bash
# Em DevTools → Console:
document.title.length
document.querySelector('meta[name=description]').content.length
document.querySelectorAll('link[rel=canonical]').length   // deve ser 1
document.querySelector('link[rel=canonical]').href
document.querySelector('meta[property="og:url"]').content
```

---

## 3. Estruturados / arquivos auxiliares

- [ ] `public/robots.txt` permite `/`, referencia `Sitemap: https://awrbaterias.com.br/sitemap.xml`
- [ ] `public/sitemap.xml` lista todas as rotas indexáveis com URLs absolutas no domínio de produção
- [ ] `public/llms.txt` atualizado com páginas-chave
- [ ] JSON-LD `LocalBusiness` válido (testar em https://search.google.com/test/rich-results)

---

## 4. Validação externa (após publicar)

- [ ] https://www.opengraph.xyz/url/https%3A%2F%2Fawrbaterias.com.br%2F — preview OG correto
- [ ] https://cards-dev.twitter.com/validator (ou compartilhar em DM) — card renderiza
- [ ] Google Rich Results Test — JSON-LD passa
- [ ] PageSpeed/Lighthouse SEO ≥ 95
- [ ] `seo_chat list_findings` sem itens `failing`

---

## 5. Antes de clicar em Update

- [ ] Build local sem erros TS
- [ ] Smoke test no preview: home, 1 cidade, 1 bairro, 1 marca, 1 SKU, 404
- [ ] Mudanças de SEO commitadas (não há edits pendentes só no preview)
