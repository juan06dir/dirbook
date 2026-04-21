"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { adminGetUsers, adminBlockUser, adminUnblockUser, UserAdminOut } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Ban, CheckCircle2, Users } from "lucide-react";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserAdminOut[]>([]);
  const [fetching, setFetching] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      adminGetUsers()
        .then(setUsers)
        .catch(() => router.push("/"))
        .finally(() => setFetching(false));
    }
  }, [user, router]);

  const handleBlock = async (u: UserAdminOut) => {
    if (!confirm(`¿${u.is_blocked ? "Desbloquear" : "Bloquear"} a ${u.name}?`)) return;
    setActing(u.id);
    try {
      if (u.is_blocked) {
        await adminUnblockUser(u.id);
      } else {
        await adminBlockUser(u.id);
      }
      setUsers((prev) =>
        prev.map((x) => x.id === u.id ? { ...x, is_blocked: !x.is_blocked } : x)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setActing(null);
    }
  };

  if (loading || !user) return null;

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Panel de administración</h1>
          <p className="text-sm text-muted-foreground">Gestiona los usuarios de Dirbook</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" /> {users.length} usuarios
        </div>
      </div>

      {fetching ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div
              key={u.id}
              className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm ${
                u.is_blocked ? "border-red-200 bg-red-50" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{u.name}</p>
                  {u.is_admin && (
                    <Badge className="bg-yellow-400 text-black text-xs">Admin</Badge>
                  )}
                  {u.is_blocked && (
                    <Badge variant="destructive" className="text-xs">Bloqueado</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                <p className="text-xs text-muted-foreground">
                  Registrado: {new Date(u.created_at).toLocaleDateString("es", { dateStyle: "medium" })}
                </p>
              </div>
              {!u.is_admin && (
                <Button
                  size="sm"
                  variant={u.is_blocked ? "outline" : "destructive"}
                  disabled={acting === u.id}
                  onClick={() => handleBlock(u)}
                  className={u.is_blocked ? "border-green-400 text-green-600 hover:bg-green-50" : ""}
                >
                  {u.is_blocked ? (
                    <><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Desbloquear</>
                  ) : (
                    <><Ban className="mr-1 h-3.5 w-3.5" />Bloquear</>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
