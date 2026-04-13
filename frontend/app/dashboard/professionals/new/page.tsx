"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProfessional, uploadImage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";

const PROFESSIONS = [
  "Abogado", "Arquitecto", "Programador", "Médico", "Contador",
  "Diseñador", "Psicólogo", "Ingeniero", "Fotógrafo", "Otro",
];

export default function NewProfessionalPage() {
  const router = useRouter();

  const [name, setName]           = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio]             = useState("");
  const [phone, setPhone]         = useState("");
  const [website, setWebsite]     = useState("");
  const [avatarFile, setAvatarFile]   = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile]     = useState<File | null>(null);
  const [coverPreview, setCoverPreview]   = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

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
      const prof = await createProfessional({ name, profession, bio, phone, website });

      // Subir imágenes si las hay
      const updates: Record<string, string> = {};
      if (avatarFile) { const r = await uploadImage(avatarFile); updates.avatar = r.url; }
      if (coverFile)  { const r = await uploadImage(coverFile);  updates.cover_image = r.url; }

      if (Object.keys(updates).length > 0) {
        const { updateProfessional } = await import("@/lib/api");
        await updateProfessional(prof.id, updates);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear perfil");
    } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>
      <h1 className="mb-6 text-2xl font-bold">Crear perfil profesional</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div className="space-y-1">
          <Label htmlFor="name">Nombre completo *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
        </div>

        {/* Profesión */}
        <div className="space-y-2">
          <Label>Profesión *</Label>
          <div className="flex flex-wrap gap-2">
            {PROFESSIONS.map((p) => (
              <button key={p} type="button" onClick={() => setProfession(p)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  profession === p ? "border-primary bg-primary text-primary-foreground" : "border-muted hover:border-muted-foreground/40"
                }`}
              >{p}</button>
            ))}
          </div>
          <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="O escribe tu profesión" />
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <Label htmlFor="bio">Descripción / Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntanos sobre ti y tus servicios" rows={4} />
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="website">Sitio web / LinkedIn</Label>
            <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="linkedin.com/in/..." />
          </div>
        </div>

        {/* Avatar */}
        <div className="space-y-2">
          <Label>Foto de perfil</Label>
          {avatarPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="avatar" className="h-20 w-20 rounded-full object-cover border" />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-3 hover:bg-muted/50 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{avatarFile ? avatarFile.name : "Foto de perfil"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0], "avatar")} />
          </label>
        </div>

        {/* Cover */}
        <div className="space-y-2">
          <Label>Imagen de portada (opcional)</Label>
          {coverPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="cover" className="h-32 w-full rounded-lg object-cover" />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-3 hover:bg-muted/50 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{coverFile ? coverFile.name : "Imagen de portada"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0], "cover")} />
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Creando perfil…" : "Crear perfil profesional"}
        </Button>
      </form>
    </div>
  );
}
