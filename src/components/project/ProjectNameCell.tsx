import Avatar from "@/components/ui/Avatar";

interface Props {
  name: string;
  subtitle?: string | null;
}

export default function ProjectNameCell({ name, subtitle }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="sm" />
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}
