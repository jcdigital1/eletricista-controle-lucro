import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, SelectInput, TextArea, TextInput } from "@/components/Field";
import { GoldButton } from "@/components/Cards";
import {
  PAYMENT_METHODS,
  SERVICE_CATEGORIES,
  parseAmount,
  toISODate,
} from "@/lib/finance";
import { useSaveRow, type ServiceRow } from "@/lib/data";

export type ServiceDraft = Partial<ServiceRow> | null;

export function ServiceSheet({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: ServiceDraft;
}) {
  const save = useSaveRow<Record<string, unknown>>("services");
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    category: SERVICE_CATEGORIES[0] as string,
    description: "",
    amount: "",
    payment_method: PAYMENT_METHODS[0] as string,
    service_date: toISODate(new Date()),
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      client_name: editing?.client_name ?? "",
      client_phone: editing?.client_phone ?? "",
      category: editing?.category ?? SERVICE_CATEGORIES[0],
      description: editing?.description ?? "",
      amount: editing?.amount ? String(editing.amount).replace(".", ",") : "",
      payment_method: editing?.payment_method ?? PAYMENT_METHODS[0],
      service_date: editing?.service_date ?? toISODate(new Date()),
      notes: editing?.notes ?? "",
    });
  }, [open, editing]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseAmount(form.amount);
    if (!form.client_name.trim()) return toast.error("Informe o nome do cliente");
    if (amount <= 0) return toast.error("Informe o valor do serviço");
    try {
      await save.mutateAsync({
        id: editing?.id,
        values: { ...form, amount },
      });
      toast.success(editing?.id ? "Serviço atualizado" : "Serviço salvo!");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-[2rem] border-border bg-card px-5 pb-10"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="text-2xl font-extrabold">
            {editing?.id ? "Editar Serviço" : "Novo Serviço"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <Field label="Cliente">
            <TextInput
              value={form.client_name}
              onChange={(e) => set("client_name", e.target.value)}
              maxLength={120}
              placeholder="Nome do cliente"
            />
          </Field>
          <Field label="Telefone">
            <TextInput
              value={form.client_phone}
              onChange={(e) => set("client_phone", e.target.value)}
              inputMode="tel"
              maxLength={30}
              placeholder="(00) 00000-0000"
            />
          </Field>
          <Field label="Descrição do serviço">
            <SelectInput
              options={SERVICE_CATEGORIES}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </Field>
          <Field label="Detalhes">
            <TextInput
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={200}
              placeholder="Ex.: troca de 3 tomadas na cozinha"
            />
          </Field>
          <Field label="Valor do serviço — R$">
            <TextInput
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
            />
          </Field>
          <Field label="Forma de pagamento">
            <SelectInput
              options={PAYMENT_METHODS}
              value={form.payment_method}
              onChange={(e) => set("payment_method", e.target.value)}
            />
          </Field>
          <Field label="Data do serviço">
            <TextInput
              type="date"
              value={form.service_date}
              onChange={(e) => set("service_date", e.target.value)}
            />
          </Field>
          <Field label="Observações">
            <TextArea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              maxLength={500}
            />
          </Field>
          <GoldButton type="submit" disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar serviço"}
          </GoldButton>
        </form>
      </SheetContent>
    </Sheet>
  );
}
