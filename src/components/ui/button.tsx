import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] shadow-sm shadow-zinc-900/10",
  secondary:
    "bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] shadow-sm shadow-orange-500/25",
  outline:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-400 active:scale-[0.98]",
  ghost: "text-zinc-700 hover:bg-zinc-100 active:scale-[0.98]",
  danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-sm",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
