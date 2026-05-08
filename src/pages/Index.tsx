import { lazy, Suspense, useMemo } from "react";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LazySection from "@/components/LazySection";
import BatteryGridFallback from "@/components/BatteryGridFallback";
import { SEO } from "@/components/SEO";
import { cityPages } from "@/data/cityContent";

// Bloco 1 (above the fold): Header + HeroSection + (BatteryGrid se houver busca)
// Bloco 2 (middle): HowToOrder, BestSellers, Benefits, HowItWorks, Testimonials
// Bloco 3 (bottom): QuickNavigation, ManufacturerLogos, FaqHome, Footer, CartDrawer, MobileActionBar, FloatingWhatsApp

const BatteryGrid = lazy(() =>
  import("@/components/BatteryGrid").then((m) => ({ default: m.BatteryGrid })),
);
const HomeMiddle = lazy(() => import("@/components/home/HomeMiddle"));
const HomeBottom = lazy(() => import("@/components/home/HomeBottom"));

// PerfReport disponível em DEV sempre, e em prod via ?perf=1
const PerfReport = lazy(() => import("@/components/PerfReport"));
const MobileDebugOverlay = import.meta.env.DEV
  ? lazy(() => import("@/components/MobileDebugOverlay"))
  : null;

const SITE = "https://awrbaterias.com.br";

const Index = () => {
  // Só monta o BatteryGrid (chunk de busca/grid) se a URL pedir resultado.
  const hasSearch = useMemo(() => {
    if (typeof window === "undefined") return false;
    const sp = new URLSearchParams(window.location.search);
    return !!(sp.get("q") || sp.get("codes") || sp.get("v"));
  }, []);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    name: "AWR Baterias",
    url: SITE,
    telephone: "+5551985419143",
    priceRange: "R$ 350 - R$ 2.500",
    foundingDate: "2009",
    address: {
      "@type": "PostalAddress",
      addressRegion: "RS",
      addressCountry: "BR",
    },
    areaServed: cityPages.map((c) => ({
      "@type": "City",
      name: c.name,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        opens: "06:00",
        closes: "22:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: 1500,
    },
  };

  return (
    <CartProvider>
      <SEO
        title="AWR Baterias | Entrega e Instalação em Porto Alegre, Canoas, São Leopoldo e RS"
        description="Bateria automotiva com entrega e instalação grátis em Porto Alegre, Canoas, Gravataí, Cachoeirinha, Esteio, Novo Hamburgo, São Leopoldo, Sapucaia, Ivoti, Campo Bom, Estância Velha, Nova Santa Rita, Alvorada e Viamão. Moura, Heliar, Zetta, Excell. 10x sem juros, garantia de fábrica."
        canonical={SITE}
        jsonLd={orgLd}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[60px] lg:pt-0">
          <HeroSection />
          {hasSearch && (
            <Suspense fallback={<BatteryGridFallback />}>
              <BatteryGrid />
            </Suspense>
          )}

          {/* Bloco 2: meio da página, monta ao se aproximar */}
          <LazySection minHeight="1980px" rootMargin="200px">
            <Suspense fallback={null}>
              <HomeMiddle />
            </Suspense>
          </LazySection>

          {/* Bloco 3: rodapé + flutuantes, monta perto do fim */}
          <LazySection minHeight="1120px" rootMargin="100px">
            <Suspense fallback={null}>
              <HomeBottom />
            </Suspense>
          </LazySection>
        </main>

        <Suspense fallback={null}>
          <PerfReport />
        </Suspense>
        {MobileDebugOverlay && (
          <Suspense fallback={null}>
            <MobileDebugOverlay />
          </Suspense>
        )}
      </div>
    </CartProvider>
  );
};

export default Index;
