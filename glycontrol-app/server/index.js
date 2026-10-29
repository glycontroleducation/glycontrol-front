/* ============================================================
   server/index.js — Backend MÍNIMO do GlyControl (Node + Express)
   ------------------------------------------------------------
   Por que este arquivo existe?

   O GlyControl roda inteiro no NAVEGADOR (frontend). Um navegador
   NUNCA pode guardar uma chave de API em segredo: qualquer pessoa
   pode abrir "Ver código-fonte" ou o DevTools e ler qualquer texto
   que esteja no JavaScript enviado a ela. Por isso, desde o início
   deste projeto, recusamos colocar a chave da Groq (ou de qualquer
   outra IA) diretamente dentro do App.jsx.

   A forma correta e segura de "ligar a API de verdade" é ter um
   pequeno servidor, que SÓ RODA NO SEU COMPUTADOR (nunca no
   navegador do usuário final), e que guarda a chave numa variável
   de ambiente (arquivo .env, que nunca é enviado ao navegador nem
   ao GitHub — veja o .gitignore). O navegador conversa só com esse
   servidor (endereço local /api/chat), nunca diretamente com a
   Groq. A chave nunca trafega até o celular/computador de quem usa
   o app — só entre este servidor e a Groq.

   Fluxo completo:
     Navegador (ChatScreen) --> POST /api/chat --> este servidor
     este servidor --> (com a chave, em segredo) --> API da Groq
     Groq responde --> este servidor devolve só o TEXTO da resposta
     --> Navegador mostra a resposta da Ana

   COMO USAR (veja também o README.md do projeto):
     1) Crie um arquivo chamado ".env" nesta mesma pasta do projeto
        (raiz, ao lado do package.json) com o conteúdo:
            GROQ_API_KEY=sua_chave_aqui
        (nunca compartilhe esse arquivo nem o suba para o GitHub —
        ele já está no .gitignore por segurança.)
     2) Rode "npm install" (uma vez) e depois "npm run server".
     3) Em outro terminal, rode "npm run dev" para abrir o app.
     4) Pronto: a Ana passa a responder com IA de verdade. Se o
        servidor não estiver rodando (ou a chave não estiver
        configurada), o app AUTOMATICAMENTE cai para as respostas
        locais por regra — o chat nunca fica quebrado.

   IMPORTANTE — segurança da chave:
     A chave Groq compartilhada nas conversas anteriores deste
     projeto já apareceu em texto (em mensagens de chat), então ela
     deve ser considerada exposta. Antes de usar este servidor,
     gere uma chave NOVA em https://console.groq.com e revogue a
     antiga. Nunca cole a chave em nenhum arquivo além do seu ".env"
     local.
   ============================================================ */

import express from "express";
import cors from "cors";
import "dotenv/config"; // lê o arquivo .env e disponibiliza em process.env
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8787;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Modelo padrão da Groq usado para o chat da Ana. Pode ser trocado
// pela variável de ambiente GROQ_MODEL sem precisar editar código.
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/* Rota única que o frontend chama: recebe o "system prompt" (regras
   da Ana + contexto calculado do usuário) e o histórico de
   mensagens, e repassa para a Groq no formato dela (compatível com
   a API da OpenAI: "chat completions"). */
app.post("/api/chat", async (req, res) => {
  if (!GROQ_API_KEY) {
    // Sem chave configurada: avisa o frontend com um erro claro,
    // em vez de travar — o App.jsx já sabe cair para o modo local
    // por regra quando esta rota falha.
    return res.status(503).json({
      error: "GROQ_API_KEY não configurada no servidor. Crie um arquivo .env com GROQ_API_KEY=sua_chave.",
    });
  }

  const { system, messages } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Campo 'messages' é obrigatório e deve ser uma lista." });
  }

  try {
    const resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // A chave só existe aqui, no servidor — nunca é enviada ao navegador.
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...messages,
        ],
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => "");
      console.error("Erro da Groq:", resposta.status, detalhe);
      return res.status(502).json({ error: "Falha ao consultar a IA (Groq)." });
    }

    const dados = await resposta.json();
    const texto = dados?.choices?.[0]?.message?.content?.trim();
    if (!texto) return res.status(502).json({ error: "Resposta vazia da IA." });

    res.json({ texto });
  } catch (e) {
    console.error("Erro ao chamar a Groq:", e);
    res.status(500).json({ error: "Erro interno ao consultar a IA." });
  }
});

// Rota simples de verificação — abrir http://localhost:8787/api/health
// no navegador mostra se o servidor está de pé e se a chave foi
// encontrada (sem nunca revelar o valor da chave).
// Rota inicial do backend — evita "Cannot GET /" quando alguém
// abre o endereço do servidor diretamente no navegador.
app.get("/", (req, res) => {
  res.json({
    ok: true,
    nome: "GlyControl — backend",
    mensagem: "Servidor ativo. Abra o aplicativo no frontend (Vite) em http://localhost:5173.",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, chaveConfigurada: Boolean(GROQ_API_KEY), modelo: GROQ_MODEL });
});

/* ============================================================
   ARMAZENAMENTO CENTRAL (cross-device)
   ------------------------------------------------------------
   O GlyControl nasceu como app 100% front-end, salvando tudo no
   localStorage do navegador (um aparelho por vez). Para que uma
   pessoa consiga entrar na própria conta a partir do celular E de
   outros aparelhos com o mesmo e-mail e senha, os dados precisam
   morar em um servidor central.

   Aqui implementamos um armazenamento chave-valor mínimo, persistido
   em um arquivo JSON no servidor. Ele é compartilhado entre todos
   os aparelhos que apontam para este backend, e separa dados
   "privados" (conta, histórico de glicemia, refeições, água, chat
   com a Ana) de dados "compartilhados" (comunidade).

   Observação: este é um protótipo de servidor. Em produção real,
   substituir por um banco de dados de verdade (PostgreSQL/Supabase)
   com autenticação real e controle de acesso por usuário.
   ============================================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

async function lerDB() {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("db inválido");
    if (!parsed.priv || typeof parsed.priv !== "object") parsed.priv = {};
    if (!parsed.shared || typeof parsed.shared !== "object") parsed.shared = {};
    return parsed;
  } catch (e) {
    return { priv: {}, shared: {} };
  }
}

async function salvarDB(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db), "utf8");
}

function bucketDoDB(db, shared) {
  return shared ? db.shared : db.priv;
}

// Lê um valor salvo.
app.get("/api/storage", async (req, res) => {
  const shared = req.query.shared === "true" || req.query.shared === "1";
  const key = String(req.query.key || "");
  if (!key) return res.status(400).json({ error: "Campo 'key' é obrigatório." });
  const db = await lerDB();
  const bucket = bucketDoDB(db, shared);
  // Chave inexistente não é erro: devolve null para o app tratar
  // como "sem dados ainda" (evita 404 assustadores no console).
  const value = Object.prototype.hasOwnProperty.call(bucket, key) ? bucket[key] : null;
  res.json({ key, value, shared });
});

// Salva/atualiza um valor.
app.put("/api/storage", async (req, res) => {
  const { shared, key, value } = req.body || {};
  const isShared = shared === true || shared === "true" || shared === 1;
  if (!key) return res.status(400).json({ error: "Campo 'key' é obrigatório." });
  const db = await lerDB();
  const bucket = bucketDoDB(db, isShared);
  bucket[key] = value;
  await salvarDB(db);
  res.json({ key, value, shared: isShared });
});

// Apaga um valor.
app.delete("/api/storage", async (req, res) => {
  const shared = req.query.shared === "true" || req.query.shared === "1" ||
    (req.body && (req.body.shared === true || req.body.shared === "true"));
  const key = String((req.body && req.body.key) || req.query.key || "");
  if (!key) return res.status(400).json({ error: "Campo 'key' é obrigatório." });
  const db = await lerDB();
  const bucket = bucketDoDB(db, shared);
  delete bucket[key];
  await salvarDB(db);
  res.json({ key, deleted: true, shared });
});

// Lista chaves com um prefixo.
app.get("/api/storage/list", async (req, res) => {
  const shared = req.query.shared === "true" || req.query.shared === "1";
  const prefix = String(req.query.prefix || "");
  const db = await lerDB();
  const bucket = bucketDoDB(db, shared);
  const marcador = prefix;
  const keys = Object.keys(bucket).filter(k => k.startsWith(marcador));
  res.json({ keys, prefix, shared });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor do GlyControl rodando em http://localhost:${PORT}`);
  console.log(GROQ_API_KEY ? "Chave da Groq encontrada." : "AVISO: GROQ_API_KEY não configurada (.env ausente ou vazio).");
  console.log(`Armazenamento central ativo em ${DB_FILE}`);
});
