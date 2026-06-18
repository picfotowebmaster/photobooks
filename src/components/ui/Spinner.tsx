import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600",
        sizes[size],
        className
      )}
      role="status"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
