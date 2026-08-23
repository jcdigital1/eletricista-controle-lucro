import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card3D, GhostButton, GoldButton, SectionTitle } from "@/components/Cards";
import { Field, TextArea, TextInput } from "@/components/Field";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useClients, useSaveRow, useServices, type ClientRow } from "@/lib/data";
import { formatBRL, formatDateBR } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Gestão Financeira do Eletricista" },
      {
        name: "description",
        content: "Cadastro de clientes com telefone, endereço e histórico de serviços.",
      },
      { property: "og:title", content: "Seus clientes" },
      {
        property: "og:description",
        content: "Veja quanto cada cliente já gerou de faturamento.",
      },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const clients = useClients();
  const services = useServices();
  const save = useSaveRow<Record<string, unknown>>("clients");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });

  const stats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const s of services.data ?? []) {
      const key = s.client_name.trim().toLowerCase();
      const cur = map.get(key) ?? { count: 0, total: 0 };
      map.set(key, { count: cur.count + 1, total: cur.total + s.amount });
    }
    return map;
  }, [services.data]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    try {
      await save.mutateAsync({ values: { ...form } });
      toast.success("Cliente salvo!");
      setForm({ name: "", phone: "", address: "", notes: "" });
      setOpen(false);
    } catch {
      toast.error("Não foi possível salvar");
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Clientes</SectionTitle>
      <GoldButton onClick={() => setOpen(true)}>
        <Plus className="h-5 w-5" /> Novo cliente
      </GoldButton>

      {(clients.data ?? []).length === 0 && (
        <Card3D className="p-6 text-center text-sm text-muted-foreground">
          Nenhum cliente cadastrado ainda.
        </Card3D>
      )}

      <div className="space-y-3">
        {(clients.data ?? []).map((c: ClientRow, i) => {
          const st = stats.get(c.name.trim().toLowerCase()) ?? { count: 0, total: 0 };
          const history = (services.data ?? []).filter(
            (s) => s.client_name.trim().toLowerCase() === c.name.trim().toLowerCase(),
          );
          return (
            <Card3D key={c.id} delay={Math.min(i * 40, 200)} className="p-4">
              <button
                className="w-full text-left"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{c.name}</p>
                    {c.phone && (
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> {c.phone}
                      </p>
                    )}
                    {c.address && (
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {c.address}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-extrabold text-primary">
                      {formatBRL(st.total)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {st.count} serviço(s)
                    </p>
                  </div>
                </div>
              </button>
              {expanded === c.id && (
                <div className="animate-rise mt-3 space-y-2 border-t border-border pt-3">
                  {c.notes && (
                    <p className="text-xs text-muted-foreground">{c.notes}</p>
                  )}
                  {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Nenhum serviço registrado para este cliente.
                    </p>
                  ) : (
                    history.map((s) => (
                      <div key={s.id} className="flex justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate">
                          {s.category} · {formatDateBR(s.service_date)}
                        </span>
                        <span className="shrink-0 font-bold text-success">
                          {formatBRL(s.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card3D>
          );
        })}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto rounded-t-[2rem] border-border bg-card px-5 pb-10"
        >
          <SheetHeader className="px-0">
            <SheetTitle className="text-2xl font-extrabold">Novo Cliente</SheetTitle>
          </SheetHeader>
          <form onSubmit={submit} className="space-y-4 pt-2">
            <Field label="Nome">
              <TextInput
                value={form.name}
                maxLength={120}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Telefone">
              <TextInput
                value={form.phone}
                maxLength={30}
                inputMode="tel"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Endereço">
              <TextInput
                value={form.address}
                maxLength={200}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <Field label="Observações">
              <TextArea
                value={form.notes}
                maxLength={500}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
            <GoldButton type="submit" disabled={save.isPending}>
              Salvar cliente
            </GoldButton>
            <GhostButton type="button" onClick={() => setOpen(false)}>
              Cancelar
            </GhostButton>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
