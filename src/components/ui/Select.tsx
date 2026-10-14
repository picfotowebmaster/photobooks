"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "admin";
}

const focusStyles = {
  default: "focus:border-primary-500 focus:ring-1 focus:ring-primary-500",
  admin: "focus:ring-2 focus:ring-admin-500",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white outline-none",
        focusStyles[variant],
        className
      )}
      {...props}
    />
  )
);

Select.displayName = "Select";
