import Badge from "@/components/ui/Badge";
import { DocumentStatus } from "@/types/api";

const statusVariant: Record<DocumentStatus, "info" | "warning" | "success" | "error"> = {
  Uploaded: "info",
  Translating: "warning",
  Completed: "success",
  Failed: "error",
};

interface Props {
  status: DocumentStatus;
}

export default function DocumentStatusBadge({ status }: Props) {
  return <Badge variant={statusVariant[status] ?? "default"}>{status}</Badge>;
}
