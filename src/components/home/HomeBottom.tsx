// Bloco 3 da home — agrupado em um único chunk lazy.
import FaqHome from "@/components/FaqHome";
import FinalCtaBanner from "@/components/FinalCtaBanner";
import { Footer } from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { isEmbedded } from "@/lib/isEmbedded";

const EMBEDDED = isEmbedded();

export default function HomeBottom() {
  return (
    <>
      <FaqHome />
      <FinalCtaBanner />
      <Footer />
      {!EMBEDDED && <FloatingWhatsApp />}
    </>
  );
}
