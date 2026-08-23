export const LOGO_URL = "https://i.postimg.cc/x1pj5JCs/Design-sem-nome.png";

export const SERVICE_CATEGORIES = [
  "Instalação elétrica",
  "Manutenção elétrica",
  "Troca de tomada",
  "Instalação de chuveiro",
  "Instalação de luminária",
  "Instalação de ventilador",
  "Troca de disjuntor",
  "Instalação de quadro elétrico",
  "Padrão de energia",
  "Manutenção residencial",
  "Manutenção comercial",
  "Outros",
] as const;

export const EXPENSE_CATEGORIES = [
  "Material elétrico",
  "Combustível",
  "Alimentação",
  "Ferramentas",
  "Transporte",
  "Manutenção de ferramentas",
  "Compra de equipamentos",
  "Outros",
] as const;

export const PAYMENT_METHODS = [
  "Pix",
  "Dinheiro",
  "Cartão",
  "Transferência",
  "Outro",
] as const;

export type PeriodKey = "hoje" | "7dias" | "mes" | "ano" | "custom";

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  hoje: "Hoje",
  "7dias": "7 dias",
  mes: "Mês",
  ano: "Ano",
  custom: "Personalizado",
};

export function toISODate(d: Date) {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}

export function periodRange(
  key: PeriodKey,
  custom?: { from: string; to: string },
): { from: string; to: string } {
  const now = new Date();
  const today = toISODate(now);
  switch (key) {
    case "hoje":
      return { from: today, to: today };
    case "7dias": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { from: toISODate(d), to: today };
    }
    case "mes": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toISODate(d), to: today };
    }
    case "ano": {
      const d = new Date(now.getFullYear(), 0, 1);
      return { from: toISODate(d), to: today };
    }
    case "custom":
      return {
        from: custom?.from || today,
        to: custom?.to || today,
      };
  }
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDateBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function parseAmount(input: string) {
  const clean = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "")
    .replace(",", ".");
  const n = Number.parseFloat(clean);
  return Number.isFinite(n) ? n : 0;
}
