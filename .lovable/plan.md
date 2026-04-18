
O usuário quer que eu busque dados oficiais nos sites Heliar e Moura Fácil para corrigir/expandir as aplicações (fitments) do catálogo de busca por veículo.

## Objetivo
Comparar e corrigir os dados de aplicações (marca/modelo/ano → código de bateria) usando como fonte oficial os buscadores da Heliar e Moura Fácil, atualizando a tabela `fitments` no banco.

## Estratégia

### 1. Coleta de dados (via Firecrawl)
Os sites Heliar e Moura Fácil são SPAs com busca dinâmica. Para extrair dados em escala preciso do **Firecrawl** (connector já documentado no projeto). Vou:
- Fazer scrape estruturado das páginas de busca por veículo de ambos os sites
- Extrair: marca, modelo, intervalo de anos, código de bateria recomendado
- Como Moura é a marca-mãe (e nosso `fitments` é indexado por código Moura), o Moura Fácil será a fonte primária; Heliar entra como referência cruzada de equivalência

### 2. Processamento
- Script Python em `/tmp` que normaliza os dados coletados (marca/modelo em maiúsculas consistentes, anos como inteiros)
- Comparar com `fitments` atual (carregar via SQL) e gerar 3 listas:
  - **Novos**: aplicações que não existem no banco
  - **Correções**: códigos diferentes para mesmo carro/ano
  - **Conflitos**: casos ambíguos para revisão manual

### 3. Aplicação no banco
- Migration SQL com INSERTs dos novos e UPDATEs das correções
- Cache invalidado automaticamente (já implementado em `catalogStore.ts`)

### 4. Code change mínimo
Nenhum, salvo se descobrir gaps na lógica de busca durante o cruzamento.

## Pré-requisito
**Preciso conectar o Firecrawl** (connector_id: `firecrawl`) — é a forma confiável de raspar SPAs como o Moura Fácil. Sem ele, o `fetch_website` retorna apenas a casca HTML sem os dados de busca.

## Escopo proposto
Para não levar horas raspando milhares de combinações, sugiro **focar nos top 30-40 modelos mais vendidos no Brasil** (Onix, HB20, Gol, Strada, Polo, Compass, Corolla, Civic, Renegade, Tracker, Kwid, Mobi, Argo, Cronos, T-Cross, Nivus, Saveiro, Toro, S10, Hilux, Ranger, Frontier, Amarok, Fiesta, Ka, EcoSport, Kicks, Versa, City, Fit, HR-V, CR-V, Tiguan, Jetta, Virtus, etc). Se quiser cobertura total depois, expandimos.

## Arquivos
- Migration SQL (gerada pelo script após coleta)
- Possivelmente `src/lib/fitments.ts` se aparecer um caso que a busca atual não cobre

## Próximo passo
Aprove o plano para que eu:
1. Conecte o Firecrawl
2. Faça o scrape do Moura Fácil + Heliar para a lista top 40
3. Apresente um diff (novos/correções/conflitos) antes de aplicar no banco
