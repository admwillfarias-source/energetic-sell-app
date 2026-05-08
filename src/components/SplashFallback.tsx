import { isEmbedded } from "@/lib/isEmbedded";

// Fallback mostrado enquanto o chunk do SplashScreen é baixado.
// Evita um flash de transparência antes do splash real aparecer.
// Em iframe (tema WP) o SplashScreen não monta, então também não exibimos fallback.
export default function SplashFallback() {
  if (typeof window !== "undefined" && isEmbedded()) return null;
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] bg-white"
    />
  );
}
