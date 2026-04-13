"use client";

import { useState } from "react";
import { X, Phone, Globe, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onClose: () => void;
  localName: string;
  phone: string | null;
  website: string | null;
}

export default function ContactModal({ open, onClose, localName, phone, website }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En una versión completa aquí se enviaría el mensaje al backend
    setSent(true);
  };

  const handleClose = () => {
    setSent(false);
    setName("");
    setEmail("");
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">Contactar a {localName}</h2>
          <button onClick={handleClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Contacto directo */}
          {(phone || website) && (
            <div className="rounded-lg bg-muted p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacto directo</p>
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm hover:text-primary font-medium">
                  <Phone className="h-4 w-4" /> {phone}
                </a>
              )}
              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-primary font-medium"
                >
                  <Globe className="h-4 w-4" />
                  <span className="truncate">{website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>
          )}

          {/* Formulario */}
          {sent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Send className="mb-3 h-10 w-10 text-primary" />
              <p className="font-semibold">¡Mensaje enviado!</p>
              <p className="text-sm text-muted-foreground mt-1">
                El local se pondrá en contacto contigo pronto.
              </p>
              <Button className="mt-4" onClick={handleClose}>Cerrar</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enviar mensaje</p>
              <Input
                required
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                required
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                required
                placeholder="¿En qué podemos ayudarte?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Enviar mensaje
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
