"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createProject, clearProjectError } from "@/store/slices/projectSlice";
import { fetchFormSchemas } from "@/store/slices/formSlice";
import { SchemaField } from "@/types/api";
import Button from "@/components/ui/Button";
import DynamicSchemaForm from "./DynamicSchemaForm";

interface Props {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const { submitting, error } = useAppSelector((s) => s.project);
  const activeFormTypes = useAppSelector((s) => s.form.types.filter((t) => t.is_active));
  const allSchemas = useAppSelector((s) => s.form.schemas);
  const schemasLoading = useAppSelector((s) => s.form.loading);

  const [name, setName] = useState("");
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
    dispatch(clearProjectError());
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
        name,
        form_type: formTypeKey as number,
        project_data: fieldValues,
      })
    );

    if (createProject.fulfilled.match(result)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable body + footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Annual Report 2026"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Form Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form Type <span className="text-red-500">*</span>
              </label>
              {activeFormTypes.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No active form types available. Please create one first.
                </p>
              ) : (
                <select
                  required
                  value={formTypeKey}
                  onChange={(e) => setFormTypeKey(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  <option value="" disabled>Select a form type</option>
                  {activeFormTypes.map((t) => (
                    <option key={t.id} value={t.key}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Dynamic schema fields */}
            {formTypeKey && (
              schemasLoading ? (
                <p className="text-sm text-gray-400 py-2">Loading schema…</p>
              ) : !activeSchema ? (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No active schema for this form type. Please activate one first.
                </p>
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

            {/* API error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 whitespace-pre-wrap">
                {typeof error === "string" ? error : JSON.stringify(error, null, 2)}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
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
          </div>
        </form>
      </div>
    </div>
  );
}

