import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "quiet";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseClasses =
  "inline-flex h-11 items-center justify-center gap-2 rounded-field px-5 text-sm font-semibold transition-[filter,background-color,border-color] duration-150 disabled:pointer-events-none disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-ink hover:brightness-95 active:brightness-90",
  quiet: "border border-hairline bg-surface-strong text-ink hover:bg-page",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  );
});

export default Button;
