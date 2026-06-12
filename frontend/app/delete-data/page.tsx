import type { Metadata } from "next";
import Link from "next/link";
import {
  DatabaseZap, Mail, CheckCircle2, Clock,
  Image, Building2, FileText, Star, AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Eliminar mis datos — Dirbook",
  description:
    "Solicita la eliminación de datos específicos en Dirbook sin necesidad de eliminar tu cuenta.",
};

const PARTIAL_OPTIONS = [
  {
    icon: Image,
    title: "Foto de perfil",
    how: "Ve a tu perfil → edita tu información → elimina la foto.",
    inmediato: true,
  },
  {
    icon: Building2,
    title: "Un local o perfil profesional",
    how: "Desde tu panel, entra al local o perfil → ajustes → eliminar.",
    inmediato: true,
  },
  {
    icon: FileText,
    title: "Publicaciones o descuentos",
    how: "Abre la publicación → menú (⋮) → eliminar publicación.",
    inmediato: true,
  },
  {
    icon: Star,
    title: "Calificaciones o reseñas",
    how: "Solicítalo por correo indicando el local y la fecha aproximada.",
    inmediato: false,
  },
];

export default function DeleteDataPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-black text-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 px-4 py-1.5 text-sm font-semibold text-yellow-400">
              <DatabaseZap className="h-4 w-4" />
              Control de datos
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Eliminar mis datos en Dirbook
          </h1>
          <p className="mt-4 text-white/60 text-sm max-w-xl mx-auto">
            Puedes solicitar la eliminación de datos específicos sin necesidad
            de eliminar tu cuenta completa.
            Si prefieres eliminar toda tu cuenta, visita{" "}
            <Link href="/delete-account" className="text-yellow-400 underline underline-offset-2">
              esta página
            </Link>.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14 space-y-12">

        {/* Opción 1 — Desde la app */}
        <section>
          <h2 className="text-xl font-bold mb-2">Datos que puedes eliminar tú mismo desde la app</h2>
          <p className="text-sm text-gray-500 mb-6">
            Las siguientes acciones son inmediatas y no requieren contactar con soporte.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {PARTIAL_OPTIONS.map(({ icon: Icon, title, how, inmediato }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-card p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-semibold text-sm">{title}</span>
                  <span className={`ml-auto text-xs rounded-full px-2 py-0.5 font-medium ${inmediato ? "bg-green-500/15 text-green-400" : "bg-yellow-400/15 text-yellow-300"}`}>
                    {inmediato ? "Inmediato" : "Por correo"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 pl-10">{how}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Opción 2 — Por correo */}
        <section>
          <h2 className="text-xl font-bold mb-2">Solicitar eliminación de datos por correo</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Para cualquier dato que no puedas eliminar directamente, envíanos un
            correo con la siguiente información:
          </p>
          <ol className="space-y-3 mb-6">
            {[
              <>Asunto: <strong>«Solicitud de eliminación de datos — Dirbook»</strong></>,
              "El correo electrónico asociado a tu cuenta de Dirbook.",
              "El tipo de dato que deseas eliminar (reseña, imagen, publicación, etc.).",
              "Contexto que nos ayude a identificarlo (fecha, nombre del local, etc.).",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400/15 text-yellow-300 font-bold text-xs">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <a
            href="mailto:noreply@dirbook.com.co?subject=Solicitud%20de%20eliminación%20de%20datos%20—%20Dirbook"
            className="inline-flex items-center gap-2 rounded-lg bg-black border border-white/15 px-4 py-2.5 text-sm font-semibold text-yellow-400 hover:bg-white/5 transition-colors"
          >
            <Mail className="h-4 w-4" />
            noreply@dirbook.com.co
          </a>
          <p className="mt-3 text-xs text-gray-500">
            Procesamos las solicitudes en un plazo máximo de{" "}
            <strong>7 días hábiles</strong>.
          </p>
        </section>

        {/* Datos eliminados vs retenidos */}
        <section>
          <h2 className="text-xl font-bold mb-5">Qué se elimina y qué se conserva</h2>
          <div className="space-y-4">

            {/* Eliminados */}
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold text-green-300">Se elimina de forma permanente</h3>
              </div>
              <ul className="space-y-1.5 text-sm text-green-200/90">
                {[
                  "El dato específico solicitado (foto, publicación, reseña, local, etc.)",
                  "Toda referencia a ese dato en otros registros de tu perfil",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Retenidos temporalmente */}
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-orange-400" />
                <h3 className="font-semibold text-orange-300">Puede conservarse temporalmente</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  {
                    dato: "Registros de actividad (logs)",
                    periodo: "Hasta 90 días",
                    razon: "Por motivos de seguridad y detección de fraude. Se eliminan automáticamente.",
                  },
                  {
                    dato: "Datos bajo requerimiento legal",
                    periodo: "Según la ley aplicable",
                    razon: "Si existe una orden judicial vigente, podemos estar obligados a conservar ciertos registros.",
                  },
                ].map(({ dato, periodo, razon }) => (
                  <li key={dato} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-orange-200">{dato}</span>
                      <span className="text-xs bg-orange-500/20 text-orange-300 rounded-full px-2 py-0.5 font-medium">
                        {periodo}
                      </span>
                    </div>
                    <span className="text-xs text-orange-300/80">{razon}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tu cuenta permanece */}
            <div className="flex gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-300">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-blue-400" />
              <p>
                Tu cuenta y el resto de tus datos permanecen intactos. Solo se
                elimina lo que solicites expresamente. Si deseas eliminar todo,
                visita{" "}
                <Link href="/delete-account" className="font-semibold underline">
                  la página de eliminación de cuenta
                </Link>.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background py-8 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()}{" "}
          <Link href="/" className="font-semibold text-muted-foreground hover:underline">
            Dirbook
          </Link>{" "}
          · Conectando tu ciudad
        </p>
        <p className="mt-1 space-x-3">
          <Link href="/child-safety" className="hover:underline">Seguridad Infantil</Link>
          <span>·</span>
          <Link href="/delete-account" className="hover:underline">Eliminar cuenta</Link>
          <span>·</span>
          <a href="mailto:noreply@dirbook.com.co" className="hover:underline">Contacto</a>
        </p>
      </footer>
    </div>
  );
}
