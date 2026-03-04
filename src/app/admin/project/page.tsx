"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import AddMembersModal from "@/components/project/AddMembersModal";
import { Project, ProjectStatus } from "@/types/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProjects, clearProjectError } from "@/store/slices/projectSlice";
import { fetchFormTypes } from "@/store/slices/formSlice";

const statusVariant: Record<ProjectStatus, "info" | "warning" | "success" | "default"> = {
  Active: "info",
  Draft: "default",
  Completed: "success",
  Archived: "warning",
};

const tabs: { label: string; value: ProjectStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Active", value: "Active" },
];

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<ProjectStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [memberProject, setMemberProject] = useState<Project | null>(null);

  const dispatch = useAppDispatch();
  const { projects, loading } = useAppSelector(state => state.project);
  const user = useAppSelector(state => state.auth.user);
  const formTypes = useAppSelector(state => state.form.types);

  const canCreate = user?.role === "Admin" || user?.role === "Manager";

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
        <Badge variant={statusVariant[p.status_display]}>{p.status_display}</Badge>
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
    {
      key: "updated_at",
      header: "Last Updated",
      render: (p: Project) => (
        <span className="text-gray-500 text-sm">
          {new Date(p.updated_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
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
          <Button variant="ghost" size="sm">View</Button>
          <Button variant="secondary" size="sm">Edit</Button>
        </div>
      ),
    },
  ];

  const filtered = projects.filter(p => {
    const matchesTab = activeTab === "All" || p.status_display === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    dispatch(fetchProjects());
    if (formTypes.length === 0) {
      dispatch(fetchFormTypes());
    }
  }, [dispatch]);

  const handleCloseModal = () => {
    setShowModal(false);
    dispatch(clearProjectError());
  };

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
        {/* Search + Tab filters */}
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />

          {/* Tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {tabs.map(tab => {
              const count =
                tab.value === "All"
                  ? projects.length
                  : projects.filter(p => p.status_display === tab.value).length;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table or Empty */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No projects found"
            description={
              search
                ? `No projects match "${search}"`
                : `No ${activeTab.toLowerCase()} projects yet.`
            }
          />
        ) : (
          <Table columns={columns} data={filtered} keyExtractor={p => p.id} />
        )}

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {projects.length} projects
        </div>
      </Card>

      {showModal && <CreateProjectModal onClose={handleCloseModal} />}
      {memberProject && (
        <AddMembersModal
          projectId={memberProject.id}
          projectName={memberProject.name}
          onClose={() => setMemberProject(null)}
        />
      )}
    </>
  );
}
