import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ServiceRow = {
  id: string;
  user_id: string;
  client_name: string;
  client_phone: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  service_date: string;
  notes: string;
  created_at: string;
};

export type ExpenseRow = {
  id: string;
  user_id: string;
  description: string;
  category: string;
  amount: number;
  payment_method: string;
  expense_date: string;
  notes: string;
  created_at: string;
};

export type ClientRow = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string;
  company_name: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  monthly_goal: number;
};

const num = (v: unknown) => Number(v ?? 0);

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async (): Promise<ServiceRow[]> => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("service_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({ ...r, amount: num(r.amount) }) as ServiceRow);
    },
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async (): Promise<ExpenseRow[]> => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({ ...r, amount: num(r.amount) }) as ExpenseRow);
    },
  });
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<ClientRow[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as ClientRow[];
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileRow | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...data, monthly_goal: num(data.monthly_goal) } as ProfileRow;
    },
  });
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user.id;
}

export function useSaveRow<T extends Record<string, unknown>>(
  table: "services" | "expenses" | "clients",
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: T }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase.from(table) as any;
      if (id) {
        const { error } = await client.update(values).eq("id", id);
        if (error) throw error;
        return;
      }
      const user_id = await currentUserId();
      const { error } = await client.insert({ ...values, user_id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
    },
  });
}

export function useDeleteRow(table: "services" | "expenses" | "clients") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<ProfileRow>) => {
      const id = await currentUserId();
      const { error } = await supabase
        .from("profiles")
        .upsert({ id, ...values })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function inRange(date: string, from: string, to: string) {
  const d = date.slice(0, 10);
  return d >= from && d <= to;
}
