import type { ItemType } from "@/lib/sigme/types";
import { cn } from "@/lib/utils";
import { Cpu, Layers, Package } from "lucide-react";

const TYPE_STYLES: Record<
  ItemType,
  { label: string; icon: typeof Cpu; cls: string }
> = {
  PRODUCT: {
    label: "Produto",
    icon: Package,
    cls: "bg-primary/12 text-primary border-primary/25",
  },
  SUBASSEMBLY: {
    label: "Submontagem",
    icon: Layers,
    cls: "bg-warning/15 text-warning-foreground border-warning/40",
  },
  COMPONENT: {
    label: "Componente",
    icon: Cpu,
    cls: "bg-muted text-muted-foreground border-border",
  },
};

export function TypeBadge({
  type,
  className,
}: {
  type: ItemType;
  className?: string;
}) {
  const cfg = TYPE_STYLES[type];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        cfg.cls,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}
