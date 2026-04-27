import { createFileRoute } from "@tanstack/react-router";
import { ItemsPage } from "@/components/sigme/pages/ItemsPage";

export const Route = createFileRoute("/itens")({
  head: () => ({
    meta: [
      { title: "Itens · SIGME" },
      {
        name: "description",
        content: "Cadastro de itens: produtos, submontagens e componentes.",
      },
      { property: "og:title", content: "Itens · SIGME" },
      {
        property: "og:description",
        content: "Cadastro de itens: produtos, submontagens e componentes.",
      },
    ],
  }),
  component: ItemsPage,
});
