"use client";

import { useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import StatCard from "@/components/dashboard/StatCard";
import ProjectList from "@/components/dashboard/ProjectList";
import ProjectTable from "@/components/dashboard/ProjectTable";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProjects } from "@/store/slices/dashboadSlice";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { projects, loading } = useAppSelector(state => state.dashboard);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const activeProjects = projects.filter(p => p.status_display === "Active");
  const completedProjects = projects.filter(p => p.status_display === "Completed");

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Overview of your translation projects and activity."
        actions={
          <>
            <Button variant="secondary">Export</Button>
          </>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Projects"
          value={loading ? "..." : projects.length}
          icon="📁"
        />
        <StatCard
          label="Active Projects"
          value={loading ? "..." : activeProjects.length}
          icon="🚀"
        />
        <StatCard
          label="Completed"
          value={loading ? "..." : completedProjects.length}
          icon="✅"
        />
        <StatCard
          label="Completion Rate"
          value={
            loading || projects.length === 0
              ? "—"
              : `${Math.round((completedProjects.length / projects.length) * 100)}%`
          }
          icon="📊"
        />
      </div>

      {/* Two-column: Table + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProjectTable projects={projects} />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </>
  );
}
