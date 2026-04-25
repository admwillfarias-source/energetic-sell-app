// Helpers para gerar srcset/sizes apenas em URLs reconhecidas.
// Provedores desconhecidos são deixados sem srcset para evitar 404 em massa.

const WP_HOST_PATTERN = /(wp-content\/uploads|\/wp\/|woocommerce|awrbaterias|mooura|moura)/i;

/**
 * Detecta se a URL aparenta ser servida pelo WordPress/WooCommerce,
 * que costuma gerar variantes -WIDTHxHEIGHT.ext automaticamente.
 *
 * Estratégia conservadora: só assume suporte se a URL contém um sufixo
 * de tamanho típico (ex.: foto-600x600.jpg) OU está em um host conhecido.
 */
export function supportsWordpressSrcset(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  // Só ativa se já vier com sufixo de dimensões (WP gerou)
  if (/-\d{2,4}x\d{2,4}\.(jpe?g|png|webp)(\?.*)?$/i.test(url)) return true;
  // Ou se o host/path parece WordPress/Woo
  try {
    const u = new URL(url);
    if (WP_HOST_PATTERN.test(u.hostname) || WP_HOST_PATTERN.test(u.pathname)) return true;
  } catch {
    return false;
  }
  return false;
}

/**
 * Gera srcset trocando o sufixo -WxH no padrão WordPress.
 * Se a URL não tem sufixo de tamanho, retorna null (sem srcset).
 */
export function buildWordpressSrcset(
  url: string,
  widths: number[] = [200, 400, 600, 800],
): string | null {
  if (!supportsWordpressSrcset(url)) return null;

  const match = url.match(/^(.*?)-(\d{2,4})x(\d{2,4})(\.(?:jpe?g|png|webp))(\?.*)?$/i);
  if (!match) return null;

  const [, base, , h, ext, query = ""] = match;
  const heightNum = Number(h);

  const variants = widths.map((w) => {
    const newH = Math.round((heightNum * w) / Number(match[2]));
    return `${base}-${w}x${newH}${ext}${query} ${w}w`;
  });
  return variants.join(", ");
}

/**
 * Sizes default para cards: até 640px ocupam 50vw, depois ~25vw em telas grandes.
 */
export const CARD_SIZES = "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw";
export const COMPACT_SIZES = "(max-width: 640px) 96px, 112px";
