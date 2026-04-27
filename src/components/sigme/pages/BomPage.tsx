import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSigme, ITEM_TYPE_LABEL } from "@/lib/sigme/store";
import { buildBomTree, type BomTreeNode } from "@/lib/sigme/bom-engine";
import { TypeBadge } from "@/components/sigme/TypeBadge";
import { PageHeader } from "@/components/sigme/PageHeader";
import { cn } from "@/lib/utils";

export function BomPage() {
  const { items, bom, addBomEdge, updateBomEdge, removeBomEdge } = useSigme();

  const products = items.filter((i) => i.type !== "COMPONENT");
  const [rootId, setRootId] = useState<string>(products[0]?.id ?? "");

  const tree = useMemo(
    () => (rootId ? buildBomTree(rootId, bom) : null),
    [rootId, bom],
  );

  const root = items.find((i) => i.id === rootId);

  const directChildren = bom.filter((e) => e.parentId === rootId);

  // form para adicionar componente direto
  const [newChildId, setNewChildId] = useState<string>("");
  const [newQty, setNewQty] = useState<number>(1);

  const eligibleChildren = items.filter(
    (i) =>
      i.id !== rootId &&
      !directChildren.some((d) => d.childId === i.id),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Estrutura"
        title="BOM Multinível"
        description="Visualize a árvore de composição do produto e edite seus componentes diretos."
      />

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        {/* Seletor de produto / submontagem */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Estrutura de
            </Label>
            <Select value={rootId} onValueChange={setRootId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {ITEM_TYPE_LABEL[p.type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {root && (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Item raiz
              </div>
              <div className="mt-1 text-base font-semibold">{root.name}</div>
              <div className="mt-2">
                <TypeBadge type={root.type} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                <div>
                  <div className="text-muted-foreground">Filhos diretos</div>
                  <div className="text-base font-semibold text-foreground">
                    {directChildren.length}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Folhas</div>
                  <div className="text-base font-semibold text-foreground">
                    {countLeaves(tree)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form: adicionar componente direto */}
          {root && (
            <form
              className="space-y-3 rounded-lg border border-border bg-background p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newChildId) {
                  toast.error("Selecione um item.");
                  return;
                }
                if (newQty <= 0) {
                  toast.error("A quantidade deve ser maior que zero.");
                  return;
                }
                const r = addBomEdge(rootId, newChildId, newQty);
                if (!r.ok) {
                  toast.error(r.error);
                  return;
                }
                toast.success("Componente adicionado à estrutura.");
                setNewChildId("");
                setNewQty(1);
              }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Adicionar componente direto
              </div>
              <Select value={newChildId} onValueChange={setNewChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um item" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleChildren.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Nenhum item disponível.
                    </div>
                  )}
                  {eligibleChildren.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} · {ITEM_TYPE_LABEL[i.type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-24"
                />
                <Button type="submit" className="flex-1">
                  <Plus className="h-4 w-4" /> Adicionar
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Árvore */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Árvore de composição</div>
            <div className="font-mono text-xs text-muted-foreground">
              clique nos nós para expandir
            </div>
          </div>
          <div className="p-4">
            {tree ? (
              <BomTreeView
                node={tree}
                depth={0}
                isRoot
                onUpdate={updateBomEdge}
                onRemove={removeBomEdge}
                parentId={null}
              />
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Selecione um produto para visualizar a estrutura.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function countLeaves(node: BomTreeNode | null): number {
  if (!node) return 0;
  if (node.children.length === 0) return 1;
  return node.children.reduce((acc, c) => acc + countLeaves(c), 0);
}

function BomTreeView({
  node,
  depth,
  isRoot = false,
  parentId,
  onUpdate,
  onRemove,
}: {
  node: BomTreeNode;
  depth: number;
  isRoot?: boolean;
  parentId: string | null;
  onUpdate: (parentId: string, childId: string, qty: number) => void;
  onRemove: (parentId: string, childId: string) => void;
}) {
  const { itemById } = useSigme();
  const item = itemById(node.itemId);
  const [open, setOpen] = useState(true);
  const [editingQty, setEditingQty] = useState(false);
  const [qty, setQty] = useState(node.quantity);
  const hasChildren = node.children.length > 0;

  if (!item) return null;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md py-1.5 pr-2 hover:bg-muted/50",
          isRoot && "bg-accent/40",
        )}
        style={{ paddingLeft: depth * 20 + 4 }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted",
            !hasChildren && "invisible",
          )}
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{item.name}</span>
            <TypeBadge type={item.type} className="shrink-0" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRoot && parentId && (
            <>
              {editingQty ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (qty <= 0) {
                      toast.error("Quantidade deve ser > 0.");
                      return;
                    }
                    onUpdate(parentId, node.itemId, qty);
                    setEditingQty(false);
                    toast.success("Quantidade atualizada.");
                  }}
                >
                  <Input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    onBlur={() => {
                      if (qty > 0 && qty !== node.quantity)
                        onUpdate(parentId, node.itemId, qty);
                      setEditingQty(false);
                    }}
                    className="h-7 w-20 font-mono text-xs"
                    autoFocus
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingQty(true)}
                  className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs hover:border-primary hover:text-primary"
                >
                  × {node.quantity} {item.unit}
                </button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={() => {
                  onRemove(parentId, node.itemId);
                  toast.success("Componente removido.");
                }}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {isRoot && (
            <span className="font-mono text-xs text-muted-foreground">
              raiz
            </span>
          )}
        </div>
      </div>

      {open && hasChildren && (
        <div className="border-l border-dashed border-border" style={{ marginLeft: depth * 20 + 14 }}>
          {node.children.map((child) => (
            <div key={`${node.itemId}-${child.itemId}`}>
              <BomTreeView
                node={child}
                depth={depth + 1}
                parentId={node.itemId}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// utility unused import guard
void Trash2;
