import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  // 1. Forzar Canonical Domain
  // Esto soluciona el problema de indexación en Google si el dominio viejo o 
  // la url de vercel (.vercel.app) están siendo indexados
  const hostname = request.headers.get("host");
  const url = request.nextUrl.clone();
  
  // Lista de dominios que deben redirigir al principal
  const canonicalDomain = "www.mostcloud.space";
  
  // Evitar redirigir localhost en desarrollo
  if (
    hostname && 
    !hostname.includes("localhost") && 
    !hostname.includes("127.0.0.1")
  ) {
    if (hostname !== canonicalDomain) {
      url.hostname = canonicalDomain;
      url.port = "";
      url.protocol = "https:";
      return NextResponse.redirect(url, 301); // 301 = Permanent Redirect for SEO
    }
  }

  // 2. Manejar sesión de Supabase
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, SVGs, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
