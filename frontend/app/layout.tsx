import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

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
  title: "Dirbook — Directorio de locales comerciales",
  description: "Encuentra y conecta con locales y profesionales en tu ciudad",
  applicationName: "Dirbook",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dirbook",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "Dirbook",
    description: "Directorio de locales y profesionales en tu ciudad",
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
