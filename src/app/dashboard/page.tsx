"use client";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import StatCard from "@/components/dashboard/StatCard";
import ProjectList from "@/components/dashboard/ProjectList";
import ProjectTable from "@/components/dashboard/ProjectTable";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Overview of your translation projects and activity."
        actions={
          <>
            <Button variant="secondary">Export</Button>
            <Button>New Project</Button>
          </>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Projects"
          value={12}
          change="+2 this month"
          changeType="positive"
          icon="📁"
        />
        <StatCard
          label="Active Forms"
          value={48}
          change="+5 this week"
          changeType="positive"
          icon="📝"
        />
        <StatCard
          label="Completion Rate"
          value="73%"
          change="+8% from last month"
          changeType="positive"
          icon="✅"
        />
        <StatCard
          label="Team Members"
          value={9}
          change="2 pending invites"
          changeType="neutral"
          icon="👥"
        />
      </div>

      {/* Project Cards */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Active Projects
        </h2>
        <ProjectList />
      </div>

      {/* Two-column: Table + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProjectTable />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </>
  );
}
