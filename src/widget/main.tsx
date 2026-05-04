// Widget isolado: monta apenas a busca por veículo em qualquer
// elemento [data-awr-busca] da página. Usado pelo shortcode
// [awr_busca_bateria] do tema WordPress.
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VehicleAutocomplete from "@/components/VehicleAutocomplete";
import "@/index.css";

const queryClient = new QueryClient();

function Widget({ siteUrl }: { siteUrl?: string }) {
  // Se o tema definir window.AWR_SITE_URL, redirecionamos as buscas
  // para o domínio do app principal. Caso contrário, navega na própria
  // instalação (assumindo que o tema serve o app React inteiro).
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <VehicleAutocomplete
          variant="card"
          onSelect={() => {
            if (siteUrl) {
              // BrowserRouter já navegou; se siteUrl externo, repare:
              const path = window.location.pathname + window.location.search;
              window.location.href = siteUrl.replace(/\/$/, "") + path;
            }
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const mountAll = () => {
  const targets = document.querySelectorAll<HTMLElement>("[data-awr-busca]");
  targets.forEach((el) => {
    if (el.dataset.awrMounted === "1") return;
    el.dataset.awrMounted = "1";
    const siteUrl =
      el.dataset.siteUrl ||
      (window as unknown as { AWR_SITE_URL?: string }).AWR_SITE_URL ||
      undefined;
    createRoot(el).render(<Widget siteUrl={siteUrl} />);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAll);
} else {
  mountAll();
}
