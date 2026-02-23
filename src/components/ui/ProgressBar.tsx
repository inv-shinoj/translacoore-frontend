type ProgressColor = "default" | "success" | "warning" | "error";

interface ProgressBarProps {
  value: number;        // 0–100
  color?: ProgressColor;
  showLabel?: boolean;
  className?: string;
}

const colorStyles: Record<ProgressColor, string> = {
  default: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

function autoColor(value: number): ProgressColor {
  if (value >= 75) return "success";
  if (value >= 40) return "warning";
  return "default";
}

export default function ProgressBar({
  value,
  color,
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const resolved = color ?? autoColor(value);
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorStyles[resolved]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 tabular-nums w-8 text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
