import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VehicleSearch from "@/components/VehicleSearch";
import { BatteryGrid } from "@/components/BatteryGrid";
import { Benefits } from "@/components/Benefits";
import { HowItWorks } from "@/components/HowItWorks";
import QuickNavigation from "@/components/QuickNavigation";
import ManufacturerLogos from "@/components/ManufacturerLogos";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SEO } from "@/components/SEO";
import { cityPages } from "@/data/cityContent";

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
        <main>
          <HeroSection />
          <VehicleSearch />
          <BatteryGrid />
          <Benefits />
          <HowItWorks />
          <QuickNavigation />
          <ManufacturerLogos />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
};

export default Index;
