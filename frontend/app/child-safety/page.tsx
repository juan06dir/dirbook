import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Mail, AlertTriangle, BookOpen, Users, Flag } from "lucide-react";

export const metadata: Metadata = {
  title: "Estándares de Seguridad Infantil — Dirbook",
  description:
    "Política de Dirbook contra la explotación y el abuso sexual infantil (EASI). Conoce nuestros estándares, mecanismos de denuncia y contacto de seguridad.",
};

export default function ChildSafetyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 px-4 py-1.5 text-sm font-semibold text-yellow-400">
              <Shield className="h-4 w-4" />
              Política de Seguridad Infantil
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Estándares de Seguridad Infantil
          </h1>
          <p className="mt-4 text-white/60 text-sm">
            Última actualización: abril de 2025
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14 space-y-12">

        {/* 1. Compromiso */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100">
              <BookOpen className="h-5 w-5 text-yellow-700" />
            </div>
            <h2 className="text-xl font-bold">Nuestro compromiso</h2>
          </div>
          <div className="prose prose-sm text-gray-700 leading-relaxed space-y-3">
            <p>
              Dirbook es una plataforma de directorio social que conecta personas
              con locales comerciales y profesionales en Colombia. Nos comprometemos
              firmemente a garantizar que nuestra aplicación nunca sea utilizada para
              la explotación, el abuso o cualquier tipo de daño contra menores de edad.
            </p>
            <p>
              Adoptamos una política de <strong>tolerancia cero</strong> frente a
              cualquier contenido o conducta que constituya explotación y abuso sexual
              infantil (EASI), incluyendo la producción, distribución, recepción o
              posesión de material de abuso sexual infantil (MASI / CSAM).
            </p>
          </div>
        </section>

        {/* 2. Estándares contra la EASI */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold">
              Estándares contra la explotación y el abuso sexual infantil (EASI)
            </h2>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            {[
              "Prohibición absoluta de subir, compartir o vincular cualquier imagen, video o texto que sexualice a menores de edad.",
              "Prohibición de crear perfiles, publicaciones o mensajes orientados a contactar, captar o manipular a menores con fines sexuales o de abuso (grooming).",
              "Moderación activa del contenido generado por los usuarios mediante revisión manual y herramientas automáticas de detección.",
              "Eliminación inmediata de cuentas y contenido ante cualquier indicio confirmado de EASI, sin posibilidad de restauración.",
              "Cooperación plena con las autoridades competentes ante solicitudes legales relacionadas con la protección de menores.",
              "Revisión periódica de nuestras políticas para adaptarlas a las mejores prácticas internacionales y a los cambios legislativos.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xs">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Mecanismos de denuncia */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Flag className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold">Mecanismos de denuncia en la aplicación</h2>
          </div>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              Dirbook ofrece a sus usuarios herramientas accesibles para reportar
              contenido inapropiado o conductas que puedan poner en riesgo a menores:
            </p>
            <ul className="space-y-2">
              {[
                "Botón de \"Reportar\" disponible en publicaciones, perfiles y comentarios dentro de la app.",
                "Revisión prioritaria de todos los reportes relacionados con seguridad infantil en un plazo máximo de 24 horas.",
                "Posibilidad de reportar de forma anónima para proteger la identidad del denunciante.",
                "Confirmación de recepción del reporte y notificación del resultado de la revisión al usuario denunciante.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. Reporte a autoridades */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold">Reporte a autoridades competentes</h2>
          </div>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              Dirbook cumple con todas las leyes de protección infantil aplicables en
              Colombia y, cuando corresponde, a nivel internacional. Ante cualquier
              detección o denuncia fundada de EASI:
            </p>
            <ul className="space-y-2">
              {[
                "Notificamos de inmediato a las autoridades colombianas competentes, incluyendo la Fiscalía General de la Nación y la Policía Nacional (DIJIN / Centro Cibernético Policial).",
                "Preservamos los registros y evidencias digitales relevantes de acuerdo con los requerimientos legales.",
                "Reportamos a organismos internacionales de referencia, como el National Center for Missing & Exploited Children (NCMEC), cuando aplique.",
                "No eliminamos el contenido reportado hasta obtener autorización de las autoridades para hacerlo, garantizando la integridad de la evidencia.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5. Contacto */}
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black">
              <Mail className="h-5 w-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold">Contacto de seguridad</h2>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Si tienes información sobre una posible violación a estos estándares,
            si eres investigador de seguridad o autoridad y necesitas coordinación,
            o si deseas consultar sobre el cumplimiento de estas políticas, contáctanos:
          </p>
          <a
            href="mailto:noreply@dirbook.com.co"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-yellow-400 hover:bg-black/80 transition-colors"
          >
            <Mail className="h-4 w-4" />
            noreply@dirbook.com.co
          </a>
          <p className="mt-3 text-xs text-gray-500">
            Nos comprometemos a responder reportes relacionados con seguridad infantil
            en un plazo no mayor a <strong>24 horas</strong>.
          </p>
        </section>

        {/* 6. Marco legal */}
        <section>
          <h2 className="text-xl font-bold mb-4">Marco legal de referencia</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              "Ley 679 de 2001 (Colombia) — Estatuto para prevenir y contrarrestar la explotación, pornografía y turismo sexual con menores.",
              "Ley 1336 de 2009 (Colombia) — Adición a la Ley 679, medidas de protección contra la explotación sexual comercial de niños.",
              "Código de la Infancia y la Adolescencia — Ley 1098 de 2006 (Colombia).",
              "Convenio de Budapest sobre Ciberdelincuencia, en lo aplicable.",
              "Directrices de la Iniciativa WeProtect Global Alliance para plataformas digitales.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()}{" "}
          <Link href="/" className="font-semibold text-gray-700 hover:underline">
            Dirbook
          </Link>{" "}
          · Conectando tu ciudad
        </p>
        <p className="mt-1">
          <Link href="/child-safety" className="hover:underline">
            Estándares de Seguridad Infantil
          </Link>
          {" · "}
          <a
            href="mailto:noreply@dirbook.com.co"
            className="hover:underline"
          >
            Contacto
          </a>
        </p>
      </footer>
    </div>
  );
}
