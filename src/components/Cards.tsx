import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card3D({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("card-3d animate-rise rounded-3xl p-4", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <h2 className="truncate text-lg font-bold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function GoldButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "gold-surface tap flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-extrabold uppercase tracking-wide text-primary-foreground disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "tap flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-5 py-4 text-base font-bold text-foreground disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}
