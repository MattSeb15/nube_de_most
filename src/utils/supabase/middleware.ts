import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get user session safely from Supabase auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isVerifyingPage = request.nextUrl.pathname === "/verificar-correo";
  const isLoginPage = request.nextUrl.pathname === "/login";

  // If a user has logged in but their email is NOT verified, and they are not on /verificar-correo page, redirect them.
  if (user) {
    const isEmailVerified = user.email_confirmed_at !== undefined && user.email_confirmed_at !== null;
    
    if (!isEmailVerified && !isVerifyingPage && !request.nextUrl.pathname.startsWith("/_next") && request.nextUrl.pathname !== "/favicon.ico") {
      const url = request.nextUrl.clone();
      url.pathname = "/verificar-correo";
      return NextResponse.redirect(url);
    }

    // If verified user tries to access /verificar-correo or /login, redirect to home
    if (isEmailVerified && (isVerifyingPage || isLoginPage)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Protect administrative /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    const isAdmin =
      profile?.rol === "admin" ||
      user.email === "most@uta.edu.ec" ||
      user.user_metadata?.role === "admin";

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
