import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useSigme, ITEM_TYPE_LABEL } from "@/lib/sigme/store";
import type { Item, ItemType } from "@/lib/sigme/types";
import { TypeBadge } from "@/components/sigme/TypeBadge";
import { PageHeader } from "@/components/sigme/PageHeader";

export function ItemsPage() {
  const { items, addItem, updateItem, removeItem, bom } = useSigme();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        ITEM_TYPE_LABEL[it.type].toLowerCase().includes(q),
    );
  }, [items, query]);

  const usageCount = (id: string) =>
    bom.filter((e) => e.parentId === id || e.childId === id).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cadastro"
        title="Itens"
        description="Gerencie produtos, submontagens e componentes que compõem suas BOMs."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Adicionar Item
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou tipo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <span className="font-mono text-xs text-muted-foreground">
            {filtered.length}/{items.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Nome</th>
                <th className="px-4 py-2.5 font-medium">Tipo</th>
                <th className="px-4 py-2.5 font-medium">Unidade</th>
                <th className="px-4 py-2.5 font-medium">Uso na BOM</th>
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="w-1 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {item.name}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={item.type} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {item.unit}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {usageCount(item.id)} relação(ões)
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground/70">
                    {item.id}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditing(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeletingId(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    Nenhum item encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ItemDialog
        open={creating}
        onOpenChange={setCreating}
        onSubmit={(data) => {
          addItem(data);
          toast.success(`Item "${data.name}" criado.`);
        }}
      />
      <ItemDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initial={editing ?? undefined}
        onSubmit={(data) => {
          if (editing) {
            updateItem(editing.id, data);
            toast.success(`Item "${data.name}" atualizado.`);
          }
        }}
      />

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover este item?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as relações de BOM e o estoque deste item também serão
              removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingId) {
                  removeItem(deletingId);
                  toast.success("Item removido.");
                }
                setDeletingId(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ItemDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Item, "id">) => void;
  initial?: Item;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<ItemType>(initial?.type ?? "COMPONENT");
  const [unit, setUnit] = useState(initial?.unit ?? "un");

  // Reset on open
  const isOpen = open;
  const key = `${initial?.id ?? "new"}-${isOpen}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" key={key}>
        <DialogHeader>
          <DialogTitle>
            {initial ? "Editar item" : "Adicionar novo item"}
          </DialogTitle>
          <DialogDescription>
            Defina o nome, o tipo e a unidade de medida.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (!trimmed) {
              toast.error("Informe um nome.");
              return;
            }
            onSubmit({ name: trimmed, type, unit: unit.trim() || "un" });
            onOpenChange(false);
            setName("");
            setUnit("un");
            setType("COMPONENT");
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              defaultValue={initial?.name ?? ""}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Resistor 220Ω"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                defaultValue={initial?.type ?? "COMPONENT"}
                onValueChange={(v) => setType(v as ItemType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Produto</SelectItem>
                  <SelectItem value="SUBASSEMBLY">Submontagem</SelectItem>
                  <SelectItem value="COMPONENT">Componente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                defaultValue={initial?.unit ?? "un"}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="un, g, m…"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{initial ? "Salvar" : "Criar item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
