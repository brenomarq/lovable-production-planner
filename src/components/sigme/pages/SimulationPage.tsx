import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  Send,
  ShoppingCart,
  Sparkles,
  Wand2,
} from "lucide-react";
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
import { buildRequirements } from "@/lib/sigme/bom-engine";
import { interpretCopilotPrompt } from "@/lib/sigme/copilot";
import { TypeBadge } from "@/components/sigme/TypeBadge";
import { PageHeader } from "@/components/sigme/PageHeader";
import { cn } from "@/lib/utils";
import type { RequirementRow } from "@/lib/sigme/types";

interface SimulationResult {
  productId: string;
  productName: string;
  quantity: number;
  rows: RequirementRow[];
  ranAt: Date;
}

const COPILOT_SUGGESTIONS = [
  "Quero produzir 50 kits educacionais",
  "Simule 20 placas eletrônicas",
  "O que preciso para 100 kits?",
];

export function SimulationPage() {
  const { items, bom, stock } = useSigme();
  const products = items.filter((i) => i.type !== "COMPONENT");

  const [productId, setProductId] = useState<string>(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState<number>(50);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);

  // Copilot
  const [prompt, setPrompt] = useState("");
  const [copilotMsg, setCopilotMsg] = useState<string | null>(null);

  const runSimulation = (pid?: string, qty?: number) => {
    const finalId = pid ?? productId;
    const finalQty = qty ?? quantity;
    if (!finalId) {
      toast.error("Selecione um produto.");
      return;
    }
    if (!finalQty || finalQty <= 0) {
      toast.error("A quantidade deve ser maior que zero.");
      return;
    }

    setRunning(true);
    // Simula um pequeno tempo de processamento para feedback visual
    setTimeout(() => {
      const rows = buildRequirements(finalId, finalQty, items, bom, stock);
      const product = items.find((i) => i.id === finalId)!;
      setResult({
        productId: finalId,
        productName: product.name,
        quantity: finalQty,
        rows,
        ranAt: new Date(),
      });
      setRunning(false);
      toast.success(
        `Simulação concluída: ${rows.length} componente(s) analisado(s).`,
      );
    }, 350);
  };

  const handleCopilot = () => {
    if (!prompt.trim()) return;
    const intent = interpretCopilotPrompt(prompt, items);
    setCopilotMsg(intent.reasoning);
    if (intent.productId && intent.quantity) {
      setProductId(intent.productId);
      setQuantity(intent.quantity);
      runSimulation(intent.productId, intent.quantity);
      setPrompt("");
    }
  };

  const summary = useMemo(() => {
    if (!result)
      return { total: 0, available: 0, missing: 0, totalToBuy: 0 };
    const missing = result.rows.filter((r) => r.toBuy > 0);
    const available = result.rows.filter((r) => r.toBuy === 0);
    const totalToBuy = missing.reduce((acc, r) => acc + r.toBuy, 0);
    return {
      total: result.rows.length,
      available: available.length,
      missing: missing.length,
      totalToBuy,
    };
  }, [result]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Painel principal"
        title="Simulação de Produção"
        description="Selecione um produto, informe a quantidade e descubra automaticamente o que comprar."
      />

      {/* Copilot */}
      <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-accent/40 via-card to-card p-5 shadow-sm">
        <div className="absolute inset-0 surface-grid opacity-[0.18] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              AI Copilot · Beta
            </span>
          </div>
          <h3 className="mt-1 text-lg font-semibold">
            Pergunte em linguagem natural
          </h3>

          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleCopilot();
            }}
          >
            <div className="relative flex-1">
              <Wand2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: O que preciso para produzir 50 kits?"
                className="h-11 bg-background pl-9"
              />
            </div>
            <Button type="submit" size="lg">
              <Send className="h-4 w-4" />
              Interpretar
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {COPILOT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>

          {copilotMsg && (
            <div className="mt-4 rounded-lg border border-border bg-background/80 p-3 text-sm">
              <span className="font-semibold text-primary">Copilot · </span>
              <span className="text-foreground/80">{copilotMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Form clássico */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Produto a simular
            </Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione" />
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
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Quantidade
            </Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="h-11 font-mono text-base"
            />
          </div>
        </div>
        <Button
          size="lg"
          className="h-full min-h-[88px] px-8 text-base"
          disabled={running}
          onClick={() => runSimulation()}
        >
          {running ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Calculando…
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Simular Produção
            </>
          )}
        </Button>
      </div>

      {/* Resultado */}
      {result && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard
              label="Componentes únicos"
              value={summary.total.toString()}
            />
            <KpiCard
              label="Disponíveis"
              value={summary.available.toString()}
              tone="success"
            />
            <KpiCard
              label="Faltantes"
              value={summary.missing.toString()}
              tone={summary.missing > 0 ? "warning" : "muted"}
            />
            <KpiCard
              label="Unidades a comprar"
              value={summary.totalToBuy.toString()}
              tone={summary.totalToBuy > 0 ? "warning" : "muted"}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {/* Lista de materiais */}
            <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-3">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">
                    Lista de materiais
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    Para {result.quantity} × {result.productName}
                  </div>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {result.ranAt.toLocaleTimeString("pt-BR")}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Componente</th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Necessário
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Em estoque
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        A comprar
                      </th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => {
                      const ok = row.toBuy === 0;
                      return (
                        <tr
                          key={row.item.id}
                          className={cn(
                            "border-b border-border/60 last:border-0",
                            ok ? "hover:bg-success/5" : "bg-destructive/[0.04]",
                          )}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium">{row.item.name}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {row.item.unit}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                            {row.required.toLocaleString("pt-BR")}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                            {row.inStock.toLocaleString("pt-BR")}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 text-right font-mono font-semibold tabular-nums",
                              ok
                                ? "text-muted-foreground/60"
                                : "text-destructive",
                            )}
                          >
                            {row.toBuy === 0
                              ? "—"
                              : row.toBuy.toLocaleString("pt-BR")}
                          </td>
                          <td className="px-4 py-3">
                            {ok ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                                <CheckCircle2 className="h-3 w-3" />
                                OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                                <AlertTriangle className="h-3 w-3" />
                                Faltam {row.toBuy}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lista de compras */}
            <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-border bg-destructive/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-destructive" />
                  <div className="text-sm font-semibold text-destructive">
                    Lista de compras
                  </div>
                </div>
                <span className="font-mono text-xs text-destructive/80">
                  {summary.missing} item(ns)
                </span>
              </div>
              {summary.missing === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div className="text-sm font-semibold">
                    Estoque suficiente!
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Você pode produzir {result.quantity} ×{" "}
                    {result.productName} sem comprar nada.
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {result.rows
                    .filter((r) => r.toBuy > 0)
                    .map((row) => (
                      <li
                        key={row.item.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {row.item.name}
                          </div>
                          <div className="mt-0.5">
                            <TypeBadge type={row.item.type} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-base font-semibold tabular-nums text-destructive">
                            +{row.toBuy.toLocaleString("pt-BR")}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {row.item.unit}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {!result && (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Play className="h-5 w-5" />
          </div>
          <div className="mt-3 text-sm font-semibold">
            Pronto para simular
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Selecione um produto e clique em "Simular Produção" para ver os
            resultados.
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "muted";
}) {
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-destructive"
        : tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 font-mono text-3xl font-semibold tabular-nums", toneCls)}>
        {value}
      </div>
    </div>
  );
}
