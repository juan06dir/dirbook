import type { Metadata } from "next";
import Link from "next/link";
import {
  Trash2, ShieldAlert, CheckCircle2, Clock,
  Smartphone, Mail, AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Eliminar cuenta — Dirbook",
  description:
    "Instrucciones para solicitar la eliminación de tu cuenta de Dirbook y todos los datos asociados.",
};

const DELETED_DATA = [
  "Perfil de usuario (nombre, correo electrónico, foto de perfil)",
  "Contraseña (almacenada de forma cifrada)",
  "Locales comerciales registrados y sus publicaciones",
  "Perfiles profesionales y sus publicaciones",
  "Historial de seguimientos a otros locales",
  "Calificaciones y reseñas realizadas",
  "Notificaciones",
  "Tokens de recuperación de contraseña",
];

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-black text-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-4 py-1.5 text-sm font-semibold text-red-400">
              <Trash2 className="h-4 w-4" />
              Eliminación de cuenta
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Solicitar eliminación de cuenta
          </h1>
          <p className="mt-4 text-white/60 text-sm max-w-xl mx-auto">
            Puedes eliminar tu cuenta de Dirbook y todos los datos asociados en
            cualquier momento, de forma inmediata o contactándonos por correo.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14 space-y-12">

        {/* Aviso importante */}
        <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <p>
            La eliminación de cuenta es <strong>permanente e irreversible</strong>.
            Una vez confirmada, no podrás recuperar ninguno de tus datos.
          </p>
        </div>

        {/* Opción 1 — Desde la app */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400/15">
              <Smartphone className="h-5 w-5 text-yellow-300" />
            </div>
            <h2 className="text-xl font-bold">Opción 1 — Desde la aplicación</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Si tienes acceso a tu cuenta, esta es la forma más rápida. La
            eliminación es inmediata.
          </p>
          <ol className="space-y-4">
            {[
              <>Inicia sesión en Dirbook en <Link href="/auth/login" className="text-blue-400 hover:underline font-medium">dirbook.com.co</Link> o en la app.</>,
              "Abre el menú de tu perfil haciendo clic en tu nombre o avatar en la barra superior.",
              <>Ve a la sección <strong>Configuración</strong> dentro de tu panel de usuario.</>,
              <>Desplázate hasta la zona <strong>Zona de peligro</strong> y haz clic en <strong>«Eliminar mi cuenta»</strong>.</>,
              "Confirma la acción en el diálogo de advertencia. Tu cuenta y todos tus datos serán eliminados de forma inmediata.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400/15 text-yellow-300 font-bold text-sm">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Opción 2 — Por correo */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400/15">
              <Mail className="h-5 w-5 text-yellow-300" />
            </div>
            <h2 className="text-xl font-bold">Opción 2 — Por correo electrónico</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Si no puedes acceder a tu cuenta, envíanos un correo con los
            siguientes datos:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground mb-5">
            {[
              "Asunto: «Solicitud de eliminación de cuenta — Dirbook»",
              "El correo electrónico asociado a tu cuenta de Dirbook",
              "Razón opcional de la eliminación (para mejorar nuestro servicio)",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="mailto:noreply@dirbook.com.co?subject=Solicitud%20de%20eliminación%20de%20cuenta%20—%20Dirbook"
            className="inline-flex items-center gap-2 rounded-lg bg-black border border-white/15 px-4 py-2.5 text-sm font-semibold text-yellow-400 hover:bg-white/5 transition-colors"
          >
            <Mail className="h-4 w-4" />
            noreply@dirbook.com.co
          </a>
          <p className="mt-3 text-xs text-gray-500">
            Procesamos las solicitudes por correo en un plazo máximo de{" "}
            <strong>7 días hábiles</strong>.
          </p>
        </section>

        {/* Datos eliminados */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/15">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <h2 className="text-xl font-bold">Datos que se eliminan</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Al eliminar tu cuenta se borran de forma permanente e inmediata los
            siguientes datos:
          </p>
          <ul className="space-y-2">
            {DELETED_DATA.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Retención de datos */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold">Datos que pueden conservarse temporalmente</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Ciertos datos pueden ser retenidos durante un período limitado por
              obligaciones legales o de seguridad:
            </p>
            <ul className="space-y-3">
              {[
                {
                  title: "Registros de actividad (logs)",
                  period: "Hasta 90 días",
                  reason:
                    "Conservados por motivos de seguridad y para detectar usos fraudulentos. Se eliminan automáticamente al vencer el plazo.",
                },
                {
                  title: "Datos relacionados con obligaciones legales",
                  period: "Según la ley aplicable",
                  reason:
                    "Si existe una orden judicial o requerimiento legal vigente, podemos estar obligados a conservar ciertos datos hasta que se resuelva el proceso.",
                },
              ].map(({ title, period, reason }) => (
                <li key={title} className="rounded-lg border border-orange-400/20 bg-orange-400/10 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground">{title}</span>
                    <span className="text-xs font-medium bg-orange-500/20 text-orange-300 rounded-full px-2.5 py-0.5">
                      {period}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Eliminación parcial */}
        <section className="rounded-2xl border border-white/10 bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-bold">¿Solo quieres eliminar algunos datos?</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Puedes solicitar la eliminación de datos específicos sin borrar tu cuenta
            completa. Por ejemplo:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground mb-4">
            {[
              "Eliminar un local o perfil profesional específico desde tu panel.",
              "Borrar publicaciones o descuentos individuales.",
              "Solicitar la eliminación de tu foto de perfil.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Para solicitudes de eliminación parcial, contáctanos en{" "}
            <a
              href="mailto:noreply@dirbook.com.co"
              className="text-blue-400 hover:underline font-medium"
            >
              noreply@dirbook.com.co
            </a>
            .
          </p>
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
          <Link href="/child-safety" className="hover:underline">
            Seguridad Infantil
          </Link>
          <span>·</span>
          <a href="mailto:noreply@dirbook.com.co" className="hover:underline">
            Contacto
          </a>
        </p>
      </footer>
    </div>
  );
}
