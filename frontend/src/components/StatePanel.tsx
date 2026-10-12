import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StatePanelProps {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "alert";
}

/** Shared dashed-outline panel for idle / empty / error states. */
export default function StatePanel({
  icon,
  title,
  children,
  action,
  tone = "neutral",
}: StatePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-row border border-dashed px-6 py-10 text-center",
        tone === "alert" ? "border-alert/60" : "border-muted/70"
      )}
    >
      <span className={cn("mb-1", tone === "alert" ? "text-alert" : "text-decorative")}>
        {icon}
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      {children ? (
        <div className="max-w-md text-sm text-ink/70">{children}</div>
      ) : null}
      {action}
    </div>
  );
}
