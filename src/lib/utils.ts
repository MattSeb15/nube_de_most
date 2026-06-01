import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPeriodo(fechaInicio?: string | null, fechaFin?: string | null): string {
  if (!fechaInicio || !fechaFin) return "Periodo indefinido";
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  
  const startMonth = start.toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" });
  const endMonth = end.toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" });
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  
  const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  if (startYear === endYear) {
    return `${cap(startMonth)} - ${cap(endMonth)} ${endYear}`;
  } else {
    return `${cap(startMonth)} ${startYear} - ${cap(endMonth)} ${endYear}`;
  }
}
