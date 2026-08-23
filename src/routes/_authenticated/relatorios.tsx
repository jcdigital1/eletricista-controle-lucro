import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Card3D, SectionTitle } from "@/components/Cards";
import { Logo } from "@/components/Logo";
import { PeriodFilter, type CustomRange } from "@/components/PeriodFilter";
import { inRange, useExpenses, useServices } from "@/lib/data";
import { formatBRL, periodRange, toISODate, type PeriodKey } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Gestão Financeira do Eletricista" },
      {
        name: "description",
        content:
          "Receita total, gastos, lucro líquido, ticket médio e gráfico de receitas x despesas.",
      },
      { property: "og:title", content: "Relatórios financeiros" },
      {
        property: "og:description",
        content: "Analise receitas, despesas e lucro por período.",
      },
    ],
  }),
  component: Relatorios,
});

function Relatorios() {
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const today = toISODate(new Date());
  const [custom, setCustom] = useState<CustomRange>({ from: today, to: today });
  const services = useServices();
  const expenses = useExpenses();
  const range = periodRange(period, custom);

  const data = useMemo(() => {
    const s = (services.data ?? []).filter((r) =>
      inRange(r.service_date, range.from, range.to),
    );
    const e = (expenses.data ?? []).filter((r) =>
      inRange(r.expense_date, range.from, range.to),
    );
    const receita = s.reduce((a, b) => a + b.amount, 0);
    const gastos = e.reduce((a, b) => a + b.amount, 0);
    const group = (rows: { category: string; amount: number }[]) => {
      const m = new Map<string, number>();
      rows.forEach((r) => m.set(r.category, (m.get(r.category) ?? 0) + r.amount));
      return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    };
    return {
      receita,
      gastos,
      lucro: receita - gastos,
      qtd: s.length,
      ticket: s.length ? receita / s.length : 0,
      topServices: group(s),
      topExpenses: group(e),
    };
  }, [services.data, expenses.data, range.from, range.to]);

  const chart = [
    { name: "Receitas", valor: data.receita, fill: "var(--color-chart-1)" },
    { name: "Despesas", valor: data.gastos, fill: "var(--color-chart-2)" },
    { name: "Lucro", valor: data.lucro, fill: "var(--color-chart-3)" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Logo className="w-36" />
      </div>
      <SectionTitle>Relatórios</SectionTitle>
      <PeriodFilter
        value={period}
        onChange={setPeriod}
        custom={custom}
        onCustomChange={setCustom}
      />

      <div className="grid grid-cols-2 gap-3">
        <Card3D>
          <p className="text-xs text-muted-foreground">Receita total</p>
          <p className="mt-1 text-lg font-extrabold text-success">
            {formatBRL(data.receita)}
          </p>
        </Card3D>
        <Card3D delay={40}>
          <p className="text-xs text-muted-foreground">Total de gastos</p>
          <p className="mt-1 text-lg font-extrabold text-destructive">
            {formatBRL(data.gastos)}
          </p>
        </Card3D>
        <Card3D delay={80}>
          <p className="text-xs text-muted-foreground">Lucro líquido</p>
          <p className="mt-1 text-lg font-extrabold text-primary">
            {formatBRL(data.lucro)}
          </p>
        </Card3D>
        <Card3D delay={120}>
          <p className="text-xs text-muted-foreground">Ticket médio</p>
          <p className="mt-1 text-lg font-extrabold">{formatBRL(data.ticket)}</p>
        </Card3D>
      </div>

      <Card3D delay={80} className="p-4">
        <p className="text-sm font-bold">Receitas x Despesas</p>
        <p className="text-xs text-muted-foreground">
          {data.qtd} serviço(s) no período
        </p>
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 16,
                  color: "var(--color-foreground)",
                }}
                formatter={(v: number) => formatBRL(v)}
              />
              <Bar dataKey="valor" radius={[10, 10, 6, 6]}>
                {chart.map((c) => (
                  <Cell key={c.name} fill={c.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card3D>

      <Card3D delay={120} className="p-4">
        <p className="text-sm font-bold">Principais tipos de serviço</p>
        <TopList items={data.topServices} tone="success" />
      </Card3D>

      <Card3D delay={160} className="p-4">
        <p className="text-sm font-bold">Principais categorias de gastos</p>
        <TopList items={data.topExpenses} tone="destructive" />
      </Card3D>
    </div>
  );
}

function TopList({
  items,
  tone,
}: {
  items: [string, number][];
  tone: "success" | "destructive";
}) {
  if (items.length === 0)
    return <p className="mt-2 text-xs text-muted-foreground">Sem dados no período.</p>;
  return (
    <div className="mt-3 space-y-2">
      {items.map(([name, value]) => (
        <div key={name} className="flex justify-between gap-3 text-xs">
          <span className="min-w-0 truncate text-muted-foreground">{name}</span>
          <span
            className={
              tone === "success"
                ? "shrink-0 font-bold text-success"
                : "shrink-0 font-bold text-destructive"
            }
          >
            {formatBRL(value)}
          </span>
        </div>
      ))}
    </div>
  );
}
