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
  title: "La Nube de Most | Apuntes UTA",
  description:
    "Plataforma de recursos académicos para la Universidad Técnica de Ambato. Apuntes, actividades y material de estudio organizado por semestre y materia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
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

