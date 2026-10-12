import { cn } from "@/lib/cn";

export interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date" | "number";
  min?: number;
  max?: number;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}

/** Labeled input (text, date, or number). Labels stay visible; errors are announced. */
export default function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
  placeholder,
  autoComplete = "off",
  error,
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-11 w-full rounded-field border bg-surface-strong px-3 text-sm text-ink outline-none transition-colors",
          "placeholder:text-muted",
          (type === "date" || type === "number") && "font-num",
          error ? "border-alert" : "border-hairline focus:border-decorative"
        )}
      />
      {error ? (
        <p id={errorId} className="text-xs font-semibold text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
