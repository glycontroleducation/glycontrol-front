# Banco de dados do GlyControl

## Situação atual (protótipo)

Hoje o GlyControl é um **protótipo front-end**: o banco de alimentos
(quase 600 itens da tabela TACO, com calorias, carboidratos, proteínas,
gorduras, fibras e sódio) está **embutido dentro do próprio código**,
em `src/App.jsx` (constante `FOOD_DB`). Não é preciso instalar nenhum
banco de dados para o app funcionar — ele já vem pronto.

Os dados que o USUÁRIO gera (cadastro, glicemia, refeições, água) são
salvos no navegador de cada pessoa (veja `src/storageShim.js`), não em
um servidor central. Ou seja, cada celular/computador guarda os seus
próprios registros.

## Script SQL (`glycontrol_taco_seed_supabase.sql`)

Este arquivo é o banco de dados **relacional completo**, pensado para
quando o projeto migrar para uma versão com servidor de verdade
(ex.: Supabase/PostgreSQL). Ele cria as tabelas oficiais:

- `foods` — alimentos (nome, categoria, food_id);
- tabelas de nutrientes por alimento;
- tabelas de porções/medidas caseiras por alimento.

**Esse script ainda não está conectado ao app.** Ele é a base pronta
para quando alguém for construir o backend (usuários com login real,
dados sincronizados entre dispositivos, etc.), como já estava previsto
no documento original do projeto:

> "Posteriormente, o projeto poderá ser migrado para uma estrutura
> completa com servidor e banco de dados real."

### Como usar este script no futuro

1. Criar uma conta gratuita em [supabase.com](https://supabase.com) (ou
   qualquer PostgreSQL).
2. Abrir o "SQL Editor" do projeto criado.
3. Colar o conteúdo de `glycontrol_taco_seed_supabase.sql` e executar.
4. Isso cria as tabelas e já popula com os alimentos da TACO.
5. A partir daí, o front-end (`src/App.jsx`) precisaria ser adaptado
   para buscar os dados desse banco em vez do `FOOD_DB` embutido, e o
   `storageShim.js` seria substituído por chamadas reais de API.

Isso é um passo grande (envolve autenticação, backend, hospedagem) —
não é necessário para usar o GlyControl como está hoje.
