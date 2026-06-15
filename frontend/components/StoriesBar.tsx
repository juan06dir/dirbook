"use client";

import Link from "next/link";
import { FeedPost } from "@/lib/api";
import { Building2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

interface Story {
  id: string;
  name: string;
  img: string | null;
  href: string;
}

/** Deriva "stories" únicos de los autores con publicaciones recientes. */
function buildStories(posts: FeedPost[]): Story[] {
  const seen = new Set<string>();
  const out: Story[] = [];
  for (const p of posts) {
    const id = p.local_id ?? p.professional_id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      name: p.local_name ?? p.professional_name ?? "Dirbook",
      img: imageUrl(p.local_logo ?? p.local_cover ?? p.professional_avatar),
      href: p.local_id ? `/locals/${p.local_id}` : `/professionals/${p.professional_id}`,
    });
    if (out.length >= 20) break;
  }
  return out;
}

export default function StoriesBar({ posts }: { posts: FeedPost[] }) {
  const stories = buildStories(posts);
  if (stories.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {stories.map((s) => (
        <Link key={s.id} href={s.href} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
          <span className="story-ring rounded-full p-[2.5px] transition-transform hover:scale-105">
            <span className="block overflow-hidden rounded-full border-2 border-background bg-card">
              {s.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.img} alt={s.name} className="h-14 w-14 object-cover" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center bg-muted">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </span>
              )}
            </span>
          </span>
          <span className="w-full truncate text-center text-[11px] text-muted-foreground">{s.name}</span>
        </Link>
      ))}
    </div>
  );
}
