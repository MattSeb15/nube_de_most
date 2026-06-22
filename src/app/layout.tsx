import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CursorTooltipProvider } from "@/components/ui/cursor-tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mostcloud.space"),
  title: {
    default: "La Nube de Most | Apuntes UTA",
    template: "%s | La Nube de Most",
  },
  description:
    "Plataforma de recursos académicos para la Universidad Técnica de Ambato. Apuntes, actividades y material de estudio organizado por semestre y materia para Ingeniería en Software y Nivelación.",
  keywords: [
    "apuntes universidad tecnica de ambato",
    "software uta",
    "nivelación uta",
    "nivelación software uta",
    "recursos academicos",
    "universidad técnica de ambato",
    "ingeniería en software",
  ],
  authors: [{ name: "Most Cloud", url: "https://www.mostcloud.space" }],
  creator: "Mateo Sebastián",
  publisher: "Most Cloud",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: "https://www.mostcloud.space",
    title: "La Nube de Most | Apuntes UTA",
    description: "Plataforma de recursos académicos para la Universidad Técnica de Ambato. Apuntes y material de estudio.",
    siteName: "La Nube de Most",
    images: [
      {
        url: "/opengrapht_tumb.webp",
        width: 1200,
        height: 630,
        alt: "La Nube de Most - Recursos Académicos UTA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Nube de Most | Apuntes UTA",
    description: "Plataforma de recursos académicos para la Universidad Técnica de Ambato.",
    images: ["/opengrapht_tumb.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "La Nube de Most",
              url: "https://www.mostcloud.space",
              description: "Plataforma de recursos académicos para la Universidad Técnica de Ambato.",
              author: {
                "@type": "Person",
                name: "Mateo Sebastián",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <CursorTooltipProvider>
              {children}
            </CursorTooltipProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

