import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { Project, ProjectStatus } from "@/types/api";

const statusMap: Record<
  ProjectStatus,
  { variant: "success" | "warning" | "info" | "default" }
> = {
  Active: { variant: "info" },
  Draft: { variant: "default" },
  Completed: { variant: "success" },
  Archived: { variant: "warning" },
};

export default function ProjectCard({ name, status_display, form_type_name, created_by_name, created_at }: Project) {
  const { variant } = statusMap[status_display] ?? { variant: "default" };
  const date = new Date(created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{form_type_name}</p>
        </div>
        <Badge variant={variant}>{status_display}</Badge>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Avatar name={created_by_name} size="sm" />
          <span className="text-xs text-gray-600">{created_by_name}</span>
        </div>
        <span className="text-xs text-gray-400">{date}</span>
      </div>
    </Card>
  );
}
