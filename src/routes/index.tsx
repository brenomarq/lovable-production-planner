import { createFileRoute } from "@tanstack/react-router";
import { SimulationPage } from "@/components/sigme/pages/SimulationPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulação · SIGME" },
      {
        name: "description",
        content:
          "Simule a produção de um produto e descubra automaticamente o que comprar.",
      },
      { property: "og:title", content: "Simulação · SIGME" },
      {
        property: "og:description",
        content: "Simule a produção e gere a lista de compras automaticamente.",
      },
    ],
  }),
  component: SimulationPage,
});
