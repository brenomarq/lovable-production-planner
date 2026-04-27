export type ItemType = "PRODUCT" | "SUBASSEMBLY" | "COMPONENT";

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  unit: string;
}

export interface BomEdge {
  parentId: string;
  childId: string;
  quantity: number;
}

export interface StockEntry {
  itemId: string;
  quantity: number;
}

export interface RequirementRow {
  item: Item;
  required: number;
  inStock: number;
  toBuy: number;
}
