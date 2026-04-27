import { Link, useLocation } from "@tanstack/react-router";
import {
  Boxes,
  Cpu,
  GitFork,
  LayoutDashboard,
  Package,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Simulação", icon: LayoutDashboard, exact: true },
  { to: "/itens", label: "Itens", icon: Package, exact: false },
  { to: "/bom", label: "Estrutura BOM", icon: GitFork, exact: false },
  { to: "/estoque", label: "Estoque", icon: Boxes, exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">SIGME</div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/60">
              Manufatura
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">
            Operação
          </div>
          {navItems.map((item) => {
            const isActive = item.exact
              ? path === item.to
              : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-start gap-3 rounded-md bg-sidebar-accent/40 p-3">
            <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
            <div className="text-xs leading-relaxed text-sidebar-foreground/80">
              <div className="font-semibold text-sidebar-foreground">
                Copilot ativo
              </div>
              Pergunte em linguagem natural na tela de simulação.
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/85 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              SIGME · Sistema Integrado de Gestão
            </div>
            <h1 className="font-mono text-sm text-foreground/80">
              <span className="text-muted-foreground">/</span>{" "}
              {currentSection(path)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              Ambiente protótipo · dados em memória
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-mono text-xs font-semibold text-accent-foreground">
              EP
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

function currentSection(path: string): string {
  if (path === "/") return "Simulação de Produção";
  if (path.startsWith("/itens")) return "Cadastro de Itens";
  if (path.startsWith("/bom")) return "Estrutura BOM";
  if (path.startsWith("/estoque")) return "Estoque";
  return path;
}
