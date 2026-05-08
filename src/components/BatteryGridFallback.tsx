import { Skeleton } from "@/components/ui/skeleton";

// Fallback visual mostrado enquanto o chunk do BatteryGrid carrega.
// Reserva espaço (evita CLS) e dá pista de "carregando resultados".
export default function BatteryGridFallback() {
  return (
    <section
      id="catalogo"
      className="bg-background py-8 md:py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="container">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-foreground/70">
              Resultado
            </span>
            <h2 className="mt-1 font-display text-xl font-bold md:text-2xl">
              Buscando baterias compatíveis…
            </h2>
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[420px] rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
