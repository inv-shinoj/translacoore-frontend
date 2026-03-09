"use client";

import { useCallback, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { uploadDocument } from "@/store/slices/documentsSlice";
import { toast } from "sonner";

const ALLOWED_EXTENSIONS = [".txt", ".pdf", ".docx", ".xlsx", ".csv"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface DocumentUploadPanelProps {
  projectId: string;
}

export default function DocumentUploadPanel({ projectId }: DocumentUploadPanelProps) {
  const dispatch = useAppDispatch();
  const { uploading } = useAppSelector((s) => s.documents);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`;
    }
    return null;
  };

  const handleUpload = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      const result = await dispatch(uploadDocument({ projectId, file }));
      if (uploadDocument.fulfilled.match(result)) {
        const doc = result.payload;
        if (doc.status_display === "Completed") {
          toast.success(`"${doc.original_filename}" translated successfully.`);
        } else if (doc.status_display === "Failed") {
          toast.error(`Translation failed: ${doc.error_message || "Unknown error"}`);
        } else {
          toast.info(`"${doc.original_filename}" uploaded.`);
        }
      } else {
        toast.error(typeof result.payload === "string" ? result.payload : "Upload failed.");
      }
    },
    [dispatch, projectId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = ""; // reset for re-upload
  };

  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Upload Document</h2>
      <p className="text-xs text-gray-500 mb-4">
        Upload a file to translate. Supported: TXT, PDF, DOCX, XLSX, CSV (max 10 MB).
        <br />
        Translation: Japanese → English (synchronous — please wait for completion).
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-gray-900 bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p className="text-sm text-gray-600 font-medium">
              Uploading &amp; translating…
            </p>
            <p className="text-xs text-gray-400">
              This may take a moment for large files.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">📄</span>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              TXT, PDF, DOCX, XLSX up to 10 MB
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
