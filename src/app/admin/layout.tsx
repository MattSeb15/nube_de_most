import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Administración — La Nube de Most",
  description: "Centro de comando y moderación de base de datos académica.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-neutral-950 text-neutral-100 font-sans selection:bg-primary selection:text-white">
      {children}
    </div>
  );
}
