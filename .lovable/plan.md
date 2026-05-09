## Objetivo

Adicionar uma verificação automática (CI) que bloqueie deploys quando houver código órfão ou páginas de teste no projeto, e orientar sobre as ações de limpeza de cache/build que precisam ser feitas fora do código (no navegador e na plataforma Lovable).

---

## Parte 1 — Verificação em CI (mudanças no código)

Vou adicionar uma checagem usando **knip** (ferramenta padrão para detectar arquivos, exports e dependências não usadas em projetos TS/Vite) mais um script guard simples para páginas de teste.

### 1.1 Instalar knip
- Adicionar `knip` como devDependency.

### 1.2 Configuração `knip.json` na raiz
- Entry points: `src/main.tsx`, `index.html`, `supabase/functions/**/index.ts`.
- Project: `src/**/*.{ts,tsx}`, `supabase/functions/**/*.ts`.
- Ignorar: `src/components/ui/**` (shadcn — mantidos sob demanda), `src/integrations/supabase/**` (auto-gerado), `tailwind.config.ts`, `vite.config.ts`.
- Reportar: `files`, `dependencies`, `unlisted`, `exports` não usados.

### 1.3 Script guard para páginas de teste
- Criar `scripts/check-no-test-pages.mjs` que falha se encontrar:
  - Arquivos em `src/pages/` cujo nome contenha `Test`, `Diagnose`, `Debug`, `Sandbox`, `Validation`.
  - Rotas em `src/App.tsx` cujo path contenha `/test`, `/diagnostico`, `/debug`, `/sandbox`.
- Mensagem de erro clara apontando o arquivo/linha.

### 1.4 Scripts no `package.json`
```json
"lint:orphans": "knip",
"lint:test-pages": "node scripts/check-no-test-pages.mjs",
"predeploy": "npm run lint:orphans && npm run lint:test-pages"
```

### 1.5 GitHub Actions workflow `.github/workflows/ci.yml`
- Trigger: `pull_request` e `push` na branch principal.
- Steps: checkout → setup-node → `npm ci` → `npm run lint:orphans` → `npm run lint:test-pages` → `npm run build`.
- Se qualquer passo falhar, o PR é bloqueado antes do deploy.

> Observação: como o projeto roda no Lovable, o workflow GitHub Actions só roda se você tiver o repositório conectado ao GitHub. Se preferir, posso deixar apenas os scripts npm e você roda localmente antes de publicar.

---

## Parte 2 — Limpeza de cache do navegador (ação do usuário, sem código)

Não é possível fazer isso pelo código do app — precisa ser feito por você no navegador:

1. Abra o site em uma **aba anônima** para confirmar que o problema é só cache local.
2. No Chrome/Edge: `DevTools (F12) → Application → Storage → Clear site data` (marca tudo: localStorage, sessionStorage, cookies, cache).
3. Ou: `Ctrl+Shift+Del` → "Imagens e arquivos em cache" + "Cookies".
4. Recarregue com `Ctrl+Shift+R` (hard reload).

> Se quiser, posso adicionar no app um pequeno mecanismo de "version bump" que invalida o `localStorage` automaticamente quando a versão muda. Diga se quer essa proteção.

---

## Parte 3 — Apagar build antigo e forçar redeploy (ação na plataforma)

No Lovable, builds e deploys são gerenciados pela plataforma — não há pasta `dist/` versionada para apagar manualmente. Para forçar um build/deploy completo:

1. Clique em **Publish** (canto superior direito) → **Update**.
2. Isso recompila tudo do zero e publica os assets novos com hashes novos no `https://energetic-sell-app.lovable.app`.
3. Mudanças de backend (edge functions, migrações) já são deployadas automaticamente; só o frontend precisa do "Update".

> Não preciso mexer no código para isso — é um clique seu.

---

## Parte 4 — Limpar cache do Vite e reinstalar dependências

Também é uma ação de ambiente, não de código. No Lovable a sandbox é gerenciada, mas se você roda localmente:

```bash
rm -rf node_modules/.vite dist node_modules package-lock.json
npm install
npm run dev
```

No próprio Lovable, se o preview estiver com chunks travados, eu posso reiniciar o dev server (uso a ferramenta `restart_dev_server` no modo build). Diga se quer que eu faça isso depois de aprovar o plano.

---

## Resumo do que entra no código

| Arquivo | Ação |
|---|---|
| `package.json` | adicionar `knip` (devDep) + 3 scripts |
| `knip.json` | novo — config de detecção de órfãos |
| `scripts/check-no-test-pages.mjs` | novo — guard de páginas de teste |
| `.github/workflows/ci.yml` | novo (opcional — confirme se quer) |

## Pontos para confirmar antes de implementar

1. **Workflow GitHub Actions**: criar ou não? (depende se o projeto está conectado ao GitHub)
2. **Version bump no localStorage**: quer que eu adicione um auto-clear quando a versão do app mudar?
3. **Reiniciar o dev server do preview** agora após implementar?
