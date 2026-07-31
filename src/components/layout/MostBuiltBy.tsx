"use client";

import { useEffect, useRef, useState } from "react";

interface MostBuiltByProps {
  variant?: "with-logo" | "stacked" | "stacked-icon" | "badge" | "text" | "animated";
  theme?: "dark" | "light" | "gradient";
  size?: number;
  className?: string;
}

export function MostBuiltBy({
  variant = "with-logo",
  theme = "gradient",
  size = 14,
  className,
}: MostBuiltByProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("moststudio-brand").then(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const el = containerRef.current.querySelector("most-built-by");
    if (el && el.shadowRoot && !el.shadowRoot.querySelector("#hover-fix")) {
      const style = document.createElement("style");
      style.id = "hover-fix";
      style.textContent = `
        .built-by-link:hover {
          color: var(--foreground, #0f172a) !important;
        }
      `;
      el.shadowRoot.appendChild(style);
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <a
        href="https://moststudio.pro"
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        Construido por <span className="font-bold text-foreground">Most Studio</span>
      </a>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{
        __html: `<most-built-by variant="${variant}" theme="${theme}" size="${size}"></most-built-by>`,
      }}
    />
  );
}
