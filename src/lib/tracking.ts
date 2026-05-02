// Stub de tracking — não envia eventos. Mantém a mesma assinatura usada pelos componentes.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

type CallClickEvent = {
  preventDefault: () => void;
  currentTarget: HTMLAnchorElement;
};

export function trackEvent(args: { action: string; category: string; label: string; value?: number }) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", args.action, {
        event_category: args.category,
        event_label: args.label,
        value: args.value,
      });
    }
  } catch {
    // silencioso
  }
}

export function trackLead(_label: string) {
  // no-op
}

export function trackCall(_page: string, _placement: string) {
  // no-op
}

export function handleCallClick(event: CallClickEvent, page: string, placement: string) {
  trackCall(page, placement);

  const href = event.currentTarget.getAttribute("href")?.trim();
  if (!href?.startsWith("tel:")) return;

  // Safari/iPhone pode ignorar o comportamento nativo em links dentro de componentes React.
  // Forçamos a navegação tel: no mesmo gesto do toque para abrir o discador.
  event.preventDefault();
  window.location.href = href.replace(/\s+/g, "");
}
