import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const base =
  "w-full rounded-2xl border border-input bg-secondary/70 px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-ring";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(base, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(base, "min-h-24", props.className)} />;
}

export function SelectInput({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }) {
  return (
    <select {...props} className={cn(base, "appearance-none", props.className)}>
      {options.map((o) => (
        <option key={o} value={o} className="bg-card text-foreground">
          {o}
        </option>
      ))}
    </select>
  );
}
