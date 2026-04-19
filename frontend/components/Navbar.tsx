"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Building2, LogOut, LayoutDashboard, LogIn, UserPlus, Users, Menu, X, Map, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications, markNotificationsRead, NotificationOut } from "@/lib/api";

function NotifPanel({
  notifs, onClose,
}: {
  notifs: NotificationOut[];
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-white shadow-xl z-[200] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-semibold text-sm">Notificaciones</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y">
        {notifs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Sin notificaciones</p>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 text-sm ${n.read ? "text-muted-foreground" : "bg-yellow-50 font-medium"}`}
            >
              <p className="leading-snug">{n.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleDateString("es", {
                  dateStyle: "medium",
                })}{" "}
                {new Date(n.created_at).toLocaleTimeString("es", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))
        )}
      </div>
      {notifs.some((n) => !n.read) && (
        <div className="border-t px-4 py-2">
          <button
            onClick={onClose}
            className="text-xs text-primary hover:underline"
          >
            Marcar todas como leídas
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationOut[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;

  // Cargar notificaciones cuando hay usuario
  useEffect(() => {
    if (!user) { setNotifs([]); return; }
    getNotifications().then(setNotifs).catch(() => {});
    const interval = setInterval(() => {
      getNotifications().then(setNotifs).catch(() => {});
    }, 30_000); // refresca cada 30 s
    return () => clearInterval(interval);
  }, [user]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openNotif = async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen && unread > 0) {
      await markNotificationsRead().catch(() => {});
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Building2 className="h-6 w-6" />
          <span>DirBook</span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-muted transition-colors">Locales</Link>
          <Link href="/professionals" className="px-3 py-1.5 rounded-md hover:bg-muted transition-colors">Profesionales</Link>
          <Link href="/explore" className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-muted transition-colors font-medium text-primary">
            <Map className="h-3.5 w-3.5" /> Mapa
          </Link>
        </nav>

        {/* Actions — desktop */}
        <nav className="hidden sm:flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">Hola, {user.name.split(" ")[0]}</span>

              {/* Campana */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotif}
                  className="relative p-2 rounded-md hover:bg-muted transition-colors"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-5 w-5" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <NotifPanel notifs={notifs} onClose={() => setNotifOpen(false)} />
                )}
              </div>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard"><LayoutDashboard className="mr-1 h-4 w-4" />Mi panel</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" />Salir
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login"><LogIn className="mr-1 h-4 w-4" />Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register"><UserPlus className="mr-1 h-4 w-4" />Registrarse</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Hamburger — móvil */}
        <div className="sm:hidden flex items-center gap-2">
          {/* Campana móvil */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotif}
                className="relative p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotifPanel notifs={notifs} onClose={() => setNotifOpen(false)} />
              )}
            </div>
          )}
          <button
            className="p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú desplegable móvil */}
      {menuOpen && (
        <div className="sm:hidden border-t bg-white px-4 py-3 space-y-1">
          <Link href="/" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors">
            <Building2 className="h-4 w-4 text-muted-foreground" /> Locales
          </Link>
          <Link href="/professionals" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors">
            <Users className="h-4 w-4 text-muted-foreground" /> Profesionales
          </Link>
          <Link href="/explore" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
            <Map className="h-4 w-4" /> Mapa — Explorar cerca
          </Link>
          <div className="my-2 border-t" />
          {user ? (
            <>
              <p className="px-3 py-1 text-xs text-muted-foreground">Hola, {user.name.split(" ")[0]}</p>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Mi panel
              </Link>
              <button onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors">
                <LogIn className="h-4 w-4 text-muted-foreground" /> Iniciar sesión
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                <UserPlus className="h-4 w-4" /> Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
