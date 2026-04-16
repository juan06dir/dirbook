"use client";

import { useState, useRef } from "react";
import { LocalCreate, uploadImage } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Restaurante", "Cafetería", "Bar", "Tienda", "Servicio",
  "Salud", "Educación", "Tecnología", "Moda", "Otro",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function imageUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

/** Comprime una imagen en el navegador antes de subirla */
async function compressImage(file: File, maxWidth = 1920, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

interface Props {
  initial?: Partial<LocalCreate>;
  onSubmit: (data: LocalCreate) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export default function LocalForm({ initial = {}, onSubmit, submitLabel, loading }: Props) {
  const [name,        setName]        = useState(initial.name        || "");
  const [description, setDescription] = useState(initial.description || "");
  const [category,    setCategory]    = useState(initial.category    || "");
  const [address,     setAddress]     = useState(initial.address     || "");
  const [city,        setCity]        = useState(initial.city        || "");
  const [phone,       setPhone]       = useState(initial.phone       || "");
  const [website,     setWebsite]     = useState(initial.website     || "");
  const [whatsapp,    setWhatsapp]    = useState(initial.whatsapp    || "");
  const [facebook,    setFacebook]    = useState(initial.facebook    || "");
  const [instagram,   setInstagram]   = useState(initial.instagram   || "");
  const [logo,        setLogo]        = useState(initial.logo        || "");
  const [cover,       setCover]       = useState(initial.cover_image || "");
  const [uploadingLogo,  setUploadingLogo]  = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState("");

  const logoRef  = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    file: File,
    setUrl: (u: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const res = await uploadImage(compressed);
      setUrl(res.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !category) {
      setError("El nombre y la categoría son obligatorios");
      return;
    }
    await onSubmit({
      name:        name.trim(),
      description: description.trim() || undefined,
      category,
      address:     address.trim()   || undefined,
      city:        city.trim()      || undefined,
      phone:       phone.trim()     || undefined,
      website:     website.trim()   || undefined,
      whatsapp:    whatsapp.trim()  || undefined,
      facebook:    facebook.trim()  || undefined,
      instagram:   instagram.trim() || undefined,
      logo:        logo             || undefined,
      cover_image: cover            || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Imágenes */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Cover */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Imagen de portada</label>
          <div
            className="relative h-36 rounded-xl border-2 border-dashed bg-muted flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
            onClick={() => coverRef.current?.click()}
          >
            {cover ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(cover) || ""} alt="cover" className="h-full w-full object-cover" />
                <button type="button" onClick={(e) => { e.stopPropagation(); setCover(""); }}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white">
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : uploadingCover ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImagePlus className="h-7 w-7" />
                <span className="text-xs">Subir portada</span>
              </div>
            )}
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, setCover, setUploadingCover); }} />
        </div>

        {/* Logo */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Logo</label>
          <div
            className="relative h-36 rounded-xl border-2 border-dashed bg-muted flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
            onClick={() => logoRef.current?.click()}
          >
            {logo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(logo) || ""} alt="logo" className="h-full w-full object-cover" />
                <button type="button" onClick={(e) => { e.stopPropagation(); setLogo(""); }}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white">
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : uploadingLogo ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImagePlus className="h-7 w-7" />
                <span className="text-xs">Subir logo</span>
              </div>
            )}
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, setLogo, setUploadingLogo); }} />
        </div>
      </div>

      {/* Info básica */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre del local *</label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Café Central" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Categoría *</label>
          <select required value={category} onChange={(e) => setCategory(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Seleccionar categoría…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Descripción</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          placeholder="Describe tu local, qué ofreces…"
          className="w-full rounded-md border border-input px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* Ubicación */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Dirección</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle Ejemplo 123" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Ciudad</label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bogotá" />
        </div>
      </div>

      {/* Contacto */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Teléfono</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+57 300 000 0000" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Sitio web</label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.milocal.com" />
        </div>
      </div>

      {/* Redes sociales */}
      <div>
        <p className="mb-3 text-sm font-semibold">Redes sociales <span className="text-muted-foreground font-normal">(opcional)</span></p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-medium">
              <span className="text-green-600">●</span> WhatsApp
            </label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="https://wa.me/57300..."
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-medium">
              <span className="text-blue-600">●</span> Facebook
            </label>
            <Input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/tu-pagina"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-medium">
              <span className="text-pink-500">●</span> Instagram
            </label>
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/tu-cuenta"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" disabled={loading || uploadingLogo || uploadingCover} className="w-full sm:w-auto">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…</> : submitLabel}
      </Button>
    </form>
  );
}
