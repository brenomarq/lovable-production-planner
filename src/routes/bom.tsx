import { createFileRoute } from "@tanstack/react-router";
import { BomPage } from "@/components/sigme/pages/BomPage";

export const Route = createFileRoute("/bom")({
  head: () => ({
    meta: [
      { title: "Estrutura BOM · SIGME" },
      {
        name: "description",
        content:
          "Edite a estrutura multinível (BOM) dos seus produtos com visão hierárquica.",
      },
      { property: "og:title", content: "Estrutura BOM · SIGME" },
      {
        property: "og:description",
        content: "Edite a estrutura multinível (BOM) dos seus produtos.",
      },
    ],
  }),
  component: BomPage,
});
