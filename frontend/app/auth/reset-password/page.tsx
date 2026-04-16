"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyResetToken, resetPassword } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Lock, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token  = params.get("token") ?? "";

  const [tokenValid, setTokenValid]   = useState<boolean | null>(null);
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState("");

  // Verificar token al cargar
  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    verifyResetToken(token)
      .then(() => setTokenValid(true))
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading (verificando token) ── */
  if (tokenValid === null) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  /* ── Token inválido o expirado ── */
  if (!tokenValid) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 text-2xl font-bold">
              <Building2 className="h-7 w-7" />
              DirBook
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto">
              <XCircle className="h-9 w-9 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">Enlace inválido o expirado</h2>
              <p className="text-sm text-muted-foreground">
                Este enlace de recuperación ya no es válido. Puede haber expirado (duran 1 hora)
                o ya fue utilizado.
              </p>
            </div>
            <Link href="/auth/forgot-password" className="block">
              <Button className="w-full">Solicitar un nuevo enlace</Button>
            </Link>
            <Link
              href="/auth/login"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-2xl font-bold">
            <Building2 className="h-7 w-7" />
            DirBook
          </div>
          <p className="mt-1 text-muted-foreground">Elige una nueva contraseña</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          {success ? (
            /* ── Éxito ── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>
              <div>
                <h2 className="mb-1 text-lg font-bold">¡Contraseña actualizada!</h2>
                <p className="text-sm text-muted-foreground">
                  Tu contraseña fue cambiada exitosamente. Redirigiendo al inicio de sesión…
                </p>
              </div>
              <Link href="/auth/login" className="w-full">
                <Button className="w-full">Iniciar sesión ahora</Button>
              </Link>
            </div>
          ) : (
            /* ── Formulario ── */
            <>
              <div className="mb-5 flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Nueva contraseña</h2>
                  <p className="text-sm text-muted-foreground">
                    Debe tener al menos 6 caracteres.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nueva contraseña</label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Confirmar contraseña</label>
                  <div className="relative">
                    <Input
                      type={showConf ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConf((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || (confirm.length > 0 && password !== confirm)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {loading ? "Guardando…" : "Guardar nueva contraseña"}
                </Button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
