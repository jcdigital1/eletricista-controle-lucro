import { useState } from "react";
import { PERIOD_LABELS, type PeriodKey } from "@/lib/finance";
import { TextInput } from "@/components/Field";
import { cn } from "@/lib/utils";

export type CustomRange = { from: string; to: string };

export function PeriodFilter({
  value,
  onChange,
  custom,
  onCustomChange,
}: {
  value: PeriodKey;
  onChange: (v: PeriodKey) => void;
  custom: CustomRange;
  onCustomChange: (v: CustomRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const keys: PeriodKey[] = ["hoje", "7dias", "mes", "ano", "custom"];

  return (
    <div className="space-y-3">
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => {
              onChange(k);
              setOpen(k === "custom");
            }}
            className={cn(
              "tap shrink-0 rounded-full px-4 py-2 text-sm font-bold",
              value === k
                ? "gold-surface text-primary-foreground"
                : "border border-border bg-secondary text-muted-foreground",
            )}
          >
            {PERIOD_LABELS[k]}
          </button>
        ))}
      </div>
      {value === "custom" && open && (
        <div className="card-3d animate-rise grid grid-cols-2 gap-3 rounded-2xl p-3">
          <TextInput
            type="date"
            value={custom.from}
            onChange={(e) => onCustomChange({ ...custom, from: e.target.value })}
          />
          <TextInput
            type="date"
            value={custom.to}
            onChange={(e) => onCustomChange({ ...custom, to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
