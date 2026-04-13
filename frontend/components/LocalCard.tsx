import Link from "next/link";
import { LocalOut } from "@/lib/api";
import { MapPin, Phone, Globe, Building2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/StarRating";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export default function LocalCard({ local }: { local: LocalOut }) {
  const cover = imageUrl(local.cover_image);
  const logo = imageUrl(local.logo);

  return (
    <Link href={`/locals/${local.id}`} className="group block">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md h-full">
        {/* Cover */}
        <div className="relative h-44 bg-muted">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={local.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Building2 className="h-12 w-12 opacity-30" />
            </div>
          )}
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt="logo"
              className="absolute bottom-2 left-3 h-10 w-10 rounded-full border-2 border-white object-cover bg-white shadow"
            />
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {local.name}
            </h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {local.category}
            </Badge>
          </div>

          {local.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {local.description}
            </p>
          )}

          {/* Estrellas y seguidores */}
          <div className="flex items-center justify-between gap-2">
            <StarRating value={local.avg_rating} size="sm" showValue count={local.ratings_count} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {local.followers_count}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {(local.address || local.city) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {[local.address, local.city].filter(Boolean).join(", ")}
              </span>
            )}
            {local.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 shrink-0" />
                {local.phone}
              </span>
            )}
            {local.website && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3 shrink-0" />
                <span className="truncate">{local.website.replace(/^https?:\/\//, "")}</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
