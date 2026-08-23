import { LOGO_URL } from "@/lib/finance";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={LOGO_URL}
      alt="Logomarca da empresa"
      className={cn("h-auto w-full max-w-full object-contain", className)}
      loading="eager"
      decoding="async"
    />
  );
}
