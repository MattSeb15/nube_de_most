import { notFound } from "next/navigation";
import { getMallaById, getAllMaterias } from "@/lib/academic";
import { MallaEditorClient } from "@/components/admin/mallas/malla-editor-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MallaEditorPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getMallaById(id);
  if (!result) notFound();

  const allMaterias = await getAllMaterias();

  return (
    <MallaEditorClient
      malla={result.malla}
      mallaMaterias={result.materias}
      availableMaterias={allMaterias}
    />
  );
}
