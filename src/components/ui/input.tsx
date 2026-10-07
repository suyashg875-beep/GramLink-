import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        [
          "flex h-11 w-full rounded-xl",
          "border border-input bg-card",
          "px-3.5 py-2 text-sm font-medium text-foreground",
          "shadow-sm transition-all duration-200",
          "placeholder:text-muted-foreground/65",
          "outline-none",
          "focus:border-primary focus:ring-4 focus:ring-primary/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent",
          "file:text-sm file:font-medium file:text-foreground",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };