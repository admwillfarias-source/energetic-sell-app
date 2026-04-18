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

export function trackEvent(_args: { action: string; category: string; label: string }) {
  // no-op
}

export function trackLead(_label: string) {
  // no-op
}

export function trackCall(_page: string, _placement: string) {
  // no-op
}

export function handleCallClick(_event: CallClickEvent, _page: string, _placement: string) {
  // Permite o comportamento nativo do <a href="tel:...">
}
