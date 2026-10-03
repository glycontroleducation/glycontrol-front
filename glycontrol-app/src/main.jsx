/* ============================================================
   main.jsx — Ponto de entrada do GlyControl (projeto Vite/VS Code)
   ------------------------------------------------------------
   Este é o primeiro arquivo executado no navegador. Ele faz 3 coisas,
   nesta ordem exata:
     1) Instala o "storageShim" (simulador do window.storage do
        ambiente Claude Artifacts, usando localStorage do navegador) —
        isso PRECISA acontecer antes do App.jsx rodar, porque o
        App.jsx foi escrito originalmente para o ambiente Artifacts
        e chama window.storage.get/set/delete/list diretamente.
     2) Cria a "raiz" React dentro da <div id="root"> do index.html.
     3) Renderiza o componente principal <GlyControlApp />.
   Nenhuma lógica do app mora aqui — este arquivo é só "encanamento"
   (bootstrap). Toda a lógica e as telas ficam em src/App.jsx.
   ============================================================ */
import React from "react";
import { createRoot } from "react-dom/client";
import { instalarStorageShim } from "./storageShim.js";
import GlyControlApp from "./App.jsx";
import "./index.css";

// Precisa rodar ANTES de renderizar o App, pois o App.jsx usa
// window.storage diretamente (herdado do ambiente Artifacts).
instalarStorageShim();

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GlyControlApp />
  </React.StrictMode>
);
