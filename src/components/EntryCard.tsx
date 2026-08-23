import { useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card3D } from "@/components/Cards";
import { formatBRL, formatDateBR } from "@/lib/finance";
import { useDeleteRow } from "@/lib/data";

export type Entry = {
  id: string;
  kind: "service" | "expense";
  title: string;
  subtitle: string;
  date: string;
  amount: number;
  details: { label: string; value: string }[];
};

export function EntryCard({
  entry,
  onEdit,
  delay = 0,
}: {
  entry: Entry;
  onEdit: () => void;
  delay?: number;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const del = useDeleteRow(entry.kind === "service" ? "services" : "expenses");
  const positive = entry.kind === "service";

  return (
    <Card3D delay={delay} className="p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">
            {positive ? "⚡ " : "🧰 "}
            {entry.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">{entry.subtitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateBR(entry.date)}
          </p>
        </div>
        <p
          className={
            positive
              ? "shrink-0 text-base font-extrabold text-success"
              : "shrink-0 text-base font-extrabold text-destructive"
          }
        >
          {positive ? "+ " : "− "}
          {formatBRL(entry.amount)}
        </p>
      </button>

      {open && (
        <div className="animate-rise mt-3 space-y-2 border-t border-border pt-3">
          {entry.details
            .filter((d) => d.value)
            .map((d) => (
              <div key={d.label} className="flex justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="text-right font-semibold">{d.value}</span>
              </div>
            ))}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onEdit}
              className="tap flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-xs font-bold"
            >
              <Pencil className="h-4 w-4" /> Editar
            </button>
            <button
              onClick={() => setConfirm(true)}
              className="tap flex flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/15 py-2.5 text-xs font-bold text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </button>
          </div>
        </div>
      )}

      {!open && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Eye className="h-3.5 w-3.5" /> Toque para ver, editar ou excluir
        </p>
      )}

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="rounded-3xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground"
              onClick={async () => {
                try {
                  await del.mutateAsync(entry.id);
                  toast.success("Lançamento excluído");
                } catch {
                  toast.error("Não foi possível excluir");
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card3D>
  );
}
