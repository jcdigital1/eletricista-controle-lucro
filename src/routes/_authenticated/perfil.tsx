import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Card3D, GhostButton, GoldButton, SectionTitle } from "@/components/Cards";
import { Field, TextInput } from "@/components/Field";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSaveProfile } from "@/lib/data";
import { parseAmount } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — Gestão Financeira do Eletricista" },
      {
        name: "description",
        content: "Dados do profissional, da empresa, meta mensal e configurações.",
      },
      { property: "og:title", content: "Meu perfil" },
      {
        property: "og:description",
        content: "Configure seus dados profissionais e a meta do mês.",
      },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const navigate = useNavigate();
  const profile = useProfile();
  const save = useSaveProfile();
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    phone: "",
    whatsapp: "",
    city: "",
    address: "",
    monthly_goal: "",
  });

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      full_name: profile.data.full_name,
      company_name: profile.data.company_name,
      phone: profile.data.phone,
      whatsapp: profile.data.whatsapp,
      city: profile.data.city,
      address: profile.data.address,
      monthly_goal: profile.data.monthly_goal
        ? String(profile.data.monthly_goal).replace(".", ",")
        : "",
    });
  }, [profile.data]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save.mutateAsync({
        full_name: form.full_name,
        company_name: form.company_name,
        phone: form.phone,
        whatsapp: form.whatsapp,
        city: form.city,
        address: form.address,
        monthly_goal: parseAmount(form.monthly_goal),
      });
      toast.success("Perfil salvo!");
    } catch {
      toast.error("Não foi possível salvar o perfil");
    }
  }

  async function changePassword() {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) toast.error(error.message);
    else toast.success("Enviamos um link para alterar sua senha.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Logo className="w-44" />
      </div>
      <SectionTitle>Meu Perfil</SectionTitle>

      <form onSubmit={submit} className="card-3d animate-rise space-y-4 rounded-3xl p-5">
        <Field label="Nome do profissional">
          <TextInput
            value={form.full_name}
            maxLength={120}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </Field>
        <Field label="Nome da empresa">
          <TextInput
            value={form.company_name}
            maxLength={120}
            onChange={(e) => set("company_name", e.target.value)}
          />
        </Field>
        <Field label="Telefone">
          <TextInput
            value={form.phone}
            maxLength={30}
            inputMode="tel"
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
        <Field label="WhatsApp">
          <TextInput
            value={form.whatsapp}
            maxLength={30}
            inputMode="tel"
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </Field>
        <Field label="Cidade">
          <TextInput
            value={form.city}
            maxLength={80}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>
        <Field label="Endereço">
          <TextInput
            value={form.address}
            maxLength={200}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>
        <Field label="Meta do mês — R$">
          <TextInput
            value={form.monthly_goal}
            inputMode="decimal"
            placeholder="10.000,00"
            onChange={(e) => set("monthly_goal", e.target.value)}
          />
        </Field>
        <GoldButton type="submit" disabled={save.isPending}>
          Salvar perfil
        </GoldButton>
      </form>

      <Card3D className="space-y-3 p-4">
        <GhostButton onClick={changePassword}>
          <KeyRound className="h-5 w-5" /> Alterar senha
        </GhostButton>
        <GhostButton
          onClick={signOut}
          className="border-destructive/40 bg-destructive/15 text-destructive"
        >
          <LogOut className="h-5 w-5" /> Sair
        </GhostButton>
      </Card3D>
    </div>
  );
}
