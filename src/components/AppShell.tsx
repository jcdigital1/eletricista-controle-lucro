import { createContext, useContext, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Zap, Plus, Wallet, User, Minus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ServiceSheet, type ServiceDraft } from "@/components/ServiceSheet";
import { ExpenseSheet, type ExpenseDraft } from "@/components/ExpenseSheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GhostButton, GoldButton } from "@/components/Cards";
import { cn } from "@/lib/utils";

type QuickAdd = {
  newService: (draft?: ServiceDraft) => void;
  newExpense: (draft?: ExpenseDraft) => void;
};

const QuickAddContext = createContext<QuickAdd>({
  newService: () => {},
  newExpense: () => {},
});

export const useQuickAdd = () => useContext(QuickAddContext);

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/servicos", label: "Serviços", icon: Zap },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [serviceOpen, setServiceOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [chooser, setChooser] = useState(false);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(null);
  const [expenseDraft, setExpenseDraft] = useState<ExpenseDraft>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const api: QuickAdd = {
    newService: (draft) => {
      setServiceDraft(draft ?? null);
      setServiceOpen(true);
    },
    newExpense: (draft) => {
      setExpenseDraft(draft ?? null);
      setExpenseOpen(true);
    },
  };

  return (
    <QuickAddContext.Provider value={api}>
      <div className="relative min-h-screen bg-background">
        <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-72" />

        <header className="glass sticky top-0 z-30 flex items-center justify-center border-x-0 border-t-0 px-4 py-3">
          <Link to="/" className="tap block w-40">
            <Logo />
          </Link>
        </header>

        <main className="relative mx-auto w-full max-w-xl px-4 pb-36 pt-4">
          {children}
        </main>

        <nav className="glass fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-xl items-end justify-around rounded-t-[1.75rem] px-2 pb-6 pt-2">
          {NAV.slice(0, 2).map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}
          <button
            aria-label="Adicionar lançamento"
            onClick={() => setChooser(true)}
            className="gold-surface tap -mt-8 grid h-16 w-16 shrink-0 place-items-center rounded-full text-primary-foreground"
          >
            <Plus className="h-8 w-8" strokeWidth={3} />
          </button>
          {NAV.slice(2).map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}
        </nav>

        <Sheet open={chooser} onOpenChange={setChooser}>
          <SheetContent
            side="bottom"
            className="rounded-t-[2rem] border-border bg-card px-5 pb-10"
          >
            <SheetHeader className="px-0">
              <SheetTitle className="text-xl font-extrabold">
                O que você quer lançar?
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-3 pt-2">
              <GoldButton
                onClick={() => {
                  setChooser(false);
                  api.newService();
                }}
              >
                <Plus className="h-5 w-5" /> Adicionar Serviço
              </GoldButton>
              <GhostButton
                onClick={() => {
                  setChooser(false);
                  api.newExpense();
                }}
              >
                <Minus className="h-5 w-5" /> Adicionar Gasto
              </GhostButton>
            </div>
          </SheetContent>
        </Sheet>

        <ServiceSheet
          open={serviceOpen}
          onOpenChange={setServiceOpen}
          editing={serviceDraft}
        />
        <ExpenseSheet
          open={expenseOpen}
          onOpenChange={setExpenseOpen}
          editing={expenseDraft}
        />
      </div>
    </QuickAddContext.Provider>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "tap flex w-16 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="h-6 w-6" strokeWidth={active ? 2.6 : 2} />
      {label}
    </Link>
  );
}
