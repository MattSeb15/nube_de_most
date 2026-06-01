"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

interface ScrollLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export function ScrollLink({ children, ...props }: ScrollLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        window.scrollTo(0, 0);
      }}
    >
      {children}
    </Link>
  );
}
