// Entry específica do build WordPress.
// Idêntica ao src/main.tsx do Vite normal — apenas isolada para permitir
// configuração de build distinta (base path, nomes de arquivo, etc).
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const mount = () => {
  const el = document.getElementById("root");
  if (!el) {
    console.warn("[awr-baterias] #root não encontrado");
    return;
  }
  createRoot(el).render(<App />);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
