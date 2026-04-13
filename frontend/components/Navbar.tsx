"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Building2, LogOut, LayoutDashboard, LogIn, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Building2 className="h-6 w-6" />
          <span>DirBook</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-muted transition-colors">Locales</Link>
          <Link href="/professionals" className="px-3 py-1.5 rounded-md hover:bg-muted transition-colors">Profesionales</Link>
        </nav>

        {/* Actions */}
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:block">
                Hola, {user.name.split(" ")[0]}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Mi panel
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" />
                Salir
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-1 h-4 w-4" />
                  Iniciar sesión
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">
                  <UserPlus className="mr-1 h-4 w-4" />
                  Registrarse
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
