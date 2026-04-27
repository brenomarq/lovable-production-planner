import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";

import { useSigme } from "@/lib/sigme/store";
import { TypeBadge } from "@/components/sigme/TypeBadge";
import { PageHeader } from "@/components/sigme/PageHeader";

export function StockPage() {
  const { items, stock, setStock } = useSigme();
  const [query, setQuery] = useState("");

  const stockMap = useMemo(
    () => new Map(stock.map((s) => [s.itemId, s.quantity])),
    [stock],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (!q ? true : i.name.toLowerCase().includes(q)))
      .map((i) => ({ item: i, qty: stockMap.get(i.id) ?? 0 }));
  }, [items, stockMap, query]);

  const totalInStock = rows.reduce((acc, r) => acc + r.qty, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventário"
        title="Estoque"
        description="Ajuste a quantidade disponível de cada item. Os valores alimentam a lista de compras."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Itens cadastrados" value={items.length} />
        <Stat label="Itens com estoque" value={stock.filter((s) => s.quantity > 0).length} />
        <Stat label="Total em estoque" value={totalInStock} mono />
        <Stat
          label="Sem estoque"
          value={items.length - stock.filter((s) => s.quantity > 0).length}
          tone="warning"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar item…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="px-4 py-2.5 font-medium">Tipo</th>
                <th className="px-4 py-2.5 font-medium">Unidade</th>
                <th className="px-4 py-2.5 text-right font-medium">
                  Quantidade em estoque
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, qty }) => (
                <tr
                  key={item.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">
                    <TypeBadge type={item.type} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {item.unit}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={qty}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isNaN(v) || v < 0) {
                          toast.error("A quantidade não pode ser negativa.");
                          return;
                        }
                        setStock(item.id, v);
                      }}
                      className="ml-auto h-9 w-32 text-right font-mono"
                    />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
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
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: number;
  mono?: boolean;
  tone?: "warning";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "mt-1 text-2xl font-semibold tabular-nums " +
          (tone === "warning" ? "text-warning-foreground" : "text-foreground") +
          (mono ? " font-mono" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}
