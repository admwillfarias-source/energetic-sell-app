// Bloco 3 da home — agrupado em um único chunk lazy.
// Inclui também os componentes flutuantes (CartDrawer, FloatingWhatsApp).
import FaqHome from "@/components/FaqHome";
import FinalCtaBanner from "@/components/FinalCtaBanner";
import { Footer } from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function HomeBottom() {
  return (
    <>
      <FaqHome />
      <FinalCtaBanner />
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
