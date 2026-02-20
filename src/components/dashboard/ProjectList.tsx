import { Project } from "@/types/api";
import ProjectCard from "./ProjectCard";
import EmptyState from "@/components/ui/EmptyState";

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return <EmptyState title="No projects yet" description="Create your first project to get started." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map(p => (
        <ProjectCard key={p.id} {...p} />
      ))}
    </div>
  );
}
