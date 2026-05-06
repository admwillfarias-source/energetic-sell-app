// Tracking via Google Tag Manager (dataLayer). As tags efetivas
// (Google Ads conversion, GA4 events, etc.) são configuradas no painel do GTM.

import { pushEvent } from "@/lib/gtm";

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
  pushEvent(args.action, {
    event_category: args.category,
    event_label: args.label,
    value: args.value,
  });
}

export function trackLead(label: string) {
  pushEvent("lead_whatsapp", { event_label: label });
}

export function trackCall(page: string, placement: string) {
  pushEvent("lead_call", { page, placement });
}

export function handleCallClick(event: CallClickEvent, page: string, placement: string) {
  trackCall(page, placement);

  const href = event.currentTarget.getAttribute("href")?.trim();
  if (!href?.startsWith("tel:")) return;

  // iOS Safari é mais confiável quando o link tel: segue o fluxo nativo do <a>.
  // Não usamos preventDefault nem navegação programática aqui para não cancelar o discador.
}
