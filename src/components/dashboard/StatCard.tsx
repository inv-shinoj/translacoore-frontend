import Card from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: string;
}

const changeStyles = {
  positive: "text-emerald-600",
  negative: "text-red-600",
  neutral: "text-gray-500",
};

export default function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`mt-1 text-xs font-medium ${changeStyles[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </Card>
  );
}
