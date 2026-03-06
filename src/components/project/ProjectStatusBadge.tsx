import Badge from "@/components/ui/Badge";
import { ProjectStatus } from "@/types/api";

const statusVariant: Record<ProjectStatus, "success" | "info" | "warning" | "default"> = {
  Active: "info",
  Draft: "default",
  Completed: "success",
  Archived: "warning",
};

interface Props {
  status: ProjectStatus;
}

export default function ProjectStatusBadge({ status }: Props) {
  return <Badge variant={statusVariant[status] ?? "default"}>{status}</Badge>;
}
