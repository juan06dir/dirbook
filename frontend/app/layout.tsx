import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#facc15",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dirbook — Directorio de locales y profesionales",
    template: "%s | Dirbook",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "directorio de negocios", "locales comerciales", "profesionales",
    "restaurantes", "servicios", "Colombia", "directorio local",
    "negocios cerca de mí", "Dirbook",
  ],
  applicationName: "Dirbook",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dirbook",
  },
  formatDetection: { telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Dirbook",
    locale: "es_CO",
    title: "Dirbook — Directorio de locales y profesionales",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dirbook — Directorio de locales y profesionales",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dirbook" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
        {/* Registro del Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .catch(function(err) { console.log('SW error:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
