"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProject } from "@/store/slices/projectSlice";
import { ProjectDetail, ProjectStatus, SchemaField } from "@/types/api";
import { toast } from "sonner";
import Modal, { ModalBody, ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import LoadingState from "@/components/ui/LoadingState";
import DynamicSchemaForm from "./DynamicSchemaForm";

interface Props {
  projectId: string;
  onClose: () => void;
}

type StatusCode = 1 | 2 | 3 | 4;

const STATUS_LABEL: Record<StatusCode, ProjectStatus> = {
  1: "Draft",
  2: "Active",
  3: "Completed",
  4: "Archived",
};

const ALLOWED_TRANSITIONS: Record<StatusCode, StatusCode[]> = {
  1: [1, 2, 4],
  2: [2, 3, 4],
  3: [3, 4],
  4: [4],
};

export default function EditProjectModal({ projectId, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { submitting } = useAppSelector((s) => s.project);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [status, setStatus] = useState<StatusCode>(2);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadProject = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get<ProjectDetail>(`/api/project/${projectId}/`);
      const detail = res.data;
      setProject(detail);
      setName(detail.name ?? "");
      setStatus(detail.status as StatusCode);

      const normalizedValues = Object.entries(detail.project_data ?? {}).reduce(
        (acc, [key, value]) => {
          acc[key] = value === null || value === undefined ? "" : String(value);
          return acc;
        },
        {} as Record<string, string>
      );
      setFieldValues(normalizedValues);
      setFieldErrors({});
    } catch (err: any) {
      setLoadError(err?.response?.data?.detail ?? "Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const schemaFields: SchemaField[] = project?.schema_fields ?? [];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.__name = "Project name is required.";
    }

    schemaFields.forEach((field) => {
      if (field.required && !fieldValues[field.key]?.trim()) {
        errs[field.key] = "This field is required.";
      }
    });

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const allowedStatuses = useMemo<StatusCode[]>(() => {
    const current = project?.status as StatusCode | undefined;
    if (!current) return [status];
    return ALLOWED_TRANSITIONS[current] ?? [current];
  }, [project?.status, status]);

  const isContentReadOnly = project
    ? project.status === 3 || project.status === 4
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !validate()) return;

    const payload = isContentReadOnly
      ? { status }
      : {
          name: name.trim(),
          project_data: fieldValues,
          status,
        };

    const result = await dispatch(
      updateProject({
        projectId: project.id,
        payload,
      })
    );

    if (updateProject.fulfilled.match(result)) {
      toast.success("Project updated.");
      onClose();
      return;
    }

    const err = result.payload as any;
    if (typeof err === "string") {
      toast.error(err);
      return;
    }

    const statusError = err?.status?.[0] ?? err?.status;
    if (statusError) {
      toast.error(statusError);
      return;
    }

    toast.error(err?.detail ?? "Failed to update project.");
  };

  return (
    <Modal title="Edit Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <ModalBody>
          {loading ? (
            <LoadingState message="Loading project details…" size="sm" />
          ) : loadError ? (
            <div className="space-y-3">
              <Alert variant="error">{loadError}</Alert>
              <Button type="button" variant="secondary" size="sm" onClick={loadProject}>
                Retry
              </Button>
            </div>
          ) : !project ? (
            <Alert variant="error">Project not found.</Alert>
          ) : (
            <div className="space-y-4">
              <FormField label="Project Name" required error={fieldErrors.__name}>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={!!fieldErrors.__name}
                  disabled={isContentReadOnly}
                />
              </FormField>

              <FormField label="Status" required>
                <Select
                  value={status}
                  onChange={(e) => setStatus(Number(e.target.value) as StatusCode)}
                >
                  {allowedStatuses.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </FormField>

              <Alert variant="info">
                Completion requires at least one document and all documents completed. Archiving is blocked while documents are translating.
              </Alert>

              {isContentReadOnly && (
                <Alert variant="warning">
                  Project content is read-only in the current lifecycle state. You can only apply allowed status transitions.
                </Alert>
              )}

              {schemaFields.length > 0 ? (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">
                    Project Details
                  </p>
                  <DynamicSchemaForm
                    fields={schemaFields}
                    values={fieldValues}
                    errors={fieldErrors}
                    disabled={isContentReadOnly}
                    onChange={(key, value) => setFieldValues((prev) => ({ ...prev, [key]: value }))}
                  />
                </div>
              ) : (
                <Alert variant="warning">No schema fields found for this project.</Alert>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting || loading || !!loadError || !project}>
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
