"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavLink {
  href: string;
  label: string;
  isNew?: boolean;
  disabled?: boolean;
}

const navLinks: NavLink[] = [
  { href: "/apuntes", label: "Explorar" },
  { href: "/aprender", label: "Aprender", isNew: true },
  // { href: "/actividades", label: "Actividades", disabled: true },
  { href: "/sobre-mi", label: "Acerca de" },
];

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6", className)}
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [apodo, setApodo] = useState<string>("");
 
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
 
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
 
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    async function checkRole() {
      try {
        const { data, error } = await supabase
          .from("perfiles")
          .select("rol, avatar_url, apodo, nombre_completo")
          .eq("id", user.id)
          .single();
        if (!error && data) {
          setIsAdmin(data.rol === "admin");
          setAvatarUrl(data.avatar_url || user.user_metadata?.avatar_url || "");
          setUserInitials((data.apodo || data.nombre_completo || user.email || "U").substring(0, 2).toUpperCase());
          setApodo(data.apodo || "");
        } else {
          setIsAdmin(user.email === "most@uta.edu.ec" || user.user_metadata?.role === "admin");
          setUserInitials((user.email || "U").substring(0, 2).toUpperCase());
        }
      } catch (_) {
        setIsAdmin(user.email === "most@uta.edu.ec" || user.user_metadata?.role === "admin");
        setUserInitials((user.email || "U").substring(0, 2).toUpperCase());
      }
    }
    checkRole();
  }, [user, supabase]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (_) {}
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky z-50 top-4 mx-auto w-[96%] max-w-7xl flex items-center justify-between gap-4 pointer-events-none px-2 sm:px-0">
      {/* ── Left Pill: Logo & Navigation ───────────────────────── */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Logo Button */}
        <Link href="/" onClick={() => window.scrollTo(0, 0)}>
          <div className="bg-background/80 backdrop-blur-md rounded-full shadow-md border border-border/50 flex items-center justify-center size-12 sm:size-14 hover:shadow-lg transition-all hover:bg-background group">
            <CloudIcon className="size-6 sm:size-7 text-primary group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex bg-background/80 backdrop-blur-md rounded-full px-3 py-2 border border-border/50 shadow-md items-center gap-1 h-14">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            
            if (link.disabled) {
              return (
                <div
                  key={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground/40 cursor-not-allowed flex items-center gap-1.5 select-none"
                  title="Próximamente"
                >
                  {link.label}
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                    WIP
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => window.scrollTo(0, 0)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {link.label}
                {link.isNew && (
                  <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shadow-sm font-black uppercase tracking-wider">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Center Pill: Search Bar ──────────────────────────────── */}
      <div className="flex-1 max-w-xl hidden md:flex pointer-events-auto">
        <Link href="/buscar" className="w-full group" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-full h-14 bg-background/80 backdrop-blur-md rounded-full border border-border/50 shadow-md flex items-center px-5 text-muted-foreground group-hover:bg-background group-hover:border-primary/40 transition-all group-hover:shadow-lg">
            <Search className="size-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[15px] font-medium">Buscar apuntes, materias, profesores...</span>
          </div>
        </Link>
      </div>

      {/* ── Right Pill: Actions & Auth ───────────────────────────── */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Theme Toggle (Desktop) */}
        <div className="hidden sm:flex bg-background/80 backdrop-blur-md rounded-full border border-border/50 shadow-md items-center justify-center h-12 w-12 sm:h-14 sm:w-14">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full size-full"
            onClick={toggleTheme}
            aria-label={isDark ? "Modo claro" : "Modo oscuro"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>

        {/* Auth / Mobile Search */}
        <div className="bg-background/80 backdrop-blur-md rounded-full border border-border/50 shadow-md flex items-center h-12 sm:h-14 px-2 sm:px-3">
          
          {/* Mobile Search Icon */}
          <Link href="/buscar" className="md:hidden mr-1" onClick={() => window.scrollTo(0, 0)}>
            <Button variant="ghost" size="icon" className="rounded-full size-9">
              <Search className="size-4" />
            </Button>
          </Link>

          <div className="w-[1px] h-8 bg-border/60 mx-1 md:hidden" />

          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                render={
                  <button
                    className={cn(
                      "flex h-9 sm:h-10 px-3 sm:px-4 rounded-full transition-all duration-300 font-semibold font-mono text-xs max-w-[140px] sm:max-w-[180px] truncate select-none cursor-pointer items-center gap-2 outline-none",
                      isAdmin
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                    title={apodo ? `@${apodo}` : user.email}
                  />
                }
              >
                <div className={cn(
                  "flex items-center justify-center size-5 shrink-0 rounded-full overflow-hidden text-[9px] font-bold",
                  !avatarUrl && (isAdmin ? "bg-primary text-primary-foreground" : "bg-neutral-800 text-white")
                )}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
                <span className="truncate">{apodo ? `@${apodo}` : user.email}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-popover shadow-xl ring-1 ring-border/40 select-none mt-2">
                <div className="px-3 py-2 text-xs font-mono font-medium text-muted-foreground truncate border-b border-border/40 mb-1">
                  {user.email}
                </div>
                
                <DropdownMenuItem onClick={() => { router.push(`/perfil/${apodo || user.id}`); window.scrollTo(0, 0); }} className="cursor-pointer rounded-lg px-3 py-2.5 text-sm flex items-center gap-2 font-medium">
                  <User className="size-4 text-muted-foreground" />
                  <span>Ver Perfil</span>
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem onClick={() => { router.push("/admin"); window.scrollTo(0, 0); }} className="cursor-pointer rounded-lg px-3 py-2.5 text-sm flex items-center gap-2 text-primary font-bold">
                    <Settings className="size-4 shrink-0" />
                    <span>Panel Admin</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="-mx-2 my-1 h-px bg-border/40" />

                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg px-3 py-2.5 text-sm flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                  <LogOut className="size-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 px-1">
              <Link href="/login" className="text-xs sm:text-sm font-semibold hover:text-primary px-1 sm:px-3 py-2 transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Ingresar
              </Link>
              <Link href="/login?mode=register" onClick={() => window.scrollTo(0, 0)}>
                <Button className="rounded-full h-8 sm:h-10 px-3 sm:px-6 text-xs sm:text-sm font-bold bg-foreground text-background hover:bg-foreground/90">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden bg-background/80 backdrop-blur-md rounded-full border border-border/50 shadow-md flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-full size-full">
                  <MenuIcon />
                </Button>
              }
            />
            <SheetContent side="right" className="!w-full sm:!w-96 p-0">
              <SheetHeader className="px-6 pt-6 pb-2">
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2" onClick={() => { setMobileOpen(false); window.scrollTo(0, 0); }}>
                    <CloudIcon className="size-6 text-primary" />
                    <span className="font-bold">La Nube de Most</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <Separator />
              <nav className="flex flex-col gap-1 px-4 py-4">
                {navLinks.map((link) => {
                  const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  
                  if (link.disabled) {
                    return (
                      <div
                        key={link.href}
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none"
                      >
                        <span>{link.label}</span>
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                          WIP
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => { setMobileOpen(false); window.scrollTo(0, 0); }}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span>{link.label}</span>
                      {link.isNew && (
                        <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shadow-sm font-black uppercase tracking-wider">
                          NEW
                        </span>
                      )}
                    </Link>
                  );
                })}
                {/* Mobile Theme Toggle */}
                <button
                  onClick={() => { toggleTheme(); setMobileOpen(false); }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted text-foreground transition-colors text-left"
                >
                  {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
                  <span>{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
