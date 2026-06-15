"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FeedPost, CommentOut,
  likePost, unlikePost, getComments, addComment, deleteComment,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Building2, Heart, MessageCircle, Share2, Tag, CalendarRange, Send, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short" });
}

function isActive(post: FeedPost): boolean {
  if (!post.event_end) return true;
  return new Date(post.event_end) >= new Date();
}

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

interface FeedCardProps {
  post: FeedPost;
  /** Si el visitante no está autenticado, se llama en vez de ejecutar la acción. */
  onRequireAuth?: () => void;
}

export default function FeedCard({ post, onRequireAuth }: FeedCardProps) {
  const { user } = useAuth();

  const [liked, setLiked]   = useState(post.liked_by_me);
  const [likes, setLikes]   = useState(post.likes_count);
  const [burst, setBurst]   = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]   = useState<CommentOut[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  const authorId    = post.local_id ?? post.professional_id;
  const authorName  = post.local_name ?? post.professional_name ?? "Dirbook";
  const authorSub   = post.local_category
    ? `${post.local_category}${post.local_city ? " · " + post.local_city : ""}`
    : post.professional_profession ?? "";
  const authorImg   = imageUrl(post.local_logo ?? post.professional_avatar);
  const authorHref  = post.local_id
    ? `/locals/${post.local_id}`
    : post.professional_id ? `/professionals/${post.professional_id}` : "#";

  const cover = imageUrl(post.image_url) ?? imageUrl(post.local_cover);

  async function toggleLike() {
    if (!user) { onRequireAuth?.(); return; }
    // Optimista
    const next = !liked;
    setLiked(next);
    setLikes((c) => c + (next ? 1 : -1));
    if (next) { setBurst(true); setTimeout(() => setBurst(false), 600); }
    try {
      const res = next ? await likePost(post.id) : await unlikePost(post.id);
      setLiked(res.liked);
      setLikes(res.likes_count);
    } catch {
      // revertir
      setLiked(!next);
      setLikes((c) => c + (next ? -1 : 1));
    }
  }

  async function openComments() {
    const willShow = !showComments;
    setShowComments(willShow);
    if (willShow && comments.length === 0 && commentsCount > 0) {
      setLoadingComments(true);
      try { setComments(await getComments(post.id)); }
      catch { /* noop */ }
      finally { setLoadingComments(false); }
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { onRequireAuth?.(); return; }
    const text = newComment.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const c = await addComment(post.id, text);
      setComments((list) => [...list, c]);
      setCommentsCount((n) => n + 1);
      setNewComment("");
    } catch { /* noop */ }
    finally { setSending(false); }
  }

  async function removeComment(id: string) {
    try {
      await deleteComment(id);
      setComments((list) => list.filter((c) => c.id !== id));
      setCommentsCount((n) => Math.max(0, n - 1));
    } catch { /* noop */ }
  }

  function share() {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}${authorHref}` : authorHref;
    if (navigator.share) {
      navigator.share({ title: authorName, text: post.title ?? post.content, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-card shadow-sm transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]">
      {/* ── Cabecera: la "cara" del local ── */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href={authorHref} className="shrink-0">
          <span className="story-ring block rounded-full p-[2px]">
            <span className="block overflow-hidden rounded-full bg-card">
              {authorImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={authorImg} alt={authorName} className="h-11 w-11 object-cover" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center bg-muted text-sm font-bold text-foreground">
                  {initials(authorName)}
                </span>
              )}
            </span>
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={authorHref} className="block truncate font-semibold leading-tight hover:underline">
            {authorName}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {authorSub}{authorSub ? " · " : ""}{timeAgo(post.created_at)}
          </p>
        </div>
        {post.post_type === "discount" && post.discount_pct && (
          <span className="rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-extrabold text-black shadow-[0_0_18px_-4px_rgba(250,204,21,0.7)]">
            -{post.discount_pct}%
          </span>
        )}
      </div>

      {/* ── Texto ── */}
      <div className="px-4 pb-3 pt-3">
        {post.title && <h3 className="mb-1 text-base font-bold leading-snug">{post.title}</h3>}
        <p className="whitespace-pre-line text-sm text-foreground/80">{post.content}</p>
        {(post.event_start || post.event_end) && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            <span className={isActive(post) ? "text-green-500 font-medium" : ""}>
              {isActive(post) ? "Vigente" : "Finalizado"}
            </span>
          </div>
        )}
      </div>

      {/* ── Imagen grande (image-forward) ── */}
      {cover ? (
        <Link href={authorHref} className="group block overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={post.title ?? authorName}
            className="max-h-[520px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      ) : (
        <div className="mx-4 mb-1 flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900">
          {post.post_type === "discount"
            ? <Tag className="h-10 w-10 text-yellow-400/60" />
            : <Building2 className="h-10 w-10 text-white/20" />}
        </div>
      )}

      {/* ── Barra de acciones ── */}
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          onClick={toggleLike}
          className={`group relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
            liked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
          }`}
        >
          <Heart className={`h-5 w-5 transition-transform ${liked ? "fill-rose-500" : ""} ${burst ? "animate-heart-pop" : "group-active:scale-90"}`} />
          <span className="tabular-nums">{likes > 0 ? likes : ""}</span>
        </button>

        <button
          onClick={openComments}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-yellow-400"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="tabular-nums">{commentsCount > 0 ? commentsCount : ""}</span>
        </button>

        <button
          onClick={share}
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-yellow-400"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* ── Comentarios ── */}
      {showComments && (
        <div className="border-t border-white/10 px-4 py-3">
          {loadingComments ? (
            <p className="py-2 text-center text-xs text-muted-foreground">Cargando comentarios…</p>
          ) : comments.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">Sé el primero en comentar ✨</p>
          ) : (
            <ul className="mb-3 space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {initials(c.user_name)}
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl bg-muted px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold">{c.user_name}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="break-words text-sm text-foreground/85">{c.content}</p>
                  </div>
                  {user && c.user_id === user.id && (
                    <button onClick={() => removeComment(c.id)} className="mt-1 text-muted-foreground hover:text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submitComment} className="flex items-center gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => { if (!user) onRequireAuth?.(); }}
              placeholder={user ? "Escribe un comentario…" : "Inicia sesión para comentar"}
              className="flex-1 rounded-full border border-white/10 bg-muted px-4 py-2 text-sm outline-none focus:border-yellow-400/50"
            />
            <button
              type="submit"
              disabled={sending || !newComment.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
