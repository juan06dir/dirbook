"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getLocal, updateLocal, LocalOut, LocalCreate } from "@/lib/api";
import LocalForm from "@/components/LocalForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditLocalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [local, setLocal] = useState<LocalOut | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getLocal(id)
        .then(setLocal)
        .catch(() => router.push("/dashboard"))
        .finally(() => setFetching(false));
    }
  }, [user, id, router]);

  const handleSubmit = async (data: LocalCreate) => {
    setSaving(true);
    try {
      await updateLocal(id, data);
      router.push("/dashboard");
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || fetching) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-96 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!local) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>
        <h1 className="text-2xl font-bold">Editar local</h1>
        <p className="text-muted-foreground text-sm">{local.name}</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <LocalForm
          initial={{
            name: local.name,
            description: local.description || "",
            category: local.category,
            address: local.address || "",
            city: local.city || "",
            phone: local.phone || "",
            website: local.website || "",
            logo: local.logo || "",
            cover_image: local.cover_image || "",
          }}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
          loading={saving}
        />
      </div>
    </div>
  );
}
