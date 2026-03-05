import AuthGuard from "@/components/guards/AuthGuard";
import RoleGuard from "@/components/guards/RoleGuard";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["Manager"]}>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <div className="ml-60">
            <TopBar />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
