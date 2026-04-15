"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProfessional, updateProfessional, uploadImage, ProfessionalOut } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

const PROFESSIONS = [
  "Abogado", "Arquitecto", "Programador", "Médico", "Contador",
  "Diseñador", "Psicólogo", "Ingeniero", "Fotógrafo", "Otro",
];

export default function EditProfessionalPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { user, loading } = useAuth();

  const [prof, setProf]           = useState<ProfessionalOut | null>(null);
  const [name, setName]           = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio]             = useState("");
  const [phone, setPhone]         = useState("");
  const [website, setWebsite]     = useState("");
  const [avatarFile, setAvatarFile]     = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile]       = useState<File | null>(null);
  const [coverPreview, setCoverPreview]   = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getProfessional(id)
        .then((p) => {
          setProf(p);
          setName(p.name);
          setProfession(p.profession);
          setBio(p.bio ?? "");
          setPhone(p.phone ?? "");
          setWebsite(p.website ?? "");
        })
        .catch(() => router.push("/dashboard"));
    }
  }, [user, id, router]);

  const handleImage = (file: File, type: "avatar" | "cover") => {
    const url = URL.createObjectURL(file);
    if (type === "avatar") { setAvatarFile(file); setAvatarPreview(url); }
    else { setCoverFile(file); setCoverPreview(url); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !profession) { setError("Nombre y profesión son requeridos"); return; }
    setSaving(true); setError("");
    try {
      const updates: Record<string, string> = { name, profession, bio, phone, website };

      if (avatarFile) { const r = await uploadImage(avatarFile); updates.avatar = r.url; }
      if (coverFile)  { const r = await uploadImage(coverFile);  updates.cover_image = r.url; }

      await updateProfessional(id, updates);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally { setSaving(false); }
  };

  if (!prof) return <div className="mx-auto max-w-xl px-4 py-8"><div className="h-8 w-48 rounded bg-muted animate-pulse" /></div>;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>
      <h1 className="mb-6 text-2xl font-bold">Editar perfil profesional</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <Label htmlFor="name">Nombre completo *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Profesión *</Label>
          <div className="flex flex-wrap gap-2">
            {PROFESSIONS.map((p) => (
              <button key={p} type="button" onClick={() => setProfession(p)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  profession === p ? "border-primary bg-primary text-primary-foreground" : "border-muted hover:border-muted-foreground/40"
                }`}>{p}</button>
            ))}
          </div>
          <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="O escribe tu profesión" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Teléfono</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Sitio web</Label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
        </div>

        {/* Avatar */}
        <div className="space-y-2">
          <Label>Foto de perfil</Label>
          <div className="flex items-center gap-4">
            {(avatarPreview || imageUrl(prof.avatar)) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview ?? imageUrl(prof.avatar)!} alt="avatar"
                className="h-16 w-16 rounded-full object-cover border" />
            )}
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-dashed p-3 hover:bg-muted/50 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{avatarFile ? avatarFile.name : "Cambiar foto"}</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0], "avatar")} />
            </label>
          </div>
        </div>

        {/* Cover */}
        <div className="space-y-2">
          <Label>Imagen de portada</Label>
          {(coverPreview || imageUrl(prof.cover_image)) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview ?? imageUrl(prof.cover_image)!} alt="cover"
              className="h-32 w-full rounded-lg object-cover" />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-3 hover:bg-muted/50 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{coverFile ? coverFile.name : "Cambiar portada"}</span>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0], "cover")} />
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
