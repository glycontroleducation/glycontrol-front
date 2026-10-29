/**
 * storageShim.js
 * ------------------------------------------------------------------
 * O GlyControl foi originalmente construído como um Artifact do
 * Claude, que oferece uma API pronta em `window.storage` (get/set/
 * delete/list) para guardar dados do usuário.
 *
 * Fora do ambiente do Claude (rodando localmente pelo VS Code, por
 * exemplo), essa API não existe. Este arquivo recria exatamente a
 * mesma API, mas guardando os dados em dois lugares, em ordem:
 *
 *   1. Servidor central (backend) — permite que a mesma conta seja
 *      acessada do celular e de outros aparelhos com o mesmo e-mail
 *      e senha. É o que torna o login verdadeiramente portátil.
 *   2. localStorage do navegador — usado como reserva (fallback)
 *      quando o servidor não estiver disponível, para o app nunca
 *      parar de funcionar offline.
 *
 * IMPORTANTE: dados privados (conta, glicemia, refeições, água,
 * chat com a Ana) são gravados com shared=false e ficam isolados
 * por chave/usuário. Dados compartilhados (comunidade) usam
 * shared=true. O histórico de uma pessoa nunca se mistura com o de
 * outra porque cada registro é chaveado pelo e-mail do usuário.
 * ------------------------------------------------------------------
 */

// Endereço do backend. Por padrão usa o mesmo origin (proxy do Vite
// em desenvolvimento, ou o próprio servidor em produção). Pode ser
// sobrescrito por VITE_API_BASE no .env para apontar para outro
// servidor (ex.: IP do computador na rede Wi-Fi, para testar no
// celular).
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE)
  ? String(import.meta.env.VITE_API_BASE).replace(/\/$/, "")
  : "";

const PREFIXO = "glycontrol:";

function chaveCompleta(key, shared) {
  return `${PREFIXO}${shared ? "shared" : "priv"}:${key}`;
}

async function apiFetch(caminho, opcoes = {}) {
  const url = `${API_BASE}${caminho}`;
  const res = await fetch(url, opcoes);
  return res;
}

// Tenta o backend primeiro; em caso de falha de rede (ou servidor
// fora do ar), cai para o localStorage. Erros 404 do backend são
// repassados (chave realmente não existe), sem mascarar com cache
// local antigo.
async function backendGet(key, shared) {
  const res = await apiFetch(`/api/storage?shared=${shared}&key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(`Falha no backend (${res.status}).`);
  const data = await res.json();
  return { key, value: data.value, shared };
}

async function backendSet(key, value, shared) {
  const res = await apiFetch("/api/storage", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shared, key, value }),
  });
  if (!res.ok) throw new Error(`Falha no backend (${res.status}).`);
  return { key, value, shared };
}

async function backendDelete(key, shared) {
  const res = await apiFetch(`/api/storage?shared=${shared}&key=${encodeURIComponent(key)}`, { method: "DELETE" });
  // fallback para body caso o servidor prefira
  if (res.status === 405 || res.status === 404) {
    const res2 = await apiFetch("/api/storage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shared, key }),
    });
    if (!res2.ok && res2.status !== 404) throw new Error(`Falha no backend (${res2.status}).`);
    return { key, deleted: true, shared };
  }
  if (!res.ok && res.status !== 404) throw new Error(`Falha no backend (${res.status}).`);
  return { key, deleted: true, shared };
}

async function backendList(prefix, shared) {
  const res = await apiFetch(`/api/storage/list?shared=${shared}&prefix=${encodeURIComponent(prefix)}`);
  if (!res.ok) throw new Error(`Falha no backend (${res.status}).`);
  const data = await res.json();
  return { keys: data.keys || [], prefix, shared };
}

// ---- localStorage (reserva offline) ----
function localGet(key, shared) {
  const k = chaveCompleta(key, shared);
  const raw = localStorage.getItem(k);
  if (raw === null) throw new Error(`Chave "${key}" não encontrada no armazenamento local.`);
  return { key, value: JSON.parse(raw), shared };
}
function localSet(key, value, shared) {
  const k = chaveCompleta(key, shared);
  localStorage.setItem(k, JSON.stringify(value));
  return { key, value, shared };
}
function localDelete(key, shared) {
  const k = chaveCompleta(key, shared);
  localStorage.removeItem(k);
  return { key, deleted: true, shared };
}
function localList(prefix, shared) {
  const marcador = chaveCompleta(prefix, shared);
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const full = localStorage.key(i);
    if (full && full.startsWith(marcador)) {
      keys.push(full.slice(chaveCompleta("", shared).length));
    }
  }
  return { keys, prefix, shared };
}

function isNetworkError(e) {
  return !e || e.status === undefined; // fetch lança TypeError sem status
}

export function instalarStorageShim() {
  if (typeof window === "undefined") return;

  window.storage = {
    async get(key, shared = false) {
      const s = !!shared;
      try {
        const r = await backendGet(key, s);
        // mantém uma cópia local para uso offline
        try { localSet(key, r.value, s); } catch (e) {}
        return r;
      } catch (e) {
        if (e && e.status === 404) throw e;
        if (isNetworkError(e)) {
          return localGet(key, s);
        }
        throw e;
      }
    },
    async set(key, value, shared = false) {
      const s = !!shared;
      try {
        const r = await backendSet(key, value, s);
        try { localSet(key, value, s); } catch (e) {}
        return r;
      } catch (e) {
        if (isNetworkError(e)) {
          return localSet(key, value, s);
        }
        throw e;
      }
    },
    async delete(key, shared = false) {
      const s = !!shared;
      try {
        const r = await backendDelete(key, s);
        try { localDelete(key, s); } catch (e) {}
        return r;
      } catch (e) {
        if (isNetworkError(e)) {
          return localDelete(key, s);
        }
        throw e;
      }
    },
    async list(prefix = "", shared = false) {
      const s = !!shared;
      try {
        const r = await backendList(prefix, s);
        return r;
      } catch (e) {
        if (isNetworkError(e)) {
          return localList(prefix, s);
        }
        throw e;
      }
    },
  };
}