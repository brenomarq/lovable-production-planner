import { createFileRoute } from "@tanstack/react-router";
import { StockPage } from "@/components/sigme/pages/StockPage";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque · SIGME" },
      {
        name: "description",
        content: "Visualize e ajuste a quantidade em estoque de cada item.",
      },
      { property: "og:title", content: "Estoque · SIGME" },
      {
        property: "og:description",
        content: "Ajuste o estoque de cada item do SIGME.",
      },
    ],
  }),
  component: StockPage,
});
