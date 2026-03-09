"use client";

import { useEffect } from "react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import DocumentStatusBadge from "@/components/project/DocumentStatusBadge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDocuments, deleteDocument, retryDocument } from "@/store/slices/documentsSlice";
import { DocumentFile } from "@/types/api";
import { toast } from "sonner";

interface DocumentListProps {
  projectId: string;
  canDelete?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ projectId, canDelete = false }: DocumentListProps) {
  const dispatch = useAppDispatch();
  const { documents, loading, retrying } = useAppSelector((s) => s.documents);

  useEffect(() => {
    if (projectId) dispatch(fetchDocuments(projectId));
  }, [projectId, dispatch]);

  const handleRetry = async (docId: string, filename: string) => {
    const result = await dispatch(retryDocument({ projectId, docId }));
    if (retryDocument.fulfilled.match(result)) {
      toast.success(`"${filename}" re-translated successfully.`);
    } else {
      toast.error(`Retry failed: ${result.payload ?? "Unknown error"}`);
    }
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"? This will also remove files from storage.`)) return;
    const result = await dispatch(deleteDocument({ projectId, docId }));
    if (deleteDocument.fulfilled.match(result)) {
      toast.success(`"${filename}" deleted.`);
    } else {
      toast.error("Failed to delete document.");
    }
  };

  const columns = [
    {
      key: "filename",
      header: "File",
      render: (d: DocumentFile) => (
        <div>
          {d.source_download_url ? (
            <a
              href={d.source_download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[200px] block"
              title="Download source file"
            >
              {d.original_filename}
            </a>
          ) : (
            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
              {d.original_filename}
            </p>
          )}
          <p className="text-xs text-gray-400 uppercase">{d.file_type_display}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (d: DocumentFile) => <DocumentStatusBadge status={d.status_display} />,
    },
    {
      key: "languages",
      header: "Languages",
      render: (d: DocumentFile) => (
        <span className="text-sm text-gray-600">
          {d.source_language.toUpperCase()} → {d.target_language.toUpperCase()}
        </span>
      ),
    },
    {
      key: "size",
      header: "Size",
      render: (d: DocumentFile) => (
        <span className="text-sm text-gray-500">{formatBytes(d.file_size)}</span>
      ),
    },
    {
      key: "uploaded_by",
      header: "Uploaded By",
      render: (d: DocumentFile) => (
        <span className="text-sm text-gray-600">{d.uploaded_by_name || "—"}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (d: DocumentFile) => (
        <span className="text-xs text-gray-500">
          {new Date(d.created_at).toLocaleDateString("en-US", {
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
      render: (d: DocumentFile) => (
        <div className="flex items-center gap-1 justify-end">
          {d.status_display === "Completed" && d.translated_download_url && (
            <a
              href={d.translated_download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition-colors"
            >
              Download
            </a>
          )}
          {d.status_display === "Failed" && d.source_download_url !== null && (
            <Button
              variant="secondary"
              size="sm"
              disabled={retrying.includes(d.id)}
              onClick={() => handleRetry(d.id, d.original_filename)}
            >
              {retrying.includes(d.id) ? "Retrying…" : "Retry"}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDelete(d.id, d.original_filename)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12 gap-2">
          <Spinner size="md" />
          <span className="text-sm text-gray-500">Loading documents…</span>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">
          Documents{" "}
          {documents.length > 0 && (
            <span className="text-gray-400 font-normal">({documents.length})</span>
          )}
        </h2>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No documents yet"
          description="Upload a document above to start translating."
        />
      ) : (
        <Table columns={columns} data={documents} keyExtractor={(d) => d.id} />
      )}
    </Card>
  );
}
