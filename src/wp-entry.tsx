// Entry específica do build WordPress.
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const mount = () => {
  const el = document.getElementById("root");
  if (!el) {
    console.warn("[awr-baterias] #root não encontrado");
    return;
  }
  createRoot(el).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>,
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
