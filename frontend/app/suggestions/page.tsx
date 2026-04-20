"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { submitSuggestion } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function SuggestionsPage() {
  const { user } = useAuth();

  const [name, setName]       = useState(user?.name ?? "");
  const [email, setEmail]     = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      await submitSuggestion(name.trim(), email.trim(), message.trim());
      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400">
          <MessageSquare className="h-7 w-7 text-black" />
        </div>
        <h1 className="text-2xl font-bold">Buzón de sugerencias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cuéntanos cómo podemos mejorar Dirbook. Leemos cada mensaje.
        </p>
      </div>

      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 py-14 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-lg font-semibold text-green-800">¡Gracias por tu sugerencia!</p>
          <p className="text-sm text-green-600">La hemos recibido y la tendremos en cuenta.</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => setSent(false)}
          >
            Enviar otra sugerencia
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Sugerencia</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe aquí tu sugerencia, comentario o idea..."
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={sending}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Enviando…" : "Enviar sugerencia"}
          </Button>
        </form>
      )}
    </div>
  );
}
