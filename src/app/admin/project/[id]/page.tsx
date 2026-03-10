"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProjectDetail } from "@/store/slices/projectSlice";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import ProjectStatusBadge from "@/components/project/ProjectStatusBadge";
import AddMembersModal from "@/components/project/AddMembersModal";
import MetaCard from "@/components/ui/MetaCard";
import DocumentUploadPanel from "@/components/project/DocumentUploadPanel";
import DocumentList from "@/components/project/DocumentList";

export default function AdminProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showMembersModal, setShowMembersModal] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentProject: project, currentProjectLoading: loading, error } =
    useAppSelector((s) => s.project);

  useEffect(() => {
    if (id) dispatch(fetchProjectDetail(id));
  }, [id, dispatch]);

  if (loading) return <LoadingState message="Loading project…" />;

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-red-600">{error ?? "Project not found."}</p>
        <Button variant="secondary" onClick={() => router.back()}>
          ← Go back
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${project.form_type_name} · Created by ${project.created_by_name ?? "—"}`}
        actions={
          <div className="flex items-center gap-2">
            <ProjectStatusBadge status={project.status_display} />
            <Button variant="primary" size="sm" onClick={() => setShowMembersModal(true)}>
              Members
            </Button>
            <Button variant="secondary" size="sm" onClick={() => router.back()}>
              ← Back
            </Button>
          </div>
        }
      />

      {/* Project data fields */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Project Data</h2>
        </div>

        {project.schema_fields.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">No fields defined for this schema.</p>
        ) : (
          <dl className="divide-y divide-gray-100">
            {project.schema_fields.map((field) => {
              const value = project.project_data?.[field.key];
              return (
                <div key={field.key} className="px-5 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    {field.label}
                    {field.required && (
                      <span className="text-red-400 text-xs">*</span>
                    )}
                  </dt>
                  <dd className="col-span-2 text-sm text-gray-900">
                    {value !== undefined && value !== null && value !== "" ? (
                      String(value)
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetaCard label="Status" value={project.status_display} />
        <MetaCard label="Form Type" value={project.form_type_name} />
        <MetaCard label="Created By" value={project.created_by_name ?? "—"} />
        <MetaCard
          label="Last Updated"
          value={new Date(project.updated_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        />
      </div>

      {/* ── Documents section ─────────────────── */}
      <div className="mt-6 space-y-4">
        <DocumentUploadPanel projectId={project.id} />
        <DocumentList projectId={project.id} canDelete />
      </div>

      {showMembersModal && (
        <AddMembersModal
          projectId={project.id}
          projectName={project.name}
          onClose={() => setShowMembersModal(false)}
        />
      )}
    </>
  );
}
