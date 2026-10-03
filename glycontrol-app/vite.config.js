// vite.config.js — configuração da ferramenta que compila e serve o
// GlyControl durante o desenvolvimento (comando `npm run dev`) e que
// gera os arquivos finais otimizados para publicar (`npm run build`).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Plugin oficial que ensina o Vite a entender arquivos .jsx (React).
  plugins: [react()],
  server: {
    port: 5173, // Endereço local: http://localhost:5173
    open: true, // Abre o navegador automaticamente ao rodar `npm run dev`.
    proxy: {
      // Qualquer chamada do frontend para "/api/..." é redirecionada
      // para o servidor local (server/index.js, rodado com
      // `npm run server`), que é quem realmente fala com a Groq
      // guardando a chave em segredo. Assim o navegador nunca chama
      // a Groq diretamente e nunca vê a chave.
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
