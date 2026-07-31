import React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "most-built-by": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: "with-logo" | "stacked" | "stacked-icon" | "badge" | "text" | "animated";
        theme?: "dark" | "light" | "gradient";
        size?: number | string;
      };
      "most-brand-logo": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: "full" | "icon" | "wordmark" | "original";
        theme?: "gradient" | "dark" | "light";
        size?: number | string;
      };
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "most-built-by": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: "with-logo" | "stacked" | "stacked-icon" | "badge" | "text" | "animated";
        theme?: "dark" | "light" | "gradient";
        size?: number | string;
      };
      "most-brand-logo": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: "full" | "icon" | "wordmark" | "original";
        theme?: "gradient" | "dark" | "light";
        size?: number | string;
      };
    }
  }
}
