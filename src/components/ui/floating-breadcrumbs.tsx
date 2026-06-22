"use client";

import { useEffect, useRef, useState, Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface FloatingBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function FloatingBreadcrumbs({ items }: FloatingBreadcrumbsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <>
      <div ref={ref}>
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground animate-fade-in font-medium">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <Fragment key={index}>
                {item.href && !isLast ? (
                  <Link href={item.href} className="transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-foreground" : ""}>{item.label}</span>
                )}
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </Fragment>
            );
          })}
        </nav>
      </div>

      <AnimatePresence>
        {!isVisible && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-lg rounded-full border bg-background/80 backdrop-blur-md px-6 py-3 flex items-center gap-1.5 text-sm font-medium"
          >
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <Fragment key={index}>
                  {item.href && !isLast ? (
                    <Link href={item.href} className="transition-colors hover:text-primary whitespace-nowrap">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={`whitespace-nowrap ${isLast ? "text-foreground font-semibold" : ""}`}>
                      {item.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                </Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
