import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { Benefits } from "@/components/Benefits";
import { HowItWorks } from "@/components/HowItWorks";
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
          <Benefits />
          <HowItWorks />
          <BatteryGrid />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
};

export default Index;
