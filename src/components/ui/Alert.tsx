type AlertVariant = "warning" | "error" | "info" | "success";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  warning: "bg-amber-50 border-amber-200 text-amber-600",
  error: "bg-red-50 border-red-200 text-red-700",
  info: "bg-blue-50 border-blue-200 text-blue-600",
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

export default function Alert({
  variant = "info",
  children,
  className = "",
}: AlertProps) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm whitespace-pre-wrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
