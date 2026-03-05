"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import JsonFileDropZone from "@/components/ui/JsonFileDropZone";
import { toast } from "sonner";
import { FormType, FormTypeKey } from "@/types/api";
import { useAppDispatch } from "@/store/hooks";
import { uploadSchema } from "@/store/slices/formSlice";

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
}

export default function UploadPanel({ types, submitting }: UploadPanelProps) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<UploadFormState>({
    name: "",
    form_type: "",
    file: null,
    previewError: null,
    previewJson: null,
  });

  const handleFileChange = (file: File, previewJson: string) => {
    setForm((f) => ({ ...f, file, previewError: null, previewJson }));
  };

  const handleFileError = (message: string) => {
    setForm((f) => ({ ...f, file: null, previewError: message, previewJson: null }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.form_type || !form.file) return;
    const result = await dispatch(
      uploadSchema({ name: form.name.trim(), form_type: form.form_type, schema_file: form.file })
    );
    if (uploadSchema.fulfilled.match(result)) {
      setForm({ name: "", form_type: "", file: null, previewError: null, previewJson: null });
      toast.success("Schema uploaded successfully.");
    } else {
      const msg =
        typeof result.payload === "string"
          ? result.payload
          : (result.error?.message ?? "Upload failed. Check the file and try again.");
      toast.error(msg);
    }
  };

  const canSubmit = !submitting && form.name.trim() && form.form_type && form.file && !form.previewError;

  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Upload Schema</h2>

      <div className="space-y-4">
        {/* Schema Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Schema Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Project Schema v3"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
            onChange={(e) =>
              setForm((f) => ({ ...f, form_type: Number(e.target.value) as FormTypeKey | "" }))
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          >
            <option value="">Select a form type...</option>
            {types.map((t) => (
              <option key={t.id} value={t.key}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* File Drop Zone */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            JSON File <span className="text-red-500">*</span>
          </label>
          <JsonFileDropZone
            file={form.file}
            error={form.previewError}
            onChange={handleFileChange}
            onError={handleFileError}
          />
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
