import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor de Mallas — Admin",
  description: "Editor visual de mallas curriculares.",
};

export default function MallasAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
