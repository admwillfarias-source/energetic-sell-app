export const WHATSAPP_NUMBER = "5551993199486";

type Args = {
  vehicle?: string | null;
  codes?: string[];
  intro?: string;
};

/**
 * Constrói uma mensagem clara para o atendente, incluindo veículo e códigos
 * pesquisados quando disponíveis.
 */
export function buildWhatsAppMessage({ vehicle, codes, intro }: Args = {}): string {
  const lines: string[] = [intro ?? "Olá! Preciso de uma bateria."];
  if (vehicle && vehicle.trim()) lines.push(`Veículo: ${vehicle.trim()}`);
  if (codes && codes.length) lines.push(`Códigos pesquisados: ${codes.join(", ")}`);
  lines.push("Podem me ajudar a confirmar a opção certa?");
  return lines.join("\n");
}

export function buildWhatsAppUrl(args: Args = {}, number = WHATSAPP_NUMBER): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppMessage(args))}`;
}
