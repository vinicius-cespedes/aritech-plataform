"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/primitives";

const NAV_SECTIONS: Array<{ title: string; items: Array<{ href: string; label: string }> }> = [
  {
    title: "Visão geral",
    items: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    title: "Cadastros",
    items: [
      { href: "/cadastros/fornecedores", label: "Fornecedores" },
      { href: "/cadastros/clientes", label: "Clientes" },
      { href: "/cadastros/colaboradores", label: "Colaboradores" },
      { href: "/cadastros/contas-financeiras", label: "Contas financeiras" },
      { href: "/cadastros/plano-de-contas", label: "Plano de contas" },
      { href: "/cadastros/contratos", label: "Contratos" },
      { href: "/cadastros/centros-de-custo", label: "Centros de custo" },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { href: "/financeiro/contas-a-pagar", label: "Contas a pagar" },
      { href: "/financeiro/contas-a-receber", label: "Contas a receber" },
      { href: "/financeiro/conciliacao", label: "Conciliação bancária" },
      { href: "/financeiro/fluxo-de-caixa", label: "Fluxo de caixa" },
      { href: "/financeiro/fechamento", label: "Fechamento de período" },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    // Senha padrão do seed (ou qualquer troca ainda pendente) — força a
    // troca antes de liberar o resto do sistema, em vez de deixar a flag
    // mustChangePassword parada sem nenhum jeito de agir sobre ela.
    if (!loading && user?.mustChangePassword && pathname !== "/alterar-senha") {
      router.replace("/alterar-senha");
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Carregando…</div>;
  }

  if (user.mustChangePassword) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6">
        <div className="mb-6 px-2">
          <p className="text-base font-semibold text-slate-900">Aritech Digital</p>
          <p className="text-xs text-slate-500">Núcleo financeiro</p>
        </div>
        <nav className="space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{section.title}</p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "block rounded-md px-2 py-1.5 text-sm",
                      pathname?.startsWith(item.href)
                        ? "bg-brand-50 font-medium text-brand-700"
                        : "text-slate-600 hover:bg-slate-100",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.name}</span>
            <Button
              variant="ghost"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              Sair
            </Button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
