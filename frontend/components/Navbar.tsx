"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Building2, LogOut, LayoutDashboard, LogIn, UserPlus, Users, Menu, X, Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <button
          className="sm:hidden p-2 rounded-md hover:bg-muted transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menú"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
