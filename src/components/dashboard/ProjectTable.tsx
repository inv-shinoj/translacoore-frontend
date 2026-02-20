import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Table from "@/components/ui/Table";
import Avatar from "@/components/ui/Avatar";

interface Project {
  id: number;
  name: string;
  language: string;
  progress: number;
  status: "active" | "review" | "completed" | "draft";
  lead: string;
  forms: number;
}

const statusVariant: Record<
  Project["status"],
  "info" | "warning" | "success" | "default"
> = {
  active: "info",
  review: "warning",
  completed: "success",
  draft: "default",
};

const projects: Project[] = [
  { id: 1, name: "Website Redesign", language: "EN → FR", progress: 72, status: "active", lead: "Sarah Kim", forms: 14 },
  { id: 2, name: "Mobile App v2", language: "EN → DE", progress: 45, status: "review", lead: "Marcus Chen", forms: 8 },
  { id: 3, name: "Marketing Campaign Q1", language: "EN → ES", progress: 100, status: "completed", lead: "Emily Davis", forms: 6 },
  { id: 4, name: "Legal Documents", language: "EN → JA", progress: 12, status: "draft", lead: "James Wilson", forms: 3 },
  { id: 5, name: "E-commerce Platform", language: "EN → PT", progress: 58, status: "active", lead: "Aisha Patel", forms: 11 },
];

const columns = [
  {
    key: "name",
    header: "Project",
    render: (p: Project) => (
      <div className="flex items-center gap-3">
        <Avatar name={p.name} size="sm" />
        <div>
          <p className="font-medium text-gray-900">{p.name}</p>
          <p className="text-xs text-gray-400">{p.language}</p>
        </div>
      </div>
    ),
  },
  {
    key: "progress",
    header: "Progress",
    render: (p: Project) => (
      <div className="w-32">
        <ProgressBar value={p.progress} showLabel />
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (p: Project) => (
      <Badge variant={statusVariant[p.status]}>
        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
      </Badge>
    ),
  },
  {
    key: "lead",
    header: "Lead",
    render: (p: Project) => (
      <div className="flex items-center gap-2">
        <Avatar name={p.lead} size="sm" />
        <span className="text-gray-700">{p.lead}</span>
      </div>
    ),
  },
  {
    key: "forms",
    header: "Forms",
    render: (p: Project) => (
      <span className="text-gray-600">{p.forms}</span>
    ),
    className: "text-center",
  },
];

export default function ProjectTable() {
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
