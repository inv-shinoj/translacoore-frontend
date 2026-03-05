"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProjects } from "@/store/slices/projectSlice";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ProjectStatusBadge from "@/components/project/ProjectStatusBadge";

export default function EmployeeProjectsPage() {
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector((s) => s.project);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <>
      <PageHeader
        title="My Projects"
        description={`Welcome, ${user?.full_name ?? user?.email}. Here are your assigned projects.`}
      />

      {loading && <LoadingState message="Loading your projects…" />}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          icon="📋"
          title="No projects assigned yet"
          description="You'll see projects here once a manager assigns you to one."
        />
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/employee/project/${project.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={project.name} size="sm" />
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">
                    {project.name}
                  </h3>
                </div>
                <ProjectStatusBadge status={project.status_display} />
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Form type</span>
                  <span className="font-medium text-gray-700">{project.form_type_name}</span>
                </div>
                {project.my_role && (
                  <div className="flex items-center justify-between">
                    <span>Your role</span>
                    <Badge variant="info">{project.my_role}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Created by</span>
                  <span className="font-medium text-gray-700">
                    {project.created_by_name ?? "—"}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-indigo-600 font-medium group-hover:underline">
                View details 
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
