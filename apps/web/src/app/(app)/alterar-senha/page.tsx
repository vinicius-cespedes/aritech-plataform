"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button, Card, ErrorBanner, Field, Input } from "@/components/ui/primitives";

/**
 * Troca de senha obrigatória — o AppShell redireciona para cá sempre que
 * `mustChangePassword` estiver marcado (o seed do admin já vinha com isso
 * ativo, mas até esta funcionalidade existir não havia como agir sobre a
 * flag; a senha padrão do seed ficava em uso indefinidamente).
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.post("/auth/change-password", { currentPassword, newPassword }),
    onSuccess: async () => {
      // O backend já revoga a sessão atual ao trocar a senha — desloga
      // localmente também e manda para o login, já com a senha nova.
      await logout();
      router.replace("/login");
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Erro ao trocar a senha."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("A confirmação não corresponde à nova senha.");
      return;
    }
    setError(null);
    mutation.mutate();
  }

  return (
    <Card className="w-full max-w-md p-6">
      <h1 className="text-lg font-semibold text-slate-900">Troque sua senha</h1>
      <p className="mt-1 text-sm text-slate-500">
        Antes de continuar, defina uma senha própria — a senha inicial é apenas para o primeiro acesso.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <ErrorBanner message={error} />
        <Field label="Senha atual">
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>
        <Field label="Nova senha (mínimo 8 caracteres)">
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Field>
        <Field label="Confirme a nova senha">
          <Input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Salvando…" : "Trocar senha e entrar novamente"}
        </Button>
      </form>
    </Card>
  );
}
