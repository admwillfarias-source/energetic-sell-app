// Bloco 3 da home — agrupado em um único chunk lazy.
// Inclui também os componentes flutuantes (CartDrawer, FloatingWhatsApp).
import QuickNavigation from "@/components/QuickNavigation";
import ManufacturerLogos from "@/components/ManufacturerLogos";
import FaqHome from "@/components/FaqHome";
import { Footer } from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function HomeBottom() {
  return (
    <>
      <QuickNavigation />
      <ManufacturerLogos />
      <FaqHome />
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
