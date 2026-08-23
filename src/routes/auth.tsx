import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/Logo";
import { Field, TextInput } from "@/components/Field";
import { GhostButton, GoldButton } from "@/components/Cards";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Gestão Financeira do Eletricista" },
      {
        name: "description",
        content:
          "Acesse sua conta e controle serviços, gastos e lucro do seu trabalho como eletricista.",
      },
      { property: "og:title", content: "Entrar — Gestão Financeira do Eletricista" },
      {
        property: "og:description",
        content: "Controle seus serviços, gastos e resultados em um só lugar.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const saved = localStorage.getItem("lembrar_email");
    if (saved) setEmail(saved);
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Informe seu e-mail e uma senha de no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode entrar.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (remember) localStorage.setItem("lembrar_email", email.trim());
        else localStorage.removeItem("lembrar_email");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  async function forgot() {
    if (!email.trim()) {
      toast.error("Digite seu e-mail para receber o link de recuperação.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) toast.error(error.message);
    else toast.success("Enviamos um link de recuperação para o seu e-mail.");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-96" />
      <div className="relative w-full max-w-md space-y-7">
        <div className="animate-rise flex flex-col items-center text-center">
          <Logo className="w-64 max-w-[80vw] drop-shadow-2xl sm:w-72" />
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight">
            Gestão Financeira
          </h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Controle seus serviços, gastos e resultados em um só lugar.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="card-3d animate-rise space-y-4 rounded-3xl p-5"
          style={{ animationDelay: "80ms" }}
        >
          <Field label="Usuário ou e-mail">
            <TextInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              maxLength={255}
            />
          </Field>
          <Field label="Senha">
            <TextInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              maxLength={72}
            />
          </Field>

          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 accent-primary"
            />
            Lembrar meu acesso
          </label>

          <GoldButton type="submit" disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </GoldButton>

          <GhostButton type="button" onClick={google}>
            Entrar com Google
          </GhostButton>

          <div className="flex items-center justify-between pt-1 text-sm">
            <button
              type="button"
              onClick={forgot}
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-primary"
            >
              {mode === "login" ? "Criar conta" : "Já tenho conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
