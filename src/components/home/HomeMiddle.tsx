// Bloco 2 da home — agrupado em um único chunk lazy.
// Carregado quando o usuário se aproxima da seção (ver Index.tsx).
import { Benefits } from "@/components/Benefits";
import BestSellers from "@/components/BestSellers";
import ManufacturerLogos from "@/components/ManufacturerLogos";
import { HowItWorks } from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";

export default function HomeMiddle() {
  return (
    <>
      <Benefits />
      <BestSellers />
      <ManufacturerLogos />
      <HowItWorks />
      <Testimonials />
    </>
  );
}
