import { Laptop, Calculator, Zap, Microscope, PenTool } from "lucide-react";
import React from "react";

const iconMap = {
  programacion: Laptop,
  matematica: Calculator,
  fisica: Zap,
  metodologia: Microscope,
  comunicacion: PenTool,
} as const;

export type MateriaIconKey = keyof typeof iconMap;

interface MateriaIconProps extends React.ComponentPropsWithoutRef<"svg"> {
  name: string;
}

export function MateriaIcon({ name, className, ...props }: MateriaIconProps) {
  const IconComponent = iconMap[name as MateriaIconKey];

  if (!IconComponent) {
    // Return a default fallback if the name is not found
    return (
      <Laptop
        className={className}
        fill="currentColor"
        strokeWidth={1.5}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      className={className}
      fill="currentColor"
      strokeWidth={1.5}
      {...props}
    />
  );
}
