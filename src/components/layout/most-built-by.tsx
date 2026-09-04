"use client";

import { useEffect, useState } from "react";

export function MostBuiltBy() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Importar dinámicamente para evitar errores de SSR con custom elements
    import("moststudio-brand").catch(console.error);
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height: "40px", width: "160px" }}></div>;
  }

  return (
    // @ts-ignore
    <most-built-by variant="animated" theme="dark"></most-built-by>
  );
}
