// Stub de tracking — não envia eventos. Mantém a mesma assinatura usada pelos componentes.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

type CallClickEvent = {
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

  // iOS Safari é mais confiável quando o link tel: segue o fluxo nativo do <a>.
  // Não usamos preventDefault nem navegação programática aqui para não cancelar o discador.
}
