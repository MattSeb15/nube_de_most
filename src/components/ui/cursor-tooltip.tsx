"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export function CursorTooltipProvider({ children }: { children: React.ReactNode }) {
  const [activeTooltip, setActiveTooltip] = useState<{ text: string; color?: string } | null>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    let lastCheck = 0;

    const checkHover = (time: number) => {
      // Throttle to ~30fps for performance to check what element is actually under the cursor
      // This is necessary because CSS animations moving elements do not trigger standard mouse events
      if (time - lastCheck > 33) {
        const { x, y } = mousePos.current;
        if (x >= 0 && y >= 0) {
          const el = document.elementFromPoint(x, y) as HTMLElement | null;
          const tooltipEl = el?.closest("[data-cursor-tooltip]");

          if (tooltipEl) {
            const text = tooltipEl.getAttribute("data-cursor-tooltip") || "";
            const color = tooltipEl.getAttribute("data-cursor-color") || undefined;
            
            setActiveTooltip((prev) => {
              if (prev?.text === text && prev?.color === color) return prev;
              return { text, color };
            });
          } else {
            setActiveTooltip((prev) => (prev ? null : prev));
          }
        }
        lastCheck = time;
      }
      animationFrameId = requestAnimationFrame(checkHover);
    };

    animationFrameId = requestAnimationFrame(checkHover);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [cursorX, cursorY]);

  const isVisible = !!activeTooltip;
  const currentText = activeTooltip?.text || "";
  const currentColor = activeTooltip?.color;

  return (
    <>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="cursor-tooltip"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{
              x: cursorXSpring,
              y: cursorYSpring,
              position: "fixed",
              top: 0,
              left: 0,
              pointerEvents: "none",
              zIndex: 99999,
            }}
            className="ml-4 mt-4" // offset from the actual cursor
          >
            <div 
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-xl backdrop-blur-sm border ${!currentColor ? 'bg-primary/95 text-primary-foreground border-primary-foreground/20' : ''}`}
              style={currentColor ? {
                backgroundColor: currentColor,
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.25)',
                textShadow: '0px 1px 3px rgba(0,0,0,0.5)',
                boxShadow: `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px ${currentColor}80`
              } : undefined}
            >
              {currentText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function MouseTooltip({ 
  children, 
  text, 
  color,
  className 
}: { 
  children: React.ReactNode; 
  text: string;
  color?: string;
  className?: string;
}) {
  return (
    <div 
      className={className || "contents"}
      data-cursor-tooltip={text}
      data-cursor-color={color || ""}
    >
      {children}
    </div>
  );
}
