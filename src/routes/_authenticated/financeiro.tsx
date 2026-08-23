import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, Plus, History, BarChart3, Users } from "lucide-react";
import { Card3D, GhostButton, GoldButton, SectionTitle } from "@/components/Cards";
import { PeriodFilter, type CustomRange } from "@/components/PeriodFilter";
import { useQuickAdd } from "@/components/AppShell";
import { inRange, useExpenses, useServices } from "@/lib/data";
import { formatBRL, periodRange, toISODate, type PeriodKey } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Gestão Financeira do Eletricista" },
      {
        name: "description",
        content: "Entradas, saídas e lucro do período, com atalhos para relatórios.",
      },
      { property: "og:title", content: "Controle financeiro" },
      {
        property: "og:description",
        content: "Quanto entrou, quanto saiu e quanto sobrou no seu bolso.",
      },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const today = toISODate(new Date());
  const [custom, setCustom] = useState<CustomRange>({ from: today, to: today });
  const services = useServices();
  const expenses = useExpenses();
  const { newService, newExpense } = useQuickAdd();
  const range = periodRange(period, custom);

  const t = useMemo(() => {
    const receita = (services.data ?? [])
      .filter((r) => inRange(r.service_date, range.from, range.to))
      .reduce((a, b) => a + b.amount, 0);
    const gastos = (expenses.data ?? [])
      .filter((r) => inRange(r.expense_date, range.from, range.to))
      .reduce((a, b) => a + b.amount, 0);
    return { receita, gastos, lucro: receita - gastos };
  }, [services.data, expenses.data, range.from, range.to]);

  return (
    <div className="space-y-4">
      <SectionTitle>Financeiro</SectionTitle>
      <PeriodFilter
        value={period}
        onChange={setPeriod}
        custom={custom}
        onCustomChange={setCustom}
      />

      <Card3D className="relative overflow-hidden p-5">
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Entrou</p>
            <p className="mt-1 text-lg font-extrabold text-success">
              {formatBRL(t.receita)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">Saiu</p>
            <p className="mt-1 text-lg font-extrabold text-destructive">
              {formatBRL(t.gastos)}
            </p>
          </div>
        </div>
        <div className="relative mt-3 rounded-2xl border border-border bg-background/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Sobrou</p>
          <p className="mt-1 text-4xl font-black text-primary">{formatBRL(t.lucro)}</p>
        </div>
      </Card3D>

      <div className="grid gap-3">
        <GoldButton onClick={() => newService()}>
          <Plus className="h-5 w-5" /> Adicionar Serviço
        </GoldButton>
        <GhostButton onClick={() => newExpense()}>
          <Minus className="h-5 w-5" /> Adicionar Gasto
        </GhostButton>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Hub to="/historico" icon={History} label="Histórico" />
        <Hub to="/relatorios" icon={BarChart3} label="Relatórios" />
        <Hub to="/clientes" icon={Users} label="Clientes" />
      </div>
    </div>
  );
}

function Hub({
  to,
  icon: Icon,
  label,
}: {
  to: "/historico" | "/relatorios" | "/clientes";
  icon: typeof Users;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="card-3d tap flex flex-col items-center gap-2 rounded-3xl px-2 py-4 text-xs font-bold"
    >
      <Icon className="h-6 w-6 text-primary" />
      {label}
    </Link>
  );
}
