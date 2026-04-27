import type { BomEdge, Item, StockEntry } from "./types";

export const initialItems: Item[] = [
  { id: "kit-edu", name: "Kit Educacional", type: "PRODUCT", unit: "un" },
  { id: "placa", name: "Placa Eletrônica", type: "SUBASSEMBLY", unit: "un" },
  { id: "gabinete", name: "Gabinete Plástico", type: "COMPONENT", unit: "un" },
  { id: "manual", name: "Manual Impresso", type: "COMPONENT", unit: "un" },
  { id: "resistor", name: "Resistor 220Ω", type: "COMPONENT", unit: "un" },
  { id: "capacitor", name: "Capacitor 100µF", type: "COMPONENT", unit: "un" },
  { id: "led", name: "LED Vermelho 5mm", type: "COMPONENT", unit: "un" },
  { id: "solda", name: "Solda Estanho", type: "COMPONENT", unit: "g" },
];

export const initialBom: BomEdge[] = [
  { parentId: "kit-edu", childId: "placa", quantity: 2 },
  { parentId: "kit-edu", childId: "gabinete", quantity: 1 },
  { parentId: "kit-edu", childId: "manual", quantity: 1 },
  { parentId: "placa", childId: "resistor", quantity: 10 },
  { parentId: "placa", childId: "capacitor", quantity: 5 },
  { parentId: "placa", childId: "led", quantity: 3 },
  { parentId: "placa", childId: "solda", quantity: 8 },
];

export const initialStock: StockEntry[] = [
  { itemId: "resistor", quantity: 50 },
  { itemId: "capacitor", quantity: 10 },
  { itemId: "led", quantity: 200 },
  { itemId: "solda", quantity: 500 },
  { itemId: "gabinete", quantity: 5 },
  { itemId: "manual", quantity: 80 },
  { itemId: "placa", quantity: 4 },
];
