// Bloco 2 da home — agrupado em um único chunk lazy.
// Carregado quando o usuário se aproxima da seção (ver Index.tsx).
import HowToOrder from "@/components/HowToOrder";
import BestSellers from "@/components/BestSellers";
import { Benefits } from "@/components/Benefits";
import { HowItWorks } from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";

export default function HomeMiddle() {
  return (
    <>
      <HowToOrder />
      <BestSellers />
      <Benefits />
      <HowItWorks />
      <Testimonials />
    </>
  );
}
