# GlyControl

Aplicativo web para pessoas idosas com Diabetes Mellitus tipo 2
acompanharem glicemia, alimentação e hidratação.

## Como abrir e rodar no VS Code

Você precisa ter o **Node.js** instalado no computador (baixe em
[nodejs.org](https://nodejs.org), versão 18 ou mais recente).

1. Abra a pasta `glycontrol-app` no VS Code (Arquivo → Abrir Pasta...).
2. Abra o terminal integrado do VS Code (Terminal → Novo Terminal).
3. Instale as dependências (só precisa fazer isso uma vez):
   ```
   npm install
   ```
4. Rode o site localmente:
   ```
   npm run dev
   ```
5. O terminal vai mostrar um endereço, geralmente
   `http://localhost:5173` — abra esse link no navegador (ou ele abre
   sozinho). O GlyControl vai aparecer funcionando normalmente:
   cadastro, login, glicemia, alimentação, água, relatórios, tudo.

Para parar o site, volte ao terminal e aperte `Ctrl+C`.

## Estrutura do projeto

```
glycontrol-app/
├── src/
│   ├── App.jsx          <- o aplicativo inteiro (telas, banco de
│   │                        alimentos, motor de recomendações, chat)
│   ├── main.jsx          <- ponto de entrada, monta o React na página
│   ├── storageShim.js    <- salva os dados do usuário no navegador
│   └── index.css
├── server/
│   └── index.js          <- backend mínimo (Node/Express) que fala
│                             com a Groq guardando a chave em segredo
├── database/
│   ├── glycontrol_taco_seed_supabase.sql  <- banco relacional completo
│   └── README.md         <- explica como usar esse banco no futuro
├── .env.example           <- modelo do arquivo de chave (copie para .env)
├── index.html
├── package.json
└── vite.config.js
```

## O que muda em relação ao ambiente do Claude

Este app foi originalmente construído como um Artifact do Claude, que
tem alguns recursos prontos por trás que não existem fora dele. Para
o app funcionar aqui no seu computador, duas coisas foram adaptadas:

### 1. Armazenamento dos dados

O Claude oferece uma função pronta (`window.storage`) para salvar os
dados do usuário. Criei um arquivo (`src/storageShim.js`) que recria
essa mesma função usando o **localStorage do navegador** — então tudo
funciona igual, sem precisar mudar o `App.jsx`. A diferença: os dados
ficam salvos só naquele navegador/computador, não sincronizam com o
celular. Veja `database/README.md` para o caminho de migrar para um
banco de verdade no futuro.

### 2. Chat com IA (Ana)

Dentro do Claude, a Ana conversa usando uma integração de IA que já
vem autorizada automaticamente pelo ambiente — sem precisar de nenhuma
chave de API.

Rodando localmente (fora do Claude), essa autorização automática não
existe, então o projeto já vem com um **backend próprio e mínimo**
(pasta `server/`) que fala com a IA da **Groq** guardando a chave em
segredo no seu computador — ela nunca fica visível no navegador nem no
código enviado a quem usa o app.

**Como ativar a IA de verdade (Groq) rodando localmente:**

1. Gere uma chave em [console.groq.com](https://console.groq.com).
   > Se você já compartilhou uma chave da Groq em alguma conversa,
   > mensagem ou chat, considere-a exposta: gere uma chave **nova** e
   > revogue a antiga antes de continuar.
2. Copie o arquivo `.env.example` para um novo arquivo chamado `.env`
   (mesma pasta) e cole sua chave:
   ```
   GROQ_API_KEY=sua_chave_aqui
   ```
   O `.env` nunca é enviado ao GitHub nem a mais ninguém (já está no
   `.gitignore`).
3. Instale as dependências, se ainda não instalou: `npm install`.
4. Abra **dois terminais**:
   - Um rodando o backend: `npm run server`
   - Outro rodando o site: `npm run dev`
5. Pronto — a Ana agora responde com IA de verdade (Groq).

Se o arquivo `.env` não existir, ou o comando `npm run server` não
estiver rodando, **o app não quebra**: o chat detecta que o backend
não respondeu e cai automaticamente para respostas prontas por regras
(já testadas e cobrindo os casos mais comuns: glicemia, alimentação,
água — e o alerta de segurança para hipoglicemia sempre usa a resposta
determinística por regra, nunca a IA, mesmo com a Groq ativada).

Ordem que o app tenta, sempre com fallback para a próxima:
1. Backend local com Groq (`server/index.js`) — funciona rodando pelo
   VS Code, se configurado como acima.
2. Proxy de IA do Claude Artifacts — só funciona dentro do Claude.ai.
3. Respostas locais por regra — sempre disponível, em qualquer lugar.

**Nunca coloque a chave da Groq diretamente em `src/App.jsx` ou em
qualquer outro arquivo que vá para o navegador.** Esse app é front-end
puro: qualquer texto ali fica visível para quem abrir o código da
página (F12 → "Sources", ou lendo o arquivo). A chave só deve existir
no arquivo `.env`, que só o `server/index.js` (rodando no seu
computador) enxerga.

## Próximos passos possíveis

- Migrar o banco de alimentos e os dados do usuário para um banco de
  verdade (veja `database/README.md`).
- Trocar a autenticação local por uma autenticação real de verdade.
- Publicar o site e o backend (ex.: Vercel, Render, Railway) para
  acessar de qualquer lugar, não só do seu computador — nesse caso, a
  chave da Groq vai numa variável de ambiente da hospedagem, nunca no
  código.
