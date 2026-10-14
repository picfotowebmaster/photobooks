"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "admin";
}

const focusStyles = {
  default: "focus:border-primary-500 focus:ring-1 focus:ring-primary-500",
  admin: "focus:ring-2 focus:ring-admin-500",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none",
        focusStyles[variant],
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
