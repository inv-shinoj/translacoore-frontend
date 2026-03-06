"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Projects", href: "/admin/project", icon: "📁" },
  { label: "Forms", href: "/admin/forms", icon: "📝" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Settings", href: "/admin/dashboard/settings", icon: "⚙️" },
];

const managerNav: NavItem[] = [
  { label: "Projects", href: "/manager/project", icon: "📁" },
];

const employeeNav: NavItem[] = [
  { label: "My Projects", href: "/employee/project", icon: "📁" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const role = useAppSelector((s) => s.auth.user?.role);

  const navItems =
    role === "Manager"
      ? managerNav
      : role === "Team Lead" || role === "Employee"
      ? employeeNav
      : adminNav;

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-gray-900 text-white flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-800">
        <h1 className="text-lg font-bold tracking-tight">Translacore</h1>
        <p className="text-xs text-gray-400 mt-0.5">Translation Manager</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-gray-800 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-800 text-xs text-gray-500">
        © 2026 Translacore
      </div>
    </aside>
  );
}
