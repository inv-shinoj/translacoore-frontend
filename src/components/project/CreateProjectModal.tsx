"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createProject } from "@/store/slices/projectSlice";
import { fetchFormSchemas } from "@/store/slices/formSlice";
import { SchemaField } from "@/types/api";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Modal, { ModalBody, ModalFooter } from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import LoadingState from "@/components/ui/LoadingState";
import DynamicSchemaForm from "./DynamicSchemaForm";

interface Props {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const { submitting } = useAppSelector((s) => s.project);
  const activeFormTypes = useAppSelector((s) => s.form.types.filter((t) => t.is_active));
  const allSchemas = useAppSelector((s) => s.form.schemas);
  const schemasLoading = useAppSelector((s) => s.form.loading);

  const [formTypeKey, setFormTypeKey] = useState<number | "">(activeFormTypes[0]?.key ?? "");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch schemas once if not already loaded
  useEffect(() => {
    if (allSchemas.length === 0) {
      dispatch(fetchFormSchemas());
    }
  }, []);

  // Reset field values when form type changes
  useEffect(() => {
    setFieldValues({});
    setFieldErrors({});
  }, [formTypeKey]);

  const activeSchema = allSchemas.find(
    (s) => s.form_type === formTypeKey && s.status === "Active"
  );
  const schemaFields: SchemaField[] = activeSchema?.schema_json?.fields ?? [];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    schemaFields.forEach((f) => {
      if (f.required && !fieldValues[f.key]?.trim()) {
        errs[f.key] = "This field is required.";
      }
    });
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!formTypeKey || !validate()) return;

    const result = await dispatch(
      createProject({
        name: fieldValues["title"] ?? "",
        form_type: formTypeKey as number,
        project_data: fieldValues,
      })
    );

    if (createProject.fulfilled.match(result)) {
      onClose();
    } else {
      const err = result.payload as any;
      toast.error(
        typeof err === "string" ? err : err?.detail ?? "Failed to create project."
      );
    }
  };

  return (
    <Modal title="New Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <ModalBody>
          <FormField label="Form Type" required>
            {activeFormTypes.length === 0 ? (
              <Alert variant="warning">
                No active form types available. Please create one first.
              </Alert>
            ) : (
              <Select
                required
                value={formTypeKey}
                onChange={(e) => setFormTypeKey(Number(e.target.value))}
              >
                <option value="" disabled>Select a form type</option>
                {activeFormTypes.map((t) => (
                  <option key={t.id} value={t.key}>{t.name}</option>
                ))}
              </Select>
            )}
          </FormField>

          {/* Dynamic schema fields */}
          {formTypeKey && (
            schemasLoading ? (
              <LoadingState message="Loading schema…" size="sm" />
            ) : !activeSchema ? (
              <Alert variant="warning">
                No active schema for this form type. Please activate one first.
              </Alert>
            ) : (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">
                  Project Details — {activeSchema.name}
                </p>
                <DynamicSchemaForm
                  fields={schemaFields}
                  values={fieldValues}
                  errors={fieldErrors}
                  onChange={(key, value) =>
                    setFieldValues((prev) => ({ ...prev, [key]: value }))
                  }
                />
              </div>
            )
          )}

        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !activeSchema || activeFormTypes.length === 0}
          >
            {submitting ? "Creating…" : "Create Project"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

