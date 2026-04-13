"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createLocal, LocalCreate } from "@/lib/api";
import LocalForm from "@/components/LocalForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NewLocalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  const handleSubmit = async (data: LocalCreate) => {
    setSaving(true);
    try {
      await createLocal(data);
      router.push("/dashboard");
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>
        <h1 className="text-2xl font-bold">Publicar nuevo local</h1>
        <p className="text-muted-foreground text-sm">Completa la información de tu negocio</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <LocalForm
          onSubmit={handleSubmit}
          submitLabel="Publicar local"
          loading={saving}
        />
      </div>
    </div>
  );
}
