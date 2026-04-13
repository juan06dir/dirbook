import Link from "next/link";
import { ProfessionalOut } from "@/lib/api";
import { Phone, Globe, UserCircle2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export default function ProfessionalCard({ prof }: { prof: ProfessionalOut }) {
  const cover  = imageUrl(prof.cover_image);
  const avatar = imageUrl(prof.avatar);

  return (
    <Link href={`/professionals/${prof.id}`} className="group block">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md h-full">
        {/* Cover */}
        <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-100">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={prof.name} className="h-full w-full object-cover" />
          ) : null}
          {/* Avatar */}
          <div className="absolute -bottom-6 left-4 h-14 w-14 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={prof.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <UserCircle2 className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <CardContent className="pt-8 pb-4 px-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {prof.name}
            </h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              <Briefcase className="mr-1 h-3 w-3" />
              {prof.profession}
            </Badge>
          </div>

          {prof.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">{prof.bio}</p>
          )}

          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {prof.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 shrink-0" />
                {prof.phone}
              </span>
            )}
            {prof.website && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3 shrink-0" />
                <span className="truncate">{prof.website.replace(/^https?:\/\//, "")}</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
