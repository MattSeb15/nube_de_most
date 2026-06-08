import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/check-username?username=xxx&exclude=userId
 * Checks if a username (apodo) is already taken.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().toLowerCase();
  const excludeUserId = searchParams.get("exclude"); // Optional: exclude current user when editing

  if (!username) {
    return NextResponse.json({ available: false, error: "Username requerido" }, { status: 400 });
  }

  // Validate format: only a-z, 0-9, _, - and 3-30 chars
  if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
    return NextResponse.json({
      available: false,
      error: "El nombre de usuario debe tener 3-30 caracteres y solo contener letras minúsculas, números, guiones y guiones bajos.",
    }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("perfiles")
    .select("id")
    .eq("apodo", username);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return NextResponse.json({ available: false, error: "Error al verificar" }, { status: 500 });
  }

  return NextResponse.json({ available: !data });
}
