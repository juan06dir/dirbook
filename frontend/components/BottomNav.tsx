"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, Map, CalendarDays, Users, User } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/explore", label: "Explorar", icon: Map },
  { href: "/events", label: "Eventos", icon: CalendarDays },
  { href: "/professionals", label: "Pros", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const profileHref = user ? "/dashboard" : "/auth/login";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-xl sm:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {[...ITEMS, { href: profileHref, label: "Perfil", icon: User }].map(
          ({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-yellow-400"
                    : "text-white/55 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" : ""}`} />
                {label}
              </Link>
            );
          }
        )}
      </div>
    </nav>
  );
}
