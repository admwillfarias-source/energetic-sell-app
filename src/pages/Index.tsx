import { lazy, Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { BatteryGrid } from "@/components/BatteryGrid";
import MobileActionBar from "@/components/MobileActionBar";
import LazySection from "@/components/LazySection";
import { SEO } from "@/components/SEO";
import { cityPages } from "@/data/cityContent";

const Benefits = lazy(() => import("@/components/Benefits").then((m) => ({ default: m.Benefits })));
const HowItWorks = lazy(() =>
  import("@/components/HowItWorks").then((m) => ({ default: m.HowItWorks })),
);
const HowToOrder = lazy(() => import("@/components/HowToOrder"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const FaqHome = lazy(() => import("@/components/FaqHome"));
const FloatingWhatsApp = lazy(() => import("@/components/FloatingWhatsApp"));
const QuickNavigation = lazy(() => import("@/components/QuickNavigation"));
const ManufacturerLogos = lazy(() => import("@/components/ManufacturerLogos"));
const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));
const CartDrawer = lazy(() =>
  import("@/components/CartDrawer").then((m) => ({ default: m.CartDrawer })),
);
const EngagementPopup = lazy(() => import("@/components/EngagementPopup"));
const PerfReport = lazy(() => import("@/components/PerfReport"));

const SITE = "https://awrbaterias.com.br";

const Index = () => {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    name: "AWR Baterias",
    url: SITE,
    telephone: "+5551985419143",
    priceRange: "R$ 350 - R$ 2.500",
    address: {
      "@type": "PostalAddress",
      addressRegion: "RS",
      addressCountry: "BR",
    },
    areaServed: cityPages.map((c) => ({
      "@type": "City",
      name: c.name,
    })),
  };

  return (
    <CartProvider>
      <SEO
        title="AWR Baterias | Entrega e instalação em até 35 minutos | Porto Alegre e Região"
        description="Bateria automotiva entregue e instalada em até 35 minutos em Porto Alegre, Canoas, Gravataí, Cachoeirinha, Esteio e Novo Hamburgo. Moura, Heliar, Zetta e Excell com garantia de fábrica."
        canonical={SITE}
        jsonLd={orgLd}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pb-32 lg:pb-0">
          <HeroSection />
          <BatteryGrid />
          <LazySection minHeight="320px">
            <Suspense fallback={null}>
              <HowToOrder />
            </Suspense>
          </LazySection>
          <LazySection minHeight="400px">
            <Suspense fallback={null}>
              <Benefits />
            </Suspense>
          </LazySection>
          <LazySection minHeight="400px">
            <Suspense fallback={null}>
              <HowItWorks />
            </Suspense>
          </LazySection>
          <LazySection minHeight="360px">
            <Suspense fallback={null}>
              <Testimonials />
            </Suspense>
          </LazySection>
          <LazySection minHeight="300px">
            <Suspense fallback={null}>
              <QuickNavigation />
            </Suspense>
          </LazySection>
          <LazySection minHeight="200px">
            <Suspense fallback={null}>
              <ManufacturerLogos />
            </Suspense>
          </LazySection>
          <LazySection minHeight="320px">
            <Suspense fallback={null}>
              <FaqHome />
            </Suspense>
          </LazySection>
        </main>
        <LazySection minHeight="300px">
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </LazySection>
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
        <MobileActionBar />
        <Suspense fallback={null}>
          <FloatingWhatsApp />
        </Suspense>
        <Suspense fallback={null}>
          <EngagementPopup />
        </Suspense>
        <Suspense fallback={null}>
          <PerfReport />
        </Suspense>
      </div>
    </CartProvider>
  );
};

export default Index;
