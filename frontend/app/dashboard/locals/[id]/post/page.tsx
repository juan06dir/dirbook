"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPost, uploadImage, PostType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";

const TYPE_OPTIONS: { value: PostType; label: string; desc: string }[] = [
  { value: "post",     label: "Publicación",  desc: "Novedad, foto o anuncio general" },
  { value: "event",    label: "Evento",       desc: "Un evento con fecha de inicio y fin" },
  { value: "discount", label: "Descuento",    desc: "Oferta o descuento por tiempo limitado" },
];

export default function NewPostPage() {
  const { id: localId } = useParams<{ id: string }>();
  const router = useRouter();

  const [postType, setPostType] = useState<PostType>("post");
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd]     = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("El contenido es requerido"); return; }
    setSaving(true);
    setError("");
    try {
      let image_url: string | undefined;
      if (imageFile) {
        const res = await uploadImage(imageFile);
        image_url = res.url;
      }

      await createPost({
        post_type:    postType,
        title:        title || undefined,
        content,
        image_url,
        local_id:     localId,
        event_start:  eventStart || undefined,
        event_end:    eventEnd   || undefined,
        discount_pct: discountPct ? parseFloat(discountPct) : undefined,
      });

      router.push(`/locals/${localId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <h1 className="mb-6 text-2xl font-bold">Nueva publicación</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipo */}
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPostType(value)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                postType === value
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground/40"
              }`}
            >
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* Título (opcional) */}
        <div className="space-y-1">
          <Label htmlFor="title">Título (opcional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la publicación"
          />
        </div>

        {/* Contenido */}
        <div className="space-y-1">
          <Label htmlFor="content">Descripción *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué quieres publicar?"
            rows={4}
            required
          />
        </div>

        {/* Imagen */}
        <div className="space-y-2">
          <Label>Imagen (opcional)</Label>
          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="preview" className="h-40 w-full rounded-lg object-cover" />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-4 hover:bg-muted/50 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {imageFile ? imageFile.name : "Seleccionar imagen"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
        </div>

        {/* Fechas (evento / descuento) */}
        {(postType === "event" || postType === "discount") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="start">Fecha inicio</Label>
              <Input
                id="start"
                type="datetime-local"
                value={eventStart}
                onChange={(e) => setEventStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end">Fecha fin</Label>
              <Input
                id="end"
                type="datetime-local"
                value={eventEnd}
                onChange={(e) => setEventEnd(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* % Descuento */}
        {postType === "discount" && (
          <div className="space-y-1">
            <Label htmlFor="discount">Porcentaje de descuento (%)</Label>
            <Input
              id="discount"
              type="number"
              min="1"
              max="100"
              value={discountPct}
              onChange={(e) => setDiscountPct(e.target.value)}
              placeholder="Ej: 20"
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Publicando…" : "Publicar"}
        </Button>
      </form>
    </div>
  );
}
