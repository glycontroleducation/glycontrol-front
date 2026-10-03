/**
 * storageShim.js
 * ------------------------------------------------------------------
 * O GlyControl foi originalmente construído como um Artifact do
 * Claude, que oferece uma API pronta em `window.storage` (get/set/
 * delete/list) para guardar dados do usuário.
 *
 * Fora do ambiente do Claude (rodando localmente pelo VS Code, por
 * exemplo), essa API não existe. Este arquivo recria exatamente a
 * mesma API, mas salvando os dados no localStorage do navegador —
 * assim o App.jsx inteiro funciona sem precisar de nenhuma alteração.
 *
 * IMPORTANTE: localStorage é por navegador/computador. Ele NÃO
 * sincroniza entre o celular e o computador, e pode ser apagado se
 * o usuário limpar os dados do site. Para dados "de verdade" que
 * sobrevivem entre dispositivos, no futuro isso pode ser trocado
 * por chamadas a um banco de dados real (ver pasta /database).
 * ------------------------------------------------------------------
 */

// Prefixo colocado em toda chave gravada no localStorage, para não
// conflitar com outros dados que o navegador possa guardar no mesmo
// domínio (ex.: de outra extensão ou site).
const PREFIXO = "glycontrol:";

// Monta a chave final salva no localStorage, separando dados
// "privados" (por usuário) de dados "compartilhados" (ex.: comunidade).
function chaveCompleta(key, shared) {
  return `${PREFIXO}${shared ? "shared" : "priv"}:${key}`;
}

// Chamada uma única vez, em main.jsx, antes de renderizar o App.
// Cria window.storage com a mesma "assinatura" (get/set/delete/list)
// que o App.jsx espera encontrar no ambiente Claude Artifacts.
export function instalarStorageShim() {
  if (typeof window === "undefined") return;

  window.storage = {
    // Lê um valor salvo. Lança erro se a chave não existir — o
    // App.jsx trata esse erro com try/catch (ex.: usuário novo sem
    // dados salvos ainda).
    async get(key, shared = false) {
      const k = chaveCompleta(key, shared);
      const raw = localStorage.getItem(k);
      if (raw === null) {
        throw new Error(`Chave "${key}" não encontrada no armazenamento local.`);
      }
      return { key, value: JSON.parse(raw), shared };
    },

    // Salva/atualiza um valor (o App.jsx sempre passa objetos/arrays
    // já prontos para virar JSON — nunca dados sensíveis "crus").
    async set(key, value, shared = false) {
      const k = chaveCompleta(key, shared);
      localStorage.setItem(k, JSON.stringify(value));
      return { key, value, shared };
    },

    // Apaga um valor salvo (ex.: ao excluir a conta do usuário).
    async delete(key, shared = false) {
      const k = chaveCompleta(key, shared);
      localStorage.removeItem(k);
      return { key, deleted: true, shared };
    },

    // Lista todas as chaves que começam com um determinado prefixo
    // (usado, por exemplo, para varrer todos os usuários cadastrados).
    async list(prefix = "", shared = false) {
      const marcador = chaveCompleta(prefix, shared);
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const full = localStorage.key(i);
        if (full && full.startsWith(marcador)) {
          keys.push(full.slice(chaveCompleta("", shared).length));
        }
      }
      return { keys, prefix, shared };
    },
  };
}
