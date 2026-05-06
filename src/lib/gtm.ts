// Helper para enviar eventos ao Google Tag Manager via dataLayer.
// As tags de conversão (Google Ads, GA4, etc.) são configuradas
// dentro do painel do GTM usando triggers de "Custom Event".

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function pushEvent(event: string, payload: Record<string, unknown> = {}): void {
  try {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  } catch {
    // silencioso — nunca quebrar UX por causa de tracking
  }
}
