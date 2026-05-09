import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { CartProvider } from "@/context/CartContext";
import HeroSection from "@/components/HeroSection";
import LazySection from "@/components/LazySection";
import MobileActionBar from "@/components/MobileActionBar";
import { isEmbedded } from "@/lib/isEmbedded";

// Quando rodando em iframe (preview Lovable / tema WP), o parent já fornece
// header, footer, contato flutuante, SEO e tracking. Não precisamos pagar
// esse custo dentro do iframe — pula tudo isso para deixar o frame leve.
const EMBEDDED = isEmbedded();

// Cascata de carregamento:
// [shell estático em index.html] → FCP imediato
// [bundle React] HeroSection ─► LCP
// [idle] Header monta
// [idle] pré-fetch dos chunks de meio/baixo
// [scroll] HomeMiddle / HomeBottom montam
const Header = lazy(() => import("@/components/Header").then((m) => ({ default: m.Header })));
const BatteryGrid = lazy(() =>
  import("@/components/BatteryGrid").then((m) => ({ default: m.BatteryGrid })),
);
const HomeMiddle = lazy(() => import("@/components/home/HomeMiddle"));
const HomeBottom = lazy(() => import("@/components/home/HomeBottom"));

const SITE = "https://awrbaterias.com.br";

const Index = () => {
  // Só monta o BatteryGrid se a URL pedir resultado.
  const hasSearch = useMemo(() => {
    if (typeof window === "undefined") return false;
    const sp = new URLSearchParams(window.location.search);
    return !!(sp.get("q") || sp.get("codes") || sp.get("v"));
  }, []);

  // Header entra em cascata após o LCP, em idle (mesmo em iframe).
  const [showHeader, setShowHeader] = useState(false);
  useEffect(() => {
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 800));
    const id = schedule(() => setShowHeader(true), { timeout: 2500 });
    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cancel) cancel(id as number);
    };
  }, []);

  // Pré-fetch dos chunks middle/bottom em idle. Em iframe, o HomeBottom não
  // monta (parent já tem footer/whatsapp/cart) — então só pré-fetch do middle.
  useEffect(() => {
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    const id = schedule(() => {
      import("@/components/home/HomeMiddle");
      if (!EMBEDDED) import("@/components/home/HomeBottom");
    }, { timeout: 4000 });
    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cancel) cancel(id as number);
    };
  }, []);

  // Injeta JSON-LD organização em idle. Em iframe, o parent (site WP) já
  // serve o JSON-LD canônico — pular evita duplicação e trabalho.
  useEffect(() => {
    if (EMBEDDED) return;
    if (typeof document === "undefined") return;
    if (document.getElementById("ld-org")) return;
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    const id = schedule(() => {
      const orgLd = {
        "@context": "https://schema.org",
        "@type": "AutomotiveBusiness",
        name: "AWR Baterias",
        url: SITE,
        telephone: "+5551985419143",
        priceRange: "R$ 350 - R$ 2.500",
        foundingDate: "2009",
        address: { "@type": "PostalAddress", addressRegion: "RS", addressCountry: "BR" },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
            opens: "06:00",
            closes: "22:00",
          },
        ],
        aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: 1500 },
      };
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
        <MobileActionBar />
        {showHeader && (
          <Suspense fallback={null}>
            <Header />
          </Suspense>
        )}
        <main className="pt-[116px] lg:pt-0">
          <HeroSection />
          {hasSearch && (
            <Suspense fallback={null}>
              <BatteryGrid />
            </Suspense>
          )}

          <LazySection minHeight="800px" rootMargin="50px">
            <Suspense fallback={null}>
              <HomeMiddle />
            </Suspense>
          </LazySection>

          {!EMBEDDED && (
            <LazySection minHeight="600px" rootMargin="0px">
              <Suspense fallback={null}>
                <HomeBottom />
              </Suspense>
            </LazySection>
          )}
        </main>
      </div>
    </CartProvider>
  );
};

export default Index;
