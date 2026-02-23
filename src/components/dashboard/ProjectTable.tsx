import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Avatar from "@/components/ui/Avatar";
import { Project, ProjectStatus } from "@/types/api";

interface ProjectTableProps {
  projects: Project[];
}

const statusVariant: Record<ProjectStatus, "info" | "warning" | "success" | "default"> = {
  Active: "info",
  Draft: "default",
  Completed: "success",
  Archived: "warning",
};

const columns = [
  {
    key: "name",
    header: "Project",
    render: (p: Project) => (
      <div className="flex items-center gap-3">
        <Avatar name={p.name} size="sm" />
        <div>
          <p className="font-medium text-gray-900">{p.name}</p>
          <p className="text-xs text-gray-400">{p.form_type_name}</p>
        </div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (p: Project) => (
      <Badge variant={statusVariant[p.status_display] ?? "default"}>
        {p.status_display}
      </Badge>
    ),
  },
  {
    key: "created_by_name",
    header: "Created By",
    render: (p: Project) => (
      <div className="flex items-center gap-2">
        <Avatar name={p.created_by_name} size="sm" />
        <span className="text-gray-700">{p.created_by_name}</span>
      </div>
    ),
  },
  {
    key: "created_at",
    header: "Created",
    render: (p: Project) => (
      <span className="text-gray-500 text-sm">
        {new Date(p.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
];

export default function ProjectTable({ projects }: ProjectTableProps) {
  return (
    <Card padding="none">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">All Projects</h2>
        <span className="text-xs text-gray-400">{projects.length} projects</span>
      </div>
      <Table columns={columns} data={projects} keyExtractor={p => p.id} />
    </Card>
  );
}
