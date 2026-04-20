import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VehicleSearch from "@/components/VehicleSearch";
import QuickNavigation from "@/components/QuickNavigation";
import ManufacturerLogos from "@/components/ManufacturerLogos";
import { Benefits } from "@/components/Benefits";
import Services from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import WhyChoose from "@/components/WhyChoose";
import { BatteryGrid } from "@/components/BatteryGrid";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <VehicleSearch />
          <BatteryGrid />
          <QuickNavigation />
          <ManufacturerLogos />
          <Benefits />
          <Services />
          <HowItWorks />
          <WhyChoose />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
};

export default Index;
