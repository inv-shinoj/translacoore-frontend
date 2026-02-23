"use client";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export default function TopBar() {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-72">
        <input
          type="text"
          placeholder="Search projects, forms..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        {user && (
          <div className="flex items-center gap-3">
            <Avatar name={user.email} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700 leading-tight">
                {user.email}
              </p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(logout())}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
