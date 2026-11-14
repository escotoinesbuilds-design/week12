import type { Metadata } from "next";
import PricingCalculator from "./pricing-calculator";

export const metadata: Metadata = {
  title: "Precios para clínicas | RutaSalud",
  description:
    "Explora precios propuestos y simula escenarios económicos hipotéticos para tu clínica.",
};

export default function PricingPage() {
  return <PricingCalculator />;
}
