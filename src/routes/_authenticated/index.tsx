import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, Plus, Users, History, BarChart3, Target } from "lucide-react";
import { Card3D, GhostButton, GoldButton, SectionTitle } from "@/components/Cards";
import { PeriodFilter, type CustomRange } from "@/components/PeriodFilter";
import { useQuickAdd } from "@/components/AppShell";
import { useExpenses, useProfile, useServices, inRange } from "@/lib/data";
import { formatBRL, periodRange, toISODate, type PeriodKey } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Painel — Gestão Financeira do Eletricista" },
      {
        name: "description",
        content:
          "Veja quanto você recebeu, quanto gastou e quanto realmente lucrou no período.",
      },
      { property: "og:title", content: "Painel — Gestão Financeira do Eletricista" },
      {
        property: "og:description",
        content: "Receitas, gastos e lucro do eletricista em tempo real.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const today = toISODate(new Date());
  const [custom, setCustom] = useState<CustomRange>({ from: today, to: today });
  const { newService, newExpense } = useQuickAdd();
  const services = useServices();
  const expenses = useExpenses();
  const profile = useProfile();

  const range = periodRange(period, custom);

  const totals = useMemo(() => {
    const s = (services.data ?? []).filter((r) =>
      inRange(r.service_date, range.from, range.to),
    );
    const e = (expenses.data ?? []).filter((r) =>
      inRange(r.expense_date, range.from, range.to),
    );
    const receita = s.reduce((a, b) => a + b.amount, 0);
    const gastos = e.reduce((a, b) => a + b.amount, 0);
    return { receita, gastos, lucro: receita - gastos, qtd: s.length };
  }, [services.data, expenses.data, range.from, range.to]);

  const day = useMemo(() => {
    const s = (services.data ?? []).filter((r) => r.service_date === today);
    const e = (expenses.data ?? []).filter((r) => r.expense_date === today);
    const receita = s.reduce((a, b) => a + b.amount, 0);
    const gastos = e.reduce((a, b) => a + b.amount, 0);
    return { qtd: s.length, receita, gastos, lucro: receita - gastos };
  }, [services.data, expenses.data, today]);

  const monthRange = periodRange("mes");
  const faturadoMes = (services.data ?? [])
    .filter((r) => inRange(r.service_date, monthRange.from, monthRange.to))
    .reduce((a, b) => a + b.amount, 0);
  const meta = profile.data?.monthly_goal ?? 0;
  const pct = meta > 0 ? Math.min(100, Math.round((faturadoMes / meta) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="animate-rise">
        <p className="text-2xl font-extrabold tracking-tight">Olá! 👋</p>
        <p className="text-sm text-muted-foreground">
          {profile.data?.full_name || "Bem-vindo de volta"}
        </p>
      </div>

      <PeriodFilter
        value={period}
        onChange={setPeriod}
        custom={custom}
        onCustomChange={setCustom}
      />

      <Card3D className="relative overflow-hidden p-5" delay={40}>
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <p className="relative text-sm font-bold uppercase tracking-wide text-primary">
          ⚡ Seu negócio hoje
        </p>
        <div className="relative mt-4 grid grid-cols-2 gap-3">
          <MiniStat label="Entrou" value={formatBRL(day.receita)} tone="success" />
          <MiniStat label="Saiu" value={formatBRL(day.gastos)} tone="destructive" />
        </div>
        <div className="relative mt-4 rounded-2xl border border-border bg-background/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sobrou
          </p>
          <p className="mt-1 text-4xl font-black tracking-tight text-primary">
            {formatBRL(day.lucro)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {day.qtd} serviço(s) realizados hoje
          </p>
        </div>
      </Card3D>

      <SectionTitle>Resumo Financeiro</SectionTitle>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Card3D delay={60}>
            <p className="text-xs font-semibold text-muted-foreground">💰 Receitas</p>
            <p className="mt-1 text-xl font-extrabold text-success">
              {formatBRL(totals.receita)}
            </p>
          </Card3D>
          <Card3D delay={100}>
            <p className="text-xs font-semibold text-muted-foreground">💸 Gastos</p>
            <p className="mt-1 text-xl font-extrabold text-destructive">
              {formatBRL(totals.gastos)}
            </p>
          </Card3D>
        </div>
        <Card3D delay={140} className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            📈 Lucro do período
          </p>
          <p className="mt-1 text-3xl font-black text-primary">
            {formatBRL(totals.lucro)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {totals.qtd} serviço(s) no período
          </p>
        </Card3D>
      </div>

      <div className="grid gap-3">
        <GoldButton onClick={() => newService()}>
          <Plus className="h-5 w-5" /> Adicionar Serviço
        </GoldButton>
        <GhostButton onClick={() => newExpense()}>
          <Minus className="h-5 w-5" /> Adicionar Gasto
        </GhostButton>
      </div>

      <Card3D delay={60} className="p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <p className="flex min-w-0 items-center gap-2 text-sm font-bold">
            <Target className="h-5 w-5 shrink-0 text-primary" /> Meta do mês
          </p>
          <Link to="/perfil" className="text-xs font-semibold text-primary">
            Editar
          </Link>
        </div>
        <p className="mt-3 text-2xl font-extrabold">
          {formatBRL(faturadoMes)}{" "}
          <span className="text-sm font-medium text-muted-foreground">
            de {formatBRL(meta)}
          </span>
        </p>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="gold-surface h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {meta > 0 ? `${pct}% da meta atingida` : "Defina sua meta no perfil"}
        </p>
      </Card3D>

      <SectionTitle>Atalhos</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <Shortcut to="/clientes" icon={Users} label="Clientes" />
        <Shortcut to="/historico" icon={History} label="Histórico" />
        <Shortcut to="/relatorios" icon={BarChart3} label="Relatórios" />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "destructive";
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          tone === "success"
            ? "mt-1 text-lg font-extrabold text-success"
            : "mt-1 text-lg font-extrabold text-destructive"
        }
      >
        {value}
      </p>
    </div>
  );
}

function Shortcut({
  to,
  icon: Icon,
  label,
}: {
  to: string;
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
