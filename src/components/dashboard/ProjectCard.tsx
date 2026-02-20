import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Avatar from "@/components/ui/Avatar";

interface ProjectCardProps {
  name: string;
  language: string;
  progress: number;
  status: "active" | "review" | "completed" | "draft";
  assignees: string[];
  dueDate: string;
}

const statusMap: Record<
  ProjectCardProps["status"],
  { label: string; variant: "success" | "warning" | "info" | "default" }
> = {
  active: { label: "Active", variant: "info" },
  review: { label: "In Review", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  draft: { label: "Draft", variant: "default" },
};

export default function ProjectCard({
  name,
  language,
  progress,
  status,
  assignees,
  dueDate,
}: ProjectCardProps) {
  const { label, variant } = statusMap[status];

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{language}</p>
        </div>
        <Badge variant={variant}>{label}</Badge>
      </div>

      <ProgressBar value={progress} showLabel className="mb-4" />

      <div className="flex items-center justify-between">
        {/* Assignee avatars */}
        <div className="flex -space-x-2">
          {assignees.slice(0, 3).map(name => (
            <Avatar key={name} name={name} size="sm" />
          ))}
          {assignees.length > 3 && (
            <span className="w-7 h-7 rounded-full bg-gray-200 text-xs flex items-center justify-center text-gray-600 font-medium ring-2 ring-white">
              +{assignees.length - 3}
            </span>
          )}
        </div>

        <span className="text-xs text-gray-400">Due {dueDate}</span>
      </div>
    </Card>
  );
}
