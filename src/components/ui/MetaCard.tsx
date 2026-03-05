interface MetaCardProps {
  label: string;
  value: string | number;
}

export default function MetaCard({ label, value }: MetaCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{String(value)}</p>
    </div>
  );
}
