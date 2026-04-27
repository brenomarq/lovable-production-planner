import type { Item } from "./types";

/**
 * Copilot mockado: extrai (productId, quantity) de uma frase em português.
 * Nada de IA real — só regex + matching por nome.
 */
export interface CopilotIntent {
  productId: string | null;
  productName: string | null;
  quantity: number | null;
  reasoning: string;
}

export function interpretCopilotPrompt(
  prompt: string,
  items: Item[],
): CopilotIntent {
  const text = prompt.toLowerCase().trim();
  const products = items.filter((i) => i.type !== "COMPONENT");

  // 1. Quantidade
  const numMatch = text.match(/(\d+(?:[.,]\d+)?)/);
  const quantity = numMatch
    ? Math.max(1, Math.round(parseFloat(numMatch[1].replace(",", "."))))
    : null;

  // 2. Produto — match pelo nome (mais longo primeiro)
  let chosen: Item | null = null;
  const sortedByLen = [...products].sort(
    (a, b) => b.name.length - a.name.length,
  );
  for (const p of sortedByLen) {
    const name = p.name.toLowerCase();
    // tenta nome inteiro
    if (text.includes(name)) {
      chosen = p;
      break;
    }
    // tenta primeira palavra significativa
    const firstWord = name.split(/\s+/)[0];
    if (firstWord.length > 3 && text.includes(firstWord)) {
      chosen = p;
      break;
    }
  }

  // 3. Sinônimos comuns
  if (!chosen) {
    if (/(kit|kits|educacional)/.test(text)) {
      chosen = products.find((p) => /kit/i.test(p.name)) ?? null;
    } else if (/placa/.test(text)) {
      chosen = products.find((p) => /placa/i.test(p.name)) ?? null;
    }
  }

  let reasoning = "";
  if (chosen && quantity) {
    reasoning = `Entendi: simular produção de ${quantity} × ${chosen.name}.`;
  } else if (chosen) {
    reasoning = `Identifiquei o produto "${chosen.name}", mas não encontrei a quantidade. Informe um número.`;
  } else if (quantity) {
    reasoning = `Identifiquei a quantidade ${quantity}, mas não sei qual produto você quer simular.`;
  } else {
    reasoning =
      "Não consegui interpretar. Tente algo como: \"Quero produzir 50 kits educacionais\".";
  }

  return {
    productId: chosen?.id ?? null,
    productName: chosen?.name ?? null,
    quantity,
    reasoning,
  };
}
