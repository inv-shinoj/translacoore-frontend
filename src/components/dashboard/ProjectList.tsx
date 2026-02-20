import ProjectCard from "./ProjectCard";

const projects = [
  {
    name: "Website Redesign",
    language: "English → French",
    progress: 72,
    status: "active" as const,
    assignees: ["Sarah Kim", "Marcus Chen", "Emily Davis"],
    dueDate: "Mar 15",
  },
  {
    name: "Mobile App v2",
    language: "English → German",
    progress: 45,
    status: "review" as const,
    assignees: ["James Wilson", "Aisha Patel"],
    dueDate: "Apr 02",
  },
  {
    name: "Marketing Campaign Q1",
    language: "English → Spanish",
    progress: 100,
    status: "completed" as const,
    assignees: ["Emily Davis", "Sarah Kim", "Marcus Chen", "James Wilson"],
    dueDate: "Feb 28",
  },
  {
    name: "Legal Documents",
    language: "English → Japanese",
    progress: 12,
    status: "draft" as const,
    assignees: ["Aisha Patel"],
    dueDate: "May 10",
  },
];

export default function ProjectList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map(p => (
        <ProjectCard key={p.name} {...p} />
      ))}
    </div>
  );
}
