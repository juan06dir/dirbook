"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getMyLocals, deleteLocal, LocalOut,
  getMyProfessionals, deleteProfessional, ProfessionalOut,
  deleteAccount,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, Building2, Users, Star, FilePlus, UserCircle2, Briefcase, AlertTriangle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function imageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [locals, setLocals]           = useState<LocalOut[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOut[]>([]);
  const [fetching, setFetching]       = useState(true);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [tab, setTab]                 = useState<"locals" | "professionals">("locals");

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([getMyLocals(), getMyProfessionals()])
        .then(([l, p]) => { setLocals(l); setProfessionals(p); })
        .finally(() => setFetching(false));
    }
  }, [user]);

  const handleDeleteLocal = async (id: string) => {
    if (!confirm("¿Eliminar este local?")) return;
    setDeleting(id);
    try {
      await deleteLocal(id);
      setLocals((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally { setDeleting(null); }
  };

  const handleDeleteProfessional = async (id: string) => {
    if (!confirm("¿Eliminar este perfil?")) return;
    setDeleting(id);
    try {
      await deleteProfessional(id);
      setProfessionals((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally { setDeleting(null); }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "¿Estás seguro de que quieres eliminar tu cuenta?\n\nEsto borrará permanentemente tu cuenta, todos tus locales, perfiles profesionales y publicaciones. Esta acción NO se puede deshacer."
    );
    if (!confirmed) return;
    setDeletingAccount(true);
    try {
      await deleteAccount();
      logout();
      router.push("/");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar cuenta");
      setDeletingAccount(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Mi panel</h1>
          <p className="text-muted-foreground text-sm">Gestiona tus perfiles y locales</p>
        </div>
        {tab === "locals" ? (
          <Button asChild size="sm" className="shrink-0">
            <Link href="/dashboard/locals/new">
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo local</span>
              <span className="sm:hidden">Nuevo</span>
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" className="shrink-0">
            <Link href="/dashboard/professionals/new">
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo perfil</span>
              <span className="sm:hidden">Nuevo</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-lg border bg-white p-1 w-fit shadow-sm">
        <button
          onClick={() => setTab("locals")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "locals" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Building2 className="h-4 w-4" /> Locales
          <Badge variant={tab === "locals" ? "secondary" : "outline"} className="ml-1 text-xs">
            {locals.length}
          </Badge>
        </button>
        <button
          onClick={() => setTab("professionals")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "professionals" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <UserCircle2 className="h-4 w-4" /> Profesional
          <Badge variant={tab === "professionals" ? "secondary" : "outline"} className="ml-1 text-xs">
            {professionals.length}
          </Badge>
        </button>
      </div>

      {/* ── Locales ── */}
      {tab === "locals" && (
        fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : locals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-muted-foreground">
            <Building2 className="mb-3 h-12 w-12 opacity-30" />
            <p className="font-medium">Aún no tienes locales registrados</p>
            <p className="text-sm mb-4">Comienza publicando tu primer local</p>
            <Button asChild>
              <Link href="/dashboard/locals/new"><Plus className="mr-2 h-4 w-4" />Crear local</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {locals.map((local) => {
              const logo = imageUrl(local.logo);
              return (
                <div key={local.id} className="flex items-center gap-3 rounded-xl border bg-white p-3 sm:p-4 shadow-sm">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{local.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <Badge variant="secondary" className="text-xs">{local.category}</Badge>
                      {local.city && <span className="hidden sm:inline">{local.city}</span>}
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {local.followers_count}</span>
                      {local.avg_rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {local.avg_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" asChild title="Nueva publicación">
                      <Link href={`/dashboard/locals/${local.id}/post`}><FilePlus className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Ver local" className="hidden sm:inline-flex">
                      <Link href={`/locals/${local.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Editar">
                      <Link href={`/dashboard/locals/${local.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" title="Eliminar" disabled={deleting === local.id}
                      onClick={() => handleDeleteLocal(local.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Zona de peligro ── */}
      <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-red-700 mb-1">
          <AlertTriangle className="h-4 w-4" /> Zona de peligro
        </h2>
        <p className="text-sm text-red-600 mb-4">
          Eliminar tu cuenta borrará permanentemente todos tus datos: locales, perfiles profesionales y publicaciones.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="border-red-400 text-red-600 hover:bg-red-100 hover:text-red-700"
          onClick={handleDeleteAccount}
          disabled={deletingAccount}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deletingAccount ? "Eliminando cuenta…" : "Eliminar mi cuenta"}
        </Button>
      </div>

      {/* ── Profesionales ── */}
      {tab === "professionals" && (
        fetching ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : professionals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-muted-foreground">
            <UserCircle2 className="mb-3 h-12 w-12 opacity-30" />
            <p className="font-medium">No tienes un perfil profesional</p>
            <p className="text-sm mb-4">Publica tus servicios como profesional</p>
            <Button asChild>
              <Link href="/dashboard/professionals/new"><Plus className="mr-2 h-4 w-4" />Crear perfil</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {professionals.map((prof) => {
              const avatar = imageUrl(prof.avatar);
              return (
                <div key={prof.id} className="flex items-center gap-3 rounded-xl border bg-white p-3 sm:p-4 shadow-sm">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{prof.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        <Briefcase className="mr-1 h-3 w-3" />{prof.profession}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" asChild title="Nueva publicación">
                      <Link href={`/dashboard/professionals/${prof.id}/post`}><FilePlus className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Ver perfil" className="hidden sm:inline-flex">
                      <Link href={`/professionals/${prof.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Editar">
                      <Link href={`/dashboard/professionals/${prof.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" title="Eliminar" disabled={deleting === prof.id}
                      onClick={() => handleDeleteProfessional(prof.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
