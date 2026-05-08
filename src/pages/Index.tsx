import { lazy, Suspense, useEffect, useMemo } from "react";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LazySection from "@/components/LazySection";
import { cityPages } from "@/data/cityContent";

// Bloco 1 (above the fold): Header + HeroSection + (BatteryGrid se houver busca)
// Bloco 2 (middle): HowToOrder, BestSellers, Benefits, HowItWorks, Testimonials
// Bloco 3 (bottom): QuickNavigation, ManufacturerLogos, FaqHome, Footer, CartDrawer, MobileActionBar, FloatingWhatsApp

const BatteryGrid = lazy(() =>
  import("@/components/BatteryGrid").then((m) => ({ default: m.BatteryGrid })),
);
const HomeMiddle = lazy(() => import("@/components/home/HomeMiddle"));
const HomeBottom = lazy(() => import("@/components/home/HomeBottom"));

// Ferramentas de debug — só em DEV
const PerfReport = import.meta.env.DEV
  ? lazy(() => import("@/components/PerfReport"))
  : null;
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

  // Injeta JSON-LD organização no <head> em idle, fora do caminho crítico do LCP.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("ld-org")) return;
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    const id = schedule(() => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = "ld-org";
      s.text = JSON.stringify(orgLd);
      document.head.appendChild(s);
    }, { timeout: 4000 });
    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cancel) cancel(id as number);
    };
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[60px] lg:pt-0">
          <HeroSection />
          {hasSearch && (
            <Suspense fallback={null}>
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

        {PerfReport && (
          <Suspense fallback={null}>
            <PerfReport />
          </Suspense>
        )}
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
