import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, SelectInput, TextArea, TextInput } from "@/components/Field";
import { GoldButton } from "@/components/Cards";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  parseAmount,
  toISODate,
} from "@/lib/finance";
import { useSaveRow, type ExpenseRow } from "@/lib/data";

export type ExpenseDraft = Partial<ExpenseRow> | null;

export function ExpenseSheet({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: ExpenseDraft;
}) {
  const save = useSaveRow<Record<string, unknown>>("expenses");
  const [form, setForm] = useState({
    description: "",
    category: EXPENSE_CATEGORIES[0] as string,
    amount: "",
    expense_date: toISODate(new Date()),
    payment_method: PAYMENT_METHODS[0] as string,
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      description: editing?.description ?? "",
      category: editing?.category ?? EXPENSE_CATEGORIES[0],
      amount: editing?.amount ? String(editing.amount).replace(".", ",") : "",
      expense_date: editing?.expense_date ?? toISODate(new Date()),
      payment_method: editing?.payment_method ?? PAYMENT_METHODS[0],
      notes: editing?.notes ?? "",
    });
  }, [open, editing]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseAmount(form.amount);
    if (amount <= 0) {
      toast.error("Informe o valor do gasto");
      return;
    }
    try {
      await save.mutateAsync({ id: editing?.id, values: { ...form, amount } });
      toast.success(editing?.id ? "Gasto atualizado" : "Gasto salvo!");
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
            {editing?.id ? "Editar Gasto" : "Novo Gasto"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <Field label="Descrição">
            <TextInput
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={200}
              placeholder="Ex.: cabo flexível 2,5mm"
            />
          </Field>
          <Field label="Categoria">
            <SelectInput
              options={EXPENSE_CATEGORIES}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </Field>
          <Field label="Valor gasto — R$">
            <TextInput
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
            />
          </Field>
          <Field label="Data">
            <TextInput
              type="date"
              value={form.expense_date}
              onChange={(e) => set("expense_date", e.target.value)}
            />
          </Field>
          <Field label="Forma de pagamento">
            <SelectInput
              options={PAYMENT_METHODS}
              value={form.payment_method}
              onChange={(e) => set("payment_method", e.target.value)}
            />
          </Field>
          <Field label="Observação">
            <TextArea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              maxLength={500}
            />
          </Field>
          <GoldButton type="submit" disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar gasto"}
          </GoldButton>
        </form>
      </SheetContent>
    </Sheet>
  );
}
