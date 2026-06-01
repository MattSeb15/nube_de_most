"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, RefreshCw, LogOut, CheckCircle } from "lucide-react";

const COOLDOWN_KEY = "verify_resend_cooldown_timestamp";
const COOLDOWN_SECONDS = 60;

export default function VerificarCorreoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Get current user session with active tab focus and background poll listener
  useEffect(() => {
    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const params = new URLSearchParams(window.location.search);
      const queryEmail = params.get("email");

      if (!user) {
        if (queryEmail) {
          setEmail(queryEmail);
          return;
        }
        // Not logged in? Go to login
        router.push("/login");
        return;
      }

      setEmail(user.email || queryEmail || "");

      // If user is already verified, redirect them home automatically!
      if (user.email_confirmed_at) {
        router.push("/");
        router.refresh();
      }
    }

    checkSession();

    // Listen for tab focus/visibility changes to dynamically recheck!
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    window.addEventListener("focus", checkSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up a gentle 5-second interval poll to check if they confirmed it in the background!
    const interval = setInterval(checkSession, 5000);

    return () => {
      window.removeEventListener("focus", checkSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [supabase, router]);

  // Handle Cooldown countdown
  useEffect(() => {
    // Check localStorage for active cooldown on mount
    const savedTimestamp = localStorage.getItem(COOLDOWN_KEY);
    if (savedTimestamp) {
      const remaining = Math.round(
        (parseInt(savedTimestamp, 10) - Date.now()) / 1000
      );
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        localStorage.removeItem(COOLDOWN_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(COOLDOWN_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // Trigger cooldown timer
  function startCooldown() {
    const endTimestamp = Date.now() + COOLDOWN_SECONDS * 1000;
    localStorage.setItem(COOLDOWN_KEY, endTimestamp.toString());
    setCooldown(COOLDOWN_SECONDS);
  }

  // Handle Resend
  async function handleResend() {
    if (cooldown > 0 || !email) return;

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSuccessMsg("¡Se ha enviado un nuevo enlace de verificación a tu correo!");
      startCooldown();
    });
  }

  // Handle Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem(COOLDOWN_KEY);
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Botón flotante premium para volver al inicio */}
      <Link
        href="/"
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground rounded-full bg-card/60 hover:bg-card border border-border/80 hover:border-border backdrop-blur-md transition-all duration-300 shadow-md md:top-8 md:right-8 group"
      >
        <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
        <span>Volver al inicio</span>
      </Link>
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in flex flex-col items-center">
        <Mail className="size-16 text-primary animate-bounce mb-4 fill-primary/10" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
          Verifica tu cuenta
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-center px-6">
          Para acceder a La Nube de Most, debes confirmar tu cuenta institucional.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/40 pb-4 border-b border-border/50 text-center">
            <CardTitle className="text-base font-semibold">Bandeja de Entrada</CardTitle>
          </CardHeader>

          <CardContent className="pt-6 pb-8 px-6 sm:px-8 space-y-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-foreground/80">
                Hemos enviado un correo electrónico de verificación a:
              </p>
              {email && (
                <div className="inline-block bg-primary/10 text-primary font-mono text-sm px-3 py-1.5 rounded-xl border border-primary/20">
                  {email}
                </div>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed px-4 pt-2">
                Haz clic en el enlace del correo para verificar tu cuenta. Si no lo encuentras, revisa tu carpeta de <strong>Correo no deseado (Spam)</strong>.
              </p>
            </div>

            {/* Error / Success Feedback */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400 text-xs text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400 text-xs text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <CheckCircle className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <Button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isPending}
                className="w-full h-11 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
                {cooldown > 0
                  ? `Reenviar en ${cooldown}s`
                  : isPending
                  ? "Enviando..."
                  : "Reenviar correo de verificación"}
              </Button>

              <div className="flex items-center justify-between pt-4 text-sm">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  <span>Volver al login</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                >
                  <LogOut className="size-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
