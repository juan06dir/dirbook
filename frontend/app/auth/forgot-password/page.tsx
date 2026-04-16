"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-2xl font-bold">
            <Building2 className="h-7 w-7" />
            DirBook
          </div>
          <p className="mt-1 text-muted-foreground">Recupera el acceso a tu cuenta</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          {sent ? (
            /* ── Estado: correo enviado ── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>
              <div>
                <h2 className="mb-1 text-lg font-bold">¡Revisa tu correo!</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Si <span className="font-medium text-foreground">{email}</span> está
                  registrado, recibirás un enlace para restablecer tu contraseña.
                  El enlace expira en <strong>1 hora</strong>.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                ¿No llegó el correo? Revisa tu carpeta de spam o{" "}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="font-medium text-primary hover:underline"
                >
                  intenta de nuevo
                </button>.
              </p>
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a iniciar sesión
                </Button>
              </Link>
            </div>
          ) : (
            /* ── Formulario ── */
            <>
              <div className="mb-5 flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">¿Olvidaste tu contraseña?</h2>
                  <p className="text-sm text-muted-foreground">
                    Ingresa tu email y te enviaremos un enlace para recuperarla.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {loading ? "Enviando…" : "Enviar enlace de recuperación"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Volver a iniciar sesión
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
