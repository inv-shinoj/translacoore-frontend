"use client";

import { useEffect, useRef, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FormSchema, FormType, FormTypeKey } from "@/types/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchFormTypes,
  fetchFormSchemas,
  uploadSchema,
  activateSchema,
  deleteSchema,
  clearFormError,
} from "@/store/slices/formSlice";


// ─── Upload Panel ──────────────────────────────────────────────────────────

interface UploadFormState {
  name: string;
  form_type: FormTypeKey | "";
  file: File | null;
  previewError: string | null;
  previewJson: string | null;
}

interface UploadPanelProps {
  types: FormType[];
  submitting: boolean;
  error: string | null;
  onClearError: () => void;
}

function UploadPanel({ types, submitting, error, onClearError }: UploadPanelProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<UploadFormState>({
    name: "",
    form_type: "",
    file: null,
    previewError: null,
    previewJson: null,
  });
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".json")) {
      setForm(f => ({ ...f, file: null, previewError: "Only .json files are allowed.", previewJson: null }));
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setForm(f => ({
          ...f,
          file,
          previewError: null,
          previewJson: JSON.stringify(parsed, null, 2),
        }));
      } catch {
        setForm(f => ({ ...f, file: null, previewError: "Invalid JSON file.", previewJson: null }));
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.form_type || !form.file) return;
    onClearError();
    const result = await dispatch(
      uploadSchema({ name: form.name.trim(), form_type: form.form_type, schema_file: form.file })
    );
    if (uploadSchema.fulfilled.match(result)) {
      setForm({ name: "", form_type: "", file: null, previewError: null, previewJson: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const canSubmit = !submitting && form.name.trim() && form.form_type && form.file && !form.previewError;

  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Upload Schema</h2>

      <div className="space-y-4">
        {/* Server error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 flex items-start justify-between gap-2">
            <span>{typeof error === "string" ? error : "Upload failed. Check the file and try again."}</span>
            <button onClick={onClearError} className="shrink-0 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Schema Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Project Schema v3"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Form Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Form Type <span className="text-red-500">*</span>
          </label>
          <select
            value={form.form_type}
            onChange={e => setForm(f => ({ ...f, form_type: Number(e.target.value) as FormTypeKey | "" }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          >
            <option value="">Select a form type...</option>
            {types.map(t => (
              <option key={t.id} value={t.key}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* File Drop Zone */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            JSON File <span className="text-red-500">*</span>
          </label>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-gray-900 bg-gray-50"
                : form.file
                ? "border-emerald-400 bg-emerald-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
            {form.file ? (
              <div>
                <p className="text-2xl mb-1">✅</p>
                <p className="text-sm font-medium text-emerald-700">{form.file.name}</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {(form.file.size / 1024).toFixed(1)} KB — click to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl mb-1">📂</p>
                <p className="text-sm text-gray-600">
                  Drag & drop a <span className="font-medium">.json</span> file, or{" "}
                  <span className="text-gray-900 font-medium underline">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">Only .json files are accepted</p>
              </div>
            )}
          </div>

          {form.previewError && (
            <p className="mt-1.5 text-xs text-red-600">{form.previewError}</p>
          )}
        </div>

        {/* JSON Preview */}
        {form.previewJson && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Preview</label>
            <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-3 overflow-auto max-h-48 font-mono">
              {form.previewJson.length > 1000
                ? form.previewJson.slice(0, 1000) + "\n... (truncated)"
                : form.previewJson}
            </pre>
          </div>
        )}

        {/* Submit */}
        <Button className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? "Uploading..." : "Upload Schema"}
        </Button>
      </div>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function FormsPage() {
  const dispatch = useAppDispatch();
  const { types, schemas, loading, submitting, error } = useAppSelector(state => state.form);
  const [filterType, setFilterType] = useState<FormTypeKey | "All">("All");

  useEffect(() => {
    dispatch(fetchFormTypes());
    dispatch(fetchFormSchemas());
  }, [dispatch]);

  const filtered =
    filterType === "All"
      ? schemas
      : schemas.filter(s => s.form_type === filterType);

  const typeNameMap = Object.fromEntries(types.map(t => [t.key, t.name])) as Record<FormTypeKey, string>;

  const columns = [
    {
      key: "name",
      header: "Schema Name",
      render: (s: FormSchema) => (
        <p className="font-medium text-gray-900">{s.name}</p>
      ),
    },
    {
      key: "form_type",
      header: "Form Type",
      render: (s: FormSchema) => (
        <span className="text-gray-600">{typeNameMap[s.form_type] ?? s.form_type}</span>
      ),
    },
    {
      key: "version",
      header: "Version",
      render: (s: FormSchema) => (
        <span className="text-gray-500 font-mono text-sm">v{s.version}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s: FormSchema) => (
        <Badge variant={s.status === "Active" ? "success" : "default"}>{s.status}</Badge>
      ),
    },
    {
      key: "created_at",
      header: "Uploaded",
      render: (s: FormSchema) => (
        <span className="text-gray-500 text-sm">
          {new Date(s.created_at).toLocaleDateString("en-US", {
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
      render: (s: FormSchema) => (
        <div className="flex items-center gap-2 justify-end">
          {s.status !== "Active" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={submitting}
              onClick={() => dispatch(activateSchema({ id: s.id, form_type: s.form_type }))}
            >
              Activate
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={submitting}
            onClick={() => dispatch(deleteSchema(s.id))}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Form Schemas"
        description="Upload and manage JSON schemas for each form type."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <div className="xl:col-span-1">
          <UploadPanel
            types={types}
            submitting={submitting}
            error={error}
            onClearError={() => dispatch(clearFormError())}
          />
        </div>

        {/* Schema List */}
        <div className="xl:col-span-2">
          <Card padding="none">
            {/* Header + filter tabs */}
            <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-900 flex-1">Uploaded Schemas</h2>
              <div className="flex items-center gap-1 flex-wrap">
                {(["All", ...types.map(t => t.key)] as (FormTypeKey | "All")[]).map(key => {
                  const isAll = key === "All";
                  const count = isAll ? schemas.length : schemas.filter(s => s.form_type === key).length;
                  const label = isAll ? "All" : (typeNameMap[key as FormTypeKey] ?? key);
                  const isActive = filterType === key;
                  return (
                    <button
                      key={String(key)}
                      onClick={() => setFilterType(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {label}
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Loading schemas...</div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No schemas found"
                description={
                  filterType === "All"
                    ? "No schemas uploaded yet."
                    : `No schemas for ${typeNameMap[filterType as FormTypeKey] ?? filterType} yet.`
                }
              />
            ) : (
              <Table columns={columns} data={filtered} keyExtractor={s => s.id} />
            )}

            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {schemas.length} schemas
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
