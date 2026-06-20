import type { Metadata } from "next";
import Link from "next/link";
import { FileText, UserCheck, Ban, Copyright, Flag, ShieldAlert, Scale, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Dirbook",
  description:
    "Términos y Condiciones de uso de Dirbook. Cada usuario es responsable del contenido que publica. Conoce las reglas, el contenido prohibido y cómo reportar.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-black text-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 px-4 py-1.5 text-sm font-semibold text-yellow-400">
              <FileText className="h-4 w-4" />
              Términos y Condiciones
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Términos y Condiciones de uso
          </h1>
          <p className="mt-4 text-white/60 text-sm">
            Última actualización: junio de 2026
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14 space-y-12">

        {/* 1. Aceptación */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400/15">
              <UserCheck className="h-5 w-5 text-yellow-300" />
            </div>
            <h2 className="text-xl font-bold">1. Aceptación de los términos</h2>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Dirbook es una plataforma de directorio social que conecta personas con
              locales comerciales y profesionales en Colombia. Al crear una cuenta,
              publicar contenido o usar la aplicación de cualquier forma, aceptas estos
              Términos y Condiciones en su totalidad. Si no estás de acuerdo, no uses la
              plataforma.
            </p>
            <p>
              Para registrarte debes ser mayor de edad o contar con autorización de tu
              representante legal, y proporcionar información veraz.
            </p>
          </div>
        </section>

        {/* 2. Responsabilidad del usuario por el contenido */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold">
              2. Responsabilidad sobre el contenido publicado
            </h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">
                Cada usuario es el único responsable del contenido que publica
              </strong>{" "}
              (textos, imágenes, datos de locales y perfiles, comentarios y cualquier
              material). Al publicar en Dirbook, declaras y garantizas que:
            </p>
            <ul className="space-y-2.5">
              {[
                "Eres titular de los derechos sobre el contenido, o cuentas con autorización para publicarlo y mostrarlo.",
                "La información es veraz, no engañosa y no induce a fraude o error a terceros.",
                "El contenido no infringe derechos de autor, marcas, propiedad intelectual, privacidad ni honra de ninguna persona o empresa.",
                "Asumes plena responsabilidad civil, penal y administrativa por lo que publicas, eximiendo a Dirbook de cualquier reclamación de terceros derivada de tu contenido.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400/15 text-yellow-400 font-bold text-xs">
                    !
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Dirbook es un intermediario que aloja y muestra contenido generado por sus
              usuarios; no lo crea ni lo respalda, y no asume responsabilidad por la
              exactitud, legalidad o calidad del mismo.
            </p>
          </div>
        </section>

        {/* 3. Contenido prohibido */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <Ban className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold">3. Contenido y conductas prohibidas</h2>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">Está prohibido publicar o difundir:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Contenido ilegal, fraudulento, difamatorio, discriminatorio, violento o que incite al odio.",
              "Material sexual explícito, y de forma absoluta cualquier contenido que involucre o sexualice a menores de edad.",
              "Contenido que infrinja derechos de autor, marcas o propiedad intelectual de terceros.",
              "Datos personales de terceros sin su consentimiento, o suplantación de identidad.",
              "Spam, publicidad engañosa, estafas, esquemas piramidales o productos/servicios ilegales.",
              "Virus, malware o cualquier código destinado a dañar la plataforma o a otros usuarios.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Propiedad intelectual y licencia */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
              <Copyright className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold">4. Propiedad intelectual</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Conservas la titularidad del contenido que publicas. Al publicarlo, otorgas
              a Dirbook una licencia no exclusiva, gratuita y mundial para alojar, mostrar
              y distribuir dicho contenido dentro de la plataforma con el fin de operar el
              servicio. Esta licencia termina cuando eliminas el contenido o tu cuenta,
              salvo copias técnicas o requerimientos legales.
            </p>
            <p>
              La marca, el logo, el diseño y el código de Dirbook son propiedad de Dirbook
              y no pueden usarse sin autorización.
            </p>
          </div>
        </section>

        {/* 5. Reportes y retiro de contenido */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
              <Flag className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold">5. Reportes y retiro de contenido</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Si consideras que un contenido infringe estos términos o tus derechos
              (incluidos los de autor), puedes reportarlo escribiendo a{" "}
              <a href="mailto:noreply@dirbook.com.co" className="font-semibold text-yellow-400 hover:underline">
                noreply@dirbook.com.co
              </a>{" "}
              indicando el enlace y el motivo.
            </p>
            <ul className="space-y-2">
              {[
                "Revisamos los reportes y retiramos el contenido que infrinja estas normas.",
                "Podemos retirar contenido o suspender cuentas, con o sin previo aviso, ante incumplimientos.",
                "Los reportes sobre seguridad infantil tienen prioridad y se atienden en un máximo de 24 horas (ver Estándares de Seguridad Infantil).",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Limitación de responsabilidad */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
              <Scale className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">6. Limitación de responsabilidad</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Dirbook se ofrece "tal cual" y "según disponibilidad". No garantizamos que
              el servicio sea ininterrumpido o libre de errores. Dirbook no se hace
              responsable por daños derivados del uso de la plataforma, de transacciones o
              acuerdos entre usuarios, ni del contenido publicado por terceros.
            </p>
            <p>
              Las negociaciones, contrataciones o pagos entre usuarios y locales o
              profesionales ocurren bajo la exclusiva responsabilidad de las partes
              involucradas.
            </p>
          </div>
        </section>

        {/* 7. Suspensión y cambios */}
        <section>
          <h2 className="text-xl font-bold mb-4">7. Suspensión de cuentas y cambios</h2>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Podemos suspender o eliminar cuentas que incumplan estos términos. Puedes
              eliminar tu cuenta y datos en cualquier momento desde{" "}
              <Link href="/delete-account" className="font-semibold text-foreground hover:underline">
                Eliminar cuenta
              </Link>.
            </p>
            <p>
              Podemos actualizar estos Términos; los cambios relevantes se informarán en
              la plataforma. El uso continuado implica la aceptación de la versión vigente.
            </p>
          </div>
        </section>

        {/* 8. Ley aplicable y contacto */}
        <section className="rounded-2xl border border-white/10 bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black">
              <Mail className="h-5 w-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold">8. Ley aplicable y contacto</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Estos Términos se rigen por las leyes de la República de Colombia. Para
            cualquier consulta, reporte o reclamación, contáctanos:
          </p>
          <a
            href="mailto:noreply@dirbook.com.co"
            className="inline-flex items-center gap-2 rounded-lg bg-black border border-white/15 px-4 py-2.5 text-sm font-semibold text-yellow-400 hover:bg-white/5 transition-colors"
          >
            <Mail className="h-4 w-4" />
            noreply@dirbook.com.co
          </a>
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
        <p className="mt-1">
          <Link href="/child-safety" className="hover:underline">
            Estándares de Seguridad Infantil
          </Link>
          {" · "}
          <a href="mailto:noreply@dirbook.com.co" className="hover:underline">
            Contacto
          </a>
        </p>
      </footer>
    </div>
  );
}
