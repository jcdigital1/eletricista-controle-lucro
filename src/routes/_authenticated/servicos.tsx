import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card3D, GoldButton, SectionTitle } from "@/components/Cards";
import { EntryCard, type Entry } from "@/components/EntryCard";
import { PeriodFilter, type CustomRange } from "@/components/PeriodFilter";
import { useQuickAdd } from "@/components/AppShell";
import { inRange, useServices } from "@/lib/data";
import { formatBRL, periodRange, toISODate, type PeriodKey } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Gestão Financeira do Eletricista" },
      {
        name: "description",
        content: "Lista de serviços realizados, valores recebidos e clientes atendidos.",
      },
      { property: "og:title", content: "Serviços realizados" },
      {
        property: "og:description",
        content: "Acompanhe todos os serviços elétricos e o valor recebido.",
      },
    ],
  }),
  component: Servicos,
});

function Servicos() {
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const today = toISODate(new Date());
  const [custom, setCustom] = useState<CustomRange>({ from: today, to: today });
  const services = useServices();
  const { newService } = useQuickAdd();
  const range = periodRange(period, custom);

  const rows = useMemo(
    () =>
      (services.data ?? []).filter((r) => inRange(r.service_date, range.from, range.to)),
    [services.data, range.from, range.to],
  );
  const total = rows.reduce((a, b) => a + b.amount, 0);

  const entries: Entry[] = rows.map((r) => ({
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

  return (
    <div className="space-y-4">
      <SectionTitle>Serviços</SectionTitle>
      <PeriodFilter
        value={period}
        onChange={setPeriod}
        custom={custom}
        onCustomChange={setCustom}
      />
      <Card3D className="p-4">
        <p className="text-xs text-muted-foreground">
          {rows.length} serviço(s) no período
        </p>
        <p className="mt-1 text-2xl font-black text-success">{formatBRL(total)}</p>
      </Card3D>
      <GoldButton onClick={() => newService()}>
        <Plus className="h-5 w-5" /> Adicionar Serviço
      </GoldButton>
      {entries.length === 0 && (
        <Card3D className="p-6 text-center text-sm text-muted-foreground">
          Nenhum serviço lançado neste período.
        </Card3D>
      )}
      <div className="space-y-3">
        {entries.map((e, i) => (
          <EntryCard
            key={e.id}
            entry={e}
            delay={Math.min(i * 40, 240)}
            onEdit={() => {
              const row = rows.find((r) => r.id === e.id);
              if (row) newService(row);
            }}
          />
        ))}
      </div>
    </div>
  );
}
