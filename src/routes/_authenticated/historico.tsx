import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card3D, SectionTitle } from "@/components/Cards";
import { EntryCard, type Entry } from "@/components/EntryCard";
import { useQuickAdd } from "@/components/AppShell";
import { useExpenses, useServices } from "@/lib/data";
import { formatBRL } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — Gestão Financeira do Eletricista" },
      {
        name: "description",
        content: "Todos os serviços e gastos lançados, com edição e exclusão.",
      },
      { property: "og:title", content: "Histórico de serviços e gastos" },
      {
        property: "og:description",
        content: "Consulte, edite ou exclua seus lançamentos financeiros.",
      },
    ],
  }),
  component: Historico,
});

type Tab = "todos" | "servicos" | "gastos";

function Historico() {
  const [tab, setTab] = useState<Tab>("todos");
  const services = useServices();
  const expenses = useExpenses();
  const { newService, newExpense } = useQuickAdd();

  const entries = useMemo<Entry[]>(() => {
    const s: Entry[] = (services.data ?? []).map((r) => ({
      id: r.id,
      kind: "service",
      title: r.category,
      subtitle: r.client_name ? `Cliente: ${r.client_name}` : r.description,
      date: r.service_date,
      amount: r.amount,
      details: [
        { label: "Descrição", value: r.description },
        { label: "Telefone", value: r.client_phone },
        { label: "Pagamento", value: r.payment_method },
        { label: "Observações", value: r.notes },
      ],
    }));
    const e: Entry[] = (expenses.data ?? []).map((r) => ({
      id: r.id,
      kind: "expense",
      title: r.category,
      subtitle: r.description,
      date: r.expense_date,
      amount: r.amount,
      details: [
        { label: "Pagamento", value: r.payment_method },
        { label: "Observação", value: r.notes },
      ],
    }));
    const all = tab === "servicos" ? s : tab === "gastos" ? e : [...s, ...e];
    return all.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [services.data, expenses.data, tab]);

  const total = entries.reduce(
    (a, b) => a + (b.kind === "service" ? b.amount : -b.amount),
    0,
  );

  return (
    <div className="space-y-4">
      <SectionTitle>Histórico</SectionTitle>

      <div className="flex gap-2">
        {(["todos", "servicos", "gastos"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "tap flex-1 rounded-full px-3 py-2 text-sm font-bold capitalize",
              tab === t
                ? "gold-surface text-primary-foreground"
                : "border border-border bg-secondary text-muted-foreground",
            )}
          >
            {t === "servicos" ? "Serviços" : t}
          </button>
        ))}
      </div>

      <Card3D className="p-4">
        <p className="text-xs text-muted-foreground">Saldo dos lançamentos exibidos</p>
        <p className="mt-1 text-2xl font-black text-primary">{formatBRL(total)}</p>
      </Card3D>

      {entries.length === 0 && (
        <Card3D className="p-6 text-center text-sm text-muted-foreground">
          Nenhum lançamento por aqui ainda.
        </Card3D>
      )}

      <div className="space-y-3">
        {entries.map((e, i) => (
          <EntryCard
            key={`${e.kind}-${e.id}`}
            entry={e}
            delay={Math.min(i * 40, 240)}
            onEdit={() => {
              if (e.kind === "service") {
                const row = (services.data ?? []).find((r) => r.id === e.id);
                if (row) newService(row);
              } else {
                const row = (expenses.data ?? []).find((r) => r.id === e.id);
                if (row) newExpense(row);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
