import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30 p-8 text-center animate-fade-in transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700",
        className
      )}
      {...props}
    >
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 ring-4 ring-neutral-500/5 transition-transform duration-300 group-hover:scale-105">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
        <Icon className="relative size-7 text-neutral-400 dark:text-neutral-500" />
      </div>

      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
