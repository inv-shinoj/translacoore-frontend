"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Avatar from "@/components/ui/Avatar";
import TableToolbar from "@/components/ui/TableToolbar";
import TableFooter from "@/components/ui/TableFooter";
import EmptyState from "@/components/ui/EmptyState";
import ProjectStatusBadge from "@/components/project/ProjectStatusBadge";
import ProjectNameCell from "@/components/project/ProjectNameCell";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import AddMembersModal from "@/components/project/AddMembersModal";
import EditProjectModal from "@/components/project/EditProjectModal";
import { Project, ProjectStatus } from "@/types/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProjects, clearProjectError } from "@/store/slices/projectSlice";
import { fetchFormTypes } from "@/store/slices/formSlice";
import { FilterTab } from "@/components/ui/FilterTabs";

type TabValue = ProjectStatus | "All";

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [memberProject, setMemberProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { projects, loading } = useAppSelector((state) => state.project);
  const user = useAppSelector((state) => state.auth.user);
  const formTypes = useAppSelector((state) => state.form.types);

  const canCreate = user?.role === "Admin" || user?.role === "Manager";

  const tabs: FilterTab<TabValue>[] = [
    { key: "All", label: "All", count: projects.length },
    { key: "Active", label: "Active", count: projects.filter((p) => p.status_display === "Active").length },
    { key: "Draft", label: "Draft", count: projects.filter((p) => p.status_display === "Draft").length },
    { key: "Completed", label: "Completed", count: projects.filter((p) => p.status_display === "Completed").length },
    { key: "Archived", label: "Archived", count: projects.filter((p) => p.status_display === "Archived").length },
  ];

  const columns = [
    {
      key: "name",
      header: "Project",
      render: (p: Project) => (
        <ProjectNameCell name={p.name} subtitle={p.form_type_name} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p: Project) => <ProjectStatusBadge status={p.status_display} />,
    },
    {
      key: "created_by_name",
      header: "Created By",
      render: (p: Project) => (
        <div className="flex items-center gap-2">
          <Avatar name={p.created_by_name} size="sm" />
          <span className="text-gray-700">{p.created_by_name ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (p: Project) => (
        <span className="text-gray-500 text-sm">
          {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "updated_at",
      header: "Last Updated",
      render: (p: Project) => (
        <span className="text-gray-500 text-sm">
          {new Date(p.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p: Project) => (
        <div className="flex items-center gap-2 justify-end">
          {canCreate && (
            <Button variant="ghost" size="sm" onClick={() => setMemberProject(p)}>
              Members
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/project/${p.id}`)}>View</Button>
          {canCreate && (
            <Button variant="secondary" size="sm" onClick={() => setEditProject(p)}>
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filtered = projects.filter((p) => {
    const matchesTab = activeTab === "All" || p.status_display === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    dispatch(fetchProjects());
    if (formTypes.length === 0) dispatch(fetchFormTypes());
  }, [dispatch]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage and track all translation projects."
        actions={
          canCreate ? (
            <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
              + New Project
            </Button>
          ) : undefined
        }
      />

      <Card padding="none">
        <TableToolbar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search projects..."
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No projects found"
            description={search ? `No projects match "${search}"` : `No ${activeTab.toLowerCase()} projects yet.`}
          />
        ) : (
          <Table columns={columns} data={filtered} keyExtractor={(p) => p.id} />
        )}

        <TableFooter shown={filtered.length} total={projects.length} label="projects" />
      </Card>

      {showModal && <CreateProjectModal onClose={() => { setShowModal(false); dispatch(clearProjectError()); }} />}
      {memberProject && (
        <AddMembersModal
          projectId={memberProject.id}
          projectName={memberProject.name}
          onClose={() => setMemberProject(null)}
        />
      )}
      {editProject && (
        <EditProjectModal
          projectId={editProject.id}
          onClose={() => setEditProject(null)}
        />
      )}
    </>
  );
}
