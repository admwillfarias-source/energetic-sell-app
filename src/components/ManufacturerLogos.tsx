import brandMoura from "@/assets/brand-moura.webp";
import brandHeliar from "@/assets/brand-heliar.webp";
import brandFreedom from "@/assets/brand-freedom.webp";
import brandExcell from "@/assets/brand-excell.webp";
import brandEletran from "@/assets/brand-eletran.webp";
import brandZetta from "@/assets/brand-zetta.webp";
import brandGlobal from "@/assets/brand-global.webp";

const brands = [
  { name: "Moura", img: brandMoura },
  { name: "Heliar", img: brandHeliar },
  { name: "Freedom", img: brandFreedom },
  { name: "Excell", img: brandExcell },
  { name: "Eletran", img: brandEletran },
  { name: "Zetta", img: brandZetta },
  { name: "Global", img: brandGlobal },
];

type Props = { variant?: "full" | "compact" };

export default function ManufacturerLogos({ variant = "full" }: Props) {
  if (variant === "compact") {
    return (
      <div
        className="flex flex-wrap items-center justify-start gap-x-5 gap-y-2"
        aria-label="Marcas oficiais distribuídas pela AWR Baterias"
      >
        {brands.map((b) => (
          <img
            key={b.name}
            src={b.img}
            alt={`Logo ${b.name} — distribuidor autorizado AWR Baterias`}
            width={120}
            height={32}
            className="h-7 md:h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    );
  }

  return (
    <section className="py-10 md:py-14 bg-background" aria-labelledby="brands-title">
      <div className="container mx-auto px-4">
        <h2
          id="brands-title"
          className="font-display text-xl md:text-2xl font-extrabold text-foreground text-center mb-2"
        >
          Marcas que Trabalhamos
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Revenda autorizada das principais fabricantes do Brasil
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 max-w-4xl mx-auto">
          {brands.map((b) => (
            <div
              key={b.name}
              className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition-all"
              title={`Baterias ${b.name}`}
            >
              <img
                src={b.img}
                alt={`Logo ${b.name} — distribuidor autorizado AWR Baterias`}
                width={140}
                height={56}
                className="h-12 md:h-14 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
              <span className="text-muted-foreground text-[10px] md:text-xs font-medium">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
