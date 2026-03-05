"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import FilterTabs, { FilterTab } from "@/components/ui/FilterTabs";
import TableFooter from "@/components/ui/TableFooter";
import UploadPanel from "@/components/forms/UploadPanel";
import { FormSchema, FormTypeKey } from "@/types/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import {
  fetchFormTypes,
  fetchFormSchemas,
  activateSchema,
  deleteSchema,
} from "@/store/slices/formSlice";


export default function FormsPage() {
  const dispatch = useAppDispatch();
  const { types, schemas, loading, submitting } = useAppSelector(state => state.form);
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

  const filterTabs: FilterTab<FormTypeKey | "All">[] = [
    { key: "All", label: "All", count: schemas.length },
    ...types.map(t => ({
      key: t.key as FormTypeKey | "All",
      label: t.name,
      count: schemas.filter(s => s.form_type === t.key).length,
    })),
  ];

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
              onClick={async () => {
                const result = await dispatch(activateSchema({ id: s.id, form_type: s.form_type }));
                if (activateSchema.fulfilled.match(result)) {
                  toast.success("Schema activated.");
                } else {
                  toast.error(result.error?.message ?? "Failed to activate schema.");
                }
              }}
            >
              Activate
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={submitting}
              onClick={async () => {
                const result = await dispatch(deleteSchema(s.id));
                if (deleteSchema.fulfilled.match(result)) {
                  toast.success("Schema deleted.");
                } else {
                  toast.error(result.error?.message ?? "Failed to delete schema.");
                }
              }}
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
        <div className="xl:col-span-1">
          <UploadPanel
            types={types}
            submitting={submitting}
          />
        </div>

        {/* Schema List */}
        <div className="xl:col-span-2">
          <Card padding="none">
            {/* Header + filter tabs */}
            <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-900 flex-1">Uploaded Schemas</h2>
              <FilterTabs
                tabs={filterTabs}
                active={filterType}
                onChange={setFilterType}
              />
            </div>

            {loading ? (
              <LoadingState message="Loading schemas…" />
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

            <TableFooter shown={filtered.length} total={schemas.length} label="schemas" />
          </Card>
        </div>
      </div>
    </>
  );
}
