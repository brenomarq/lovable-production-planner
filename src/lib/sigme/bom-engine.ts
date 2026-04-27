import type { BomEdge, Item, RequirementRow, StockEntry } from "./types";

/**
 * Detecta se adicionar uma aresta (parent -> child) criaria um ciclo na BOM.
 * Faz busca: o "child" alcança o "parent" via arestas existentes?
 */
export function wouldCreateCycle(
  edges: BomEdge[],
  parentId: string,
  childId: string,
): boolean {
  if (parentId === childId) return true;
  const adjacency = new Map<string, string[]>();
  for (const e of edges) {
    if (!adjacency.has(e.parentId)) adjacency.set(e.parentId, []);
    adjacency.get(e.parentId)!.push(e.childId);
  }
  // DFS a partir de childId — se chegarmos em parentId, há ciclo
  const stack = [childId];
  const visited = new Set<string>();
  while (stack.length) {
    const node = stack.pop()!;
    if (node === parentId) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    const nexts = adjacency.get(node) ?? [];
    for (const n of nexts) stack.push(n);
  }
  return false;
}

/**
 * Faz a explosão de um produto até as folhas (COMPONENTs).
 * Retorna mapa itemId -> quantidade total necessária, somando duplicatas.
 */
export function explodeBom(
  rootId: string,
  rootQty: number,
  items: Item[],
  edges: BomEdge[],
): Map<string, number> {
  const itemById = new Map(items.map((i) => [i.id, i]));
  const result = new Map<string, number>();
  const childrenOf = new Map<string, BomEdge[]>();
  for (const e of edges) {
    if (!childrenOf.has(e.parentId)) childrenOf.set(e.parentId, []);
    childrenOf.get(e.parentId)!.push(e);
  }

  function walk(nodeId: string, qty: number, visiting: Set<string>) {
    if (visiting.has(nodeId)) return; // proteção extra contra ciclo
    const children = childrenOf.get(nodeId) ?? [];
    if (children.length === 0) {
      // folha — soma na conta
      result.set(nodeId, (result.get(nodeId) ?? 0) + qty);
      return;
    }
    const item = itemById.get(nodeId);
    // Se for SUBASSEMBLY também conta como necessário (para a vista de submontagens)
    // mas aqui focamos só em folhas (COMPONENTs) para a lista de compras.
    visiting.add(nodeId);
    for (const c of children) {
      walk(c.childId, qty * c.quantity, visiting);
    }
    visiting.delete(nodeId);
    if (!item) return;
  }

  walk(rootId, rootQty, new Set());
  return result;
}

export function buildRequirements(
  rootId: string,
  rootQty: number,
  items: Item[],
  edges: BomEdge[],
  stock: StockEntry[],
): RequirementRow[] {
  const need = explodeBom(rootId, rootQty, items, edges);
  const stockMap = new Map(stock.map((s) => [s.itemId, s.quantity]));
  const itemById = new Map(items.map((i) => [i.id, i]));
  const rows: RequirementRow[] = [];
  for (const [itemId, required] of need.entries()) {
    const item = itemById.get(itemId);
    if (!item) continue;
    const inStock = stockMap.get(itemId) ?? 0;
    const toBuy = Math.max(0, required - inStock);
    rows.push({ item, required, inStock, toBuy });
  }
  // ordena: faltantes primeiro, depois alfabético
  rows.sort((a, b) => {
    if (a.toBuy > 0 && b.toBuy === 0) return -1;
    if (a.toBuy === 0 && b.toBuy > 0) return 1;
    return a.item.name.localeCompare(b.item.name);
  });
  return rows;
}

export interface BomTreeNode {
  itemId: string;
  quantity: number; // quantidade direta para o pai
  children: BomTreeNode[];
}

export function buildBomTree(
  rootId: string,
  edges: BomEdge[],
): BomTreeNode {
  const childrenOf = new Map<string, BomEdge[]>();
  for (const e of edges) {
    if (!childrenOf.has(e.parentId)) childrenOf.set(e.parentId, []);
    childrenOf.get(e.parentId)!.push(e);
  }
  function build(id: string, qty: number, visiting: Set<string>): BomTreeNode {
    if (visiting.has(id)) {
      return { itemId: id, quantity: qty, children: [] };
    }
    visiting.add(id);
    const children = (childrenOf.get(id) ?? []).map((c) =>
      build(c.childId, c.quantity, visiting),
    );
    visiting.delete(id);
    return { itemId: id, quantity: qty, children };
  }
  return build(rootId, 1, new Set());
}
