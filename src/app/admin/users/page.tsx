"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers, updateUser, deleteUser, setUserActive } from "@/store/slices/usersSlice";
import { User, UserRole } from "@/types/user";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import CreateUserModal from "@/components/users/CreateUserModal";

const ROLE_OPTIONS: { label: UserRole; value: number }[] = [
  { label: "Admin", value: 1 },
  { label: "Manager", value: 2 },
  { label: "Team Lead", value: 3 },
  { label: "Employee", value: 4 },
];

const roleBadgeVariant: Record<UserRole, "error" | "warning" | "info" | "default"> = {
  Admin: "error",
  Manager: "warning",
  "Team Lead": "info",
  Employee: "default",
};

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { list: users, loading, error } = useAppSelector((s) => s.users);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRoleChange = async (user: User, newRoleValue: number) => {
    const result = await dispatch(updateUser({ id: user.id, role: newRoleValue }));
    if (updateUser.fulfilled.match(result)) {
      toast.success(`Role updated for ${user.full_name ?? user.email}`);
    } else {
      toast.error((result.payload as string) ?? "Failed to update role");
    }
  };

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Deactivate ${user.full_name ?? user.email}? They will lose access immediately.`)) return;
    const result = await dispatch(setUserActive({ id: user.id, is_active: false }));
    if (setUserActive.fulfilled.match(result)) {
      toast.success(`${user.full_name ?? user.email} has been deactivated.`);
    } else {
      toast.error((result.payload as string) ?? "Failed to deactivate user");
    }
  };

  const handleActivate = async (user: User) => {
    const result = await dispatch(setUserActive({ id: user.id, is_active: true }));
    if (setUserActive.fulfilled.match(result)) {
      toast.success(`${user.full_name ?? user.email} has been activated.`);
    } else {
      toast.error((result.payload as string) ?? "Failed to activate user");
    }
  };

  const isAdmin = currentUser?.role === "Admin";

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage team members and their roles."
        actions={
          isAdmin ? (
            <Button onClick={() => setShowCreate(true)}>+ Add User</Button>
          ) : undefined
        }
      />

      {loading && <LoadingState message="Loading users…" />}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <EmptyState
          title="No users found"
          description="Add team members to get started."
        />
      )}

      {!loading && users.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name ?? user.email} size="sm" />
                      <span className="font-medium text-gray-900">
                        {user.full_name ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        value={ROLE_OPTIONS.find((r) => r.label === user.role)?.value ?? 4}
                        onChange={(e) => handleRoleChange(user, Number(e.target.value))}
                        disabled={!user.is_active}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant={roleBadgeVariant[user.role] ?? "default"}>
                        {user.role}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.is_active ? "success" : "default"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      {user.is_active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeactivate(user)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => handleActivate(user)}
                        >
                          Activate
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
