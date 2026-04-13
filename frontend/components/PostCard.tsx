import { PostOut } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarRange, Tag, FileText } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}

function isActive(post: PostOut): boolean {
  if (!post.event_end) return true;
  return new Date(post.event_end) >= new Date();
}

const TYPE_CONFIG = {
  post:     { label: "Publicación", color: "secondary",    Icon: FileText },
  event:    { label: "Evento",      color: "default",      Icon: CalendarRange },
  discount: { label: "Descuento",   color: "destructive",  Icon: Tag },
} as const;

interface PostCardProps {
  post: PostOut;
  showLocalName?: string;
}

export default function PostCard({ post, showLocalName }: PostCardProps) {
  const cfg = TYPE_CONFIG[post.post_type] ?? TYPE_CONFIG.post;
  const img = imageUrl(post.image_url);
  const active = isActive(post);

  return (
    <Card className="overflow-hidden">
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={post.title ?? "post"} className="h-40 w-full object-cover" />
      )}
      <CardContent className="p-4 space-y-2">
        {/* Tipo + badge activo */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={cfg.color as "secondary" | "default" | "destructive"}>
            <cfg.Icon className="mr-1 h-3 w-3" />
            {cfg.label}
          </Badge>

          {post.post_type === "discount" && post.discount_pct && (
            <Badge variant="outline" className="text-green-600 border-green-400 font-bold">
              -{post.discount_pct}%
            </Badge>
          )}

          {(post.post_type === "discount" || post.post_type === "event") && (
            <span className={`text-xs font-medium ${active ? "text-green-600" : "text-muted-foreground"}`}>
              {active ? "Vigente" : "Finalizado"}
            </span>
          )}
        </div>

        {/* Título */}
        {post.title && (
          <h3 className="font-semibold text-base leading-tight">{post.title}</h3>
        )}

        {/* Contenido */}
        <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>

        {/* Fechas de evento/descuento */}
        {(post.event_start || post.event_end) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarRange className="h-3 w-3 shrink-0" />
            <span>
              {post.event_start ? formatDate(post.event_start) : "—"}
              {" → "}
              {post.event_end ? formatDate(post.event_end) : "Sin fecha de fin"}
            </span>
          </div>
        )}

        {/* Local o fecha de publicación */}
        <p className="text-xs text-muted-foreground">
          {showLocalName ? `${showLocalName} · ` : ""}
          {formatDate(post.created_at)}
        </p>
      </CardContent>
    </Card>
  );
}
