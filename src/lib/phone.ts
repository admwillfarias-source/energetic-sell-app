const BRAZIL_COUNTRY_CODE = "55";

export function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "tel:+555135165472";

  const withCountryCode = digits.startsWith(BRAZIL_COUNTRY_CODE)
    ? digits
    : `${BRAZIL_COUNTRY_CODE}${digits}`;

  return `tel:+${withCountryCode}`;
}
