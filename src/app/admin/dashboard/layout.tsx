import AuthGuard from "@/components/guards/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-60">
          <TopBar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
